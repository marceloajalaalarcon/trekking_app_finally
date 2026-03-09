import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect host machine IP from Expo dev server for physical device support
const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost ?? Constants.manifest?.debuggerHost;
    if (debuggerHost) {
        const host = debuggerHost.split(':')[0];
        return `http://${host}:3333`;
    }
    // Fallback for emulators
    if (Platform.OS === 'android') return 'http://10.0.2.2:3333';
    return 'http://localhost:3333';
};

const BASE_URL = getBaseUrl();
console.log('[API] BASE_URL resolved to:', BASE_URL);

const STORAGE_KEYS = {
    accessToken: '@Tracking:token',
    refreshToken: '@Tracking:refreshToken',
    user: '@Tracking:user',
};

export type UnifiedEvent = {
    id: string;
    title: string;
    subtitle: string;
    time: string;
    location: string;
    description: string;
    dateString: string;
    date: string | null;
    endDate: string | null;
    type: 'trekking' | 'standard';
    highlighted: boolean;
    attendeesCount: number;
    isActive: boolean;
    isRegistrationOpen: boolean;
    hasCertificate: boolean;
    isGroupEvent: boolean;
    ownerName: string;
};

// ─── Auth Helpers ────────────────────────────────

async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.accessToken);
}

async function refreshAccessToken(): Promise<string | null> {
    try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.refreshToken);
        if (!refreshToken) return null;

        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        await AsyncStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
        if (data.refresh_token) {
            await AsyncStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
        }
        return data.access_token;
    } catch {
        return null;
    }
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const token = await getToken();
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
        }
    }

    return res;
}

// ─── Auth: Login / Register / Logout ─────────────

export async function loginUser(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Credenciais inválidas');
    }

    const data = await res.json();
    await AsyncStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    return data.user;
}

export async function registerUser(name: string, email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao criar conta');
    }

    const data = await res.json();
    await AsyncStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    return data.user;
}

export async function logoutUser() {
    try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.refreshToken);
        if (refreshToken) {
            await authFetch('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
        }
    } catch { /* silent — clear storage anyway */ }

    await AsyncStorage.multiRemove([
        STORAGE_KEYS.accessToken,
        STORAGE_KEYS.refreshToken,
        STORAGE_KEYS.user,
    ]);
}

export async function getStoredUser() {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
}

export async function isLoggedIn(): Promise<boolean> {
    const token = await getToken();
    return !!token;
}

// ─── User Profile & Stats ────────────────────────

export async function fetchUserProfile() {
    const res = await authFetch('/auth/profile');
    if (!res.ok) throw new Error('Erro ao carregar perfil');
    return res.json();
}

export async function fetchUserStats() {
    const res = await authFetch('/users/me/stats');
    if (!res.ok) throw new Error('Erro ao carregar estatísticas');
    return res.json();
}

export async function updateProfile(data: { name?: string; email?: string }) {
    const res = await authFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao atualizar perfil');
    }
    const updatedUser = await res.json();
    // Update local storage
    const storedUser = await getStoredUser();
    if (storedUser) {
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ ...storedUser, ...updatedUser }));
    }
    return updatedUser;
}

// ─── Teams ───────────────────────────────────────

export async function fetchMyTeams() {
    const res = await authFetch('/teams/my');
    if (!res.ok) throw new Error('Erro ao carregar times');
    return res.json();
}

export async function createTeam(name: string) {
    const res = await authFetch('/teams', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao criar time');
    }
    return res.json();
}

export async function fetchTeamById(id: string) {
    const res = await authFetch(`/teams/${id}`);
    if (!res.ok) throw new Error('Time não encontrado');
    return res.json();
}

