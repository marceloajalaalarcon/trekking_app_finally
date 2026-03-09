import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { dbService, CheckinRecord } from '../../services/TrekkingDatabase';
import { fetchMyEvents, authFetch, UnifiedEvent } from '../../services/api';

type SubscribedEvent = {
    id: string;
    title: string;
    date: string;
    location: string;
    status: string;
    hasCertificate: boolean;
    groupName: string | null;
    isTracking: boolean;
    image: string;
    type: 'trekking' | 'standard';
    teamId: string | null;
};

const TABS = [
    { id: 'Inscrito', label: 'Inscrito' },
    { id: 'Presença Confirmada', label: 'Presença Confirmada' },
    { id: 'Finalizado', label: 'Finalizado' },
    { id: 'Ausente', label: 'Ausente' },
];

function mapToSubscribed(e: any): SubscribedEvent {
    const isTrekking = e.type === 'trekking';

    // Lógica para definir o status amigável
    // e.status vem do banco: 'REGISTERED', 'CONFIRMED', 'ACTIVE', 'COMPLETED'
    let uiStatus = 'Inscrito';

    const now = new Date().getTime();
    const endDate = e.end_date ? new Date(e.end_date).getTime() : 0;
    const isEnded = endDate > 0 && endDate < now;

    if (e.status === 'CONFIRMED' || e.status === 'ACTIVE' || e.status === 'COMPLETED') {
        if (isEnded) {
            uiStatus = 'Finalizado'; // Evento acabou + presença confirmada
        } else {
            uiStatus = 'Presença Confirmada'; // Evento ainda rolando
        }
    } else if (isEnded) {
        uiStatus = 'Ausente'; // Evento acabou + nunca bipou
    } else {
        uiStatus = 'Inscrito'; // Ainda não leu o ingresso e não encerrou
    }

    return {
        id: e.id,
        title: e.name || e.title || 'Evento',
        date: e.start_date ? new Date(e.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Data indefinida',
        location: e.location || 'Local a definir',
        status: uiStatus,
        hasCertificate: e.hasCertificate || false,
        groupName: e.team_name || null,
        isTracking: isTrekking,
        image: isTrekking
            ? 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600'
            : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600',
        type: e.type,
        teamId: e.team_id || null,
    };
}

// Memoized Event Item
const EventItem = React.memo(({ item, onPress }: { item: SubscribedEvent, onPress: (id: string, teamId: string | null, type: 'trekking' | 'standard') => void }) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(item.id, item.teamId, item.type)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Image source={{ uri: item.image }} style={styles.cardCover} />
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.eventTitle}>{item.title}</Text>

                <View style={styles.infoRow}>
                    <Feather name="calendar" size={16} color={Colors.gray} />
                    <Text style={styles.infoText}>{item.date}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Feather name="map-pin" size={16} color={Colors.gray} />
                    <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Feather name={item.groupName ? "users" : "user"} size={16} color={item.groupName ? Colors.green : Colors.gray} />
                    <View style={[styles.groupBadge, item.groupName && { backgroundColor: Colors.green }]}>
                        <Text style={[styles.groupBadgeText, item.groupName && { color: Colors.black }]}>
                            {item.groupName ? item.groupName : 'Eu'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionsRow}>
                    {item.hasCertificate && (
                        <TouchableOpacity
                            style={styles.certificateBtn}
                            onPress={() => router.push(`/event/certificate?id=${item.id}` as any)}
                        >
                            <Feather name="download" size={16} color={Colors.white} />
                            <Text style={styles.certificateBtnText}>Certificado</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {item.isTracking && item.status !== 'Ausente' && (
                            <TouchableOpacity style={styles.qrBtn} onPress={() => router.push('/camera')}>
                                <Feather name="camera" size={20} color={Colors.green} />
                            </TouchableOpacity>
                        )}
                        {item.status !== 'Ausente' && (
                            <TouchableOpacity
                                style={styles.qrBtn}
                                onPress={() => router.push({ pathname: '/event/ticket', params: { eventId: item.id, type: item.type, teamId: item.teamId } } as any)}
                            >
                                <MaterialCommunityIcons name="qrcode-scan" size={20} color={Colors.green} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default function SubscribedScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Inscrito');
    const [subscribedEvents, setSubscribedEvents] = useState<SubscribedEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [pendingSync, setPendingSync] = useState<CheckinRecord[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const loadEvents = useCallback(async () => {
        try {
            const evts = await fetchMyEvents();
            if (evts && evts.length >= 0) {
                await dbService.cacheMyEventsList(JSON.stringify(evts));
                setSubscribedEvents(evts.map(mapToSubscribed));
            }
        } catch (err: any) {
            console.log('API Failed, trying to load from local cache...');
            const cachedEvents = await dbService.getCachedMyEventsList();
            if (cachedEvents) {
                setSubscribedEvents(cachedEvents.map(mapToSubscribed));
            } else {
                console.error('No cached events found', err);
            }
        } finally {
            setLoadingEvents(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadEvents();
    }, [loadEvents]);

    useFocusEffect(
        useCallback(() => {
            const loadQueue = async () => {
                await dbService.init();
                const unsynced = await dbService.getUnsyncedCheckins();
                setPendingSync(unsynced);
            };
            loadQueue();
        }, [])
    );

    const handleSync = async () => {
        if (pendingSync.length === 0) return;
        setIsSyncing(true);
        try {
            const events = [...new Set(pendingSync.map(p => p.trekking_id))];

            for (const eId of events) {
                const eventRecords = pendingSync.filter(p => p.trekking_id === eId);
                const payload = {
                    records: eventRecords.map(r => ({
                        qr_hash: r.qr_data,
                        device_time: new Date(r.scanned_at).toISOString()
                    })),
                    check_in_server_time: new Date().toISOString(),
                    check_in_device_time: new Date().toISOString(),
                    team_id: "1" // MOCKED TEAM ID FOR NOW
                };

                const res = await authFetch(`/trekkings/${eId}/tracking/sync`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    await dbService.markAsSynced(eventRecords.map(r => r.id!));
                }
            }

            setPendingSync([]);
            alert('Sincronização concluída com sucesso!');
        } catch (err: any) {
            console.error(err);
            alert('Falha na sincronização. Verifique sua conexão.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handlePressEvent = useCallback((id: string, teamId: string | null, type: 'trekking' | 'standard') => {
        router.push({ pathname: `/subscribed/${id}`, params: { type, teamId: teamId || undefined } } as any);
    }, [router]);

    const renderItem = useCallback(({ item }: any) => {
        return <EventItem item={item} onPress={handlePressEvent} />;
    }, [handlePressEvent]);

    const keyExtractor = useCallback((item: SubscribedEvent) => item.id, []);

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Meus Eventos</Text>
                <Text style={styles.headerSubtitle}>Eventos que você está inscrito</Text>
            </View>

            {pendingSync.length > 0 && (
                <View style={styles.syncBanner}>
                    <View style={styles.syncInfo}>
                        <Feather name="cloud-off" size={20} color={Colors.white} />
                        <View>
                            <Text style={styles.syncTitle}>Modo Offline ({pendingSync.length})</Text>
                            <Text style={styles.syncDesc}>Você tem check-ins na fila.</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.syncButton, isSyncing && { opacity: 0.5 }]}
                        onPress={handleSync}
                        disabled={isSyncing}
                    >
                        <Text style={styles.syncButtonText}>
                            {isSyncing ? 'Enviando...' : 'Sincronizar'}
                        </Text>
                        {!isSyncing && <Feather name="upload-cloud" size={16} color={Colors.white} />}
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.tabsContainer}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={[styles.tabButtonText, activeTab === tab.id && styles.tabButtonTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={subscribedEvents.filter((event) => {
                    return event.status === activeTab;
                })}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} colors={[Colors.green]} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    header: {
        paddingHorizontal: Theme.spacing.l,
        marginBottom: Theme.spacing.l,
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 32,
        fontWeight: '800',
    },
    headerSubtitle: {
        color: Colors.gray,
        fontSize: 16,
        marginTop: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: Theme.spacing.l,
        marginBottom: Theme.spacing.l,
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.cardBg,
        borderWidth: 1,
        borderColor: Colors.darkGray,
    },
    tabButtonActive: {
        backgroundColor: Colors.green,
        borderColor: Colors.green,
    },
    tabButtonText: {
        color: Colors.gray,
        fontSize: 12,
        fontWeight: '600',
    },
    tabButtonTextActive: {
        color: Colors.black,
    },
    listContent: {
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 120, // Extra padding for custom tab bar
    },
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: Theme.borderRadius.large,
        marginBottom: Theme.spacing.l,
        overflow: 'hidden',
    },
    cardHeader: {
        height: 140,
        width: '100%',
        position: 'relative',
    },
    cardCover: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.darkGray,
        backdropFilter: 'blur(10px)'
    },
    statusText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '700',
    },
    cardBody: {
        padding: Theme.spacing.l,
    },
    eventTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        color: Colors.gray,
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    groupBadge: {
        marginLeft: 8,
        backgroundColor: Colors.darkGray,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    groupBadgeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    syncBanner: {
        backgroundColor: Colors.darkGray,
        marginHorizontal: Theme.spacing.l,
        marginBottom: Theme.spacing.l,
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.large,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F43F5E',
    },
    syncInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    syncTitle: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 14,
    },
    syncDesc: {
        color: Colors.gray,
        fontSize: 12,
        marginTop: 2,
    },
    syncButton: {
        backgroundColor: '#F43F5E',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    syncButtonText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '800',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.darkGray,
    },
    certificateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.darkGray,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    certificateBtnText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    qrBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.green,
    }
});