export async function inviteToTeam(teamId: string, email: string) {
    const res = await authFetch(`/teams/${teamId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao convidar');
    }
    return res.json();
}

export async function leaveTeam(teamId: string) {
    const res = await authFetch(`/teams/${teamId}/leave`, { method: 'POST' });
    if (!res.ok) throw new Error('Erro ao sair do time');
    return res.json();
}

export async function removeTeamMember(teamId: string, userId: string) {
    const res = await authFetch(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover membro');
    return res.json();
}

// ─── Event Registration ──────────────────────────

export async function registerForEvent(eventId: string, type: 'trekking' | 'standard', teamId?: string) {
    if (type === 'trekking') {
        const res = await authFetch(`/trekkings/${eventId}/register`, {
            method: 'POST',
            body: JSON.stringify({ team_id: teamId }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erro ao inscrever');
        }
        return res.json();
    } else {
        const res = await authFetch(`/events-standard/${eventId}/register`, {
            method: 'POST',
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erro ao inscrever');
        }
        return res.json();
    }
}

export async function cancelRegistration(eventId: string, type: 'trekking' | 'standard', teamId?: string) {
    if (type === 'trekking') {
        if (!teamId) throw new Error('ID da equipe não encontrado. Inscrição inválida.');
        const res = await authFetch(`/trekkings/${eventId}/register/${teamId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao cancelar inscrição');
        return res.json();
    } else {
        const res = await authFetch(`/events-standard/${eventId}/register`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao cancelar inscrição');
        return res.json();
    }
}

// ─── My Events (subscribed) ──────────────────────

export async function fetchMyEvents() {
    const res = await authFetch('/users/me/events');
    if (!res.ok) throw new Error('Erro ao carregar meus eventos');
    return res.json();
}

// ─── Certificates ────────────────────────────────

export async function fetchMyCertificates() {
    const res = await authFetch('/certificates/my');
    if (!res.ok) throw new Error('Erro ao carregar certificados');
    return res.json();
}

export async function fetchCertificateByHash(hash: string) {
    const res = await fetch(`${BASE_URL}/certificates/verify/${hash}`);
    if (!res.ok) throw new Error('Certificado não encontrado');
    return res.json();
}

// ─── Event Ranking ───────────────────────────────

export async function fetchEventRanking(eventId: string) {
    const res = await authFetch(`/trekkings/${eventId}/ranking`);
    if (!res.ok) throw new Error('Erro ao carregar ranking');
    return res.json();
}

// ─── Events (all) ────────────────────────────────

function formatTime(dateStr: string | null): string {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateString(dateStr: string | null): string {
    if (!dateStr) return '--/--';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function normalizeTrekking(t: any): UnifiedEvent {
    return {
        id: t.id,
        title: t.name,
        subtitle: 'Trekking',
        time: formatTime(t.start_date),
        location: t.location || 'Local a definir',
        description: t.description || '',
        dateString: formatDateString(t.start_date),
        date: t.start_date || null,
        endDate: t.end_date || null,
        type: 'trekking',
        highlighted: false,
        attendeesCount: t._count?.teams || t._count?.members || 0,
        isActive: t.is_active ?? true,
        isRegistrationOpen: t.is_registration_open ?? false,
        hasCertificate: false,
        isGroupEvent: true,
        ownerName: t.owner?.name || 'Organizador',
    };
}

function normalizeStandard(e: any): UnifiedEvent {
    return {
        id: e.id,
        title: e.name,
        subtitle: e.is_group_event ? 'Evento em Grupo' : 'Evento Individual',
        time: formatTime(e.date),
        location: e.location || 'Local a definir',
        description: e.description || '',
        dateString: formatDateString(e.date),
        date: e.date || null,
        endDate: e.end_date || null,
        type: 'standard',
        highlighted: false,
        attendeesCount: e._count?.participants ?? e._count?.teams ?? 0,
        isActive: e.is_active ?? false,
        isRegistrationOpen: e.is_registration_open ?? false,
        hasCertificate: e.has_certificate ?? false,
        isGroupEvent: e.is_group_event ?? false,
        ownerName: e.owner?.name || 'Organizador',
    };
}

export async function fetchAllEvents(): Promise<UnifiedEvent[]> {
    const [trekkingsRes, standardRes] = await Promise.allSettled([
        authFetch('/trekkings'),
        authFetch('/events-standard'),
    ]);

    const trekkings: UnifiedEvent[] = [];
    const standards: UnifiedEvent[] = [];

    if (trekkingsRes.status === 'fulfilled' && trekkingsRes.value.ok) {
        const data = await trekkingsRes.value.json();
        if (Array.isArray(data)) {
            trekkings.push(...data.map(normalizeTrekking));
        }
    }

    if (standardRes.status === 'fulfilled' && standardRes.value.ok) {
        const data = await standardRes.value.json();
        if (Array.isArray(data)) {
            standards.push(...data.map(normalizeStandard));
        }
    }

    const all = [...trekkings, ...standards];
    all.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return all;
}

export async function fetchEventById(id: string, type: 'trekking' | 'standard'): Promise<any> {
    const path = type === 'trekking' ? `/trekkings/${id}` : `/events-standard/${id}`;
    const res = await authFetch(path);
    if (!res.ok) throw new Error('Evento não encontrado');
    return res.json();
}
