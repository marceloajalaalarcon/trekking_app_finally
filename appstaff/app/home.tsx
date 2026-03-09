import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMyStaffRoles, getStoredUser } from '../services/api';

export default function HomeDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Moderador');
    const [permissionBitmask, setPermissionBitmask] = useState(0);
    const [staffRole, setStaffRole] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [user, roles] = await Promise.all([
                    getStoredUser(),
                    fetchMyStaffRoles(),
                ]);
                if (user?.name) setUserName(user.name);
                if (roles && roles.length > 0) {
                    // Use the first active trekking assignment
                    const activeRole = roles[0];
                    setStaffRole(activeRole);
                    setPermissionBitmask(activeRole.permissions || 0);
                }
            } catch (err) {
                console.error('Failed to load staff roles:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const userRole = staffRole
        ? `${staffRole.role_name} (Permissões: +${permissionBitmask})`
        : 'Sem atribuição de evento';

    return (
        <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Olá, {userName}</Text>
                        <View style={styles.roleBadge}>
                            <Feather name="shield" size={12} color={Colors.black} />
                            <Text style={styles.roleText}>{userRole}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
                        <Feather name="log-out" size={20} color={Colors.gray} />
                    </TouchableOpacity>
                </View>

                {staffRole && (
                    <View style={styles.eventInfoCard}>
                        <Text style={styles.eventLabel}>EVENTO ATUAL</Text>
                        <Text style={styles.eventTitle}>{staffRole.trekking_name}</Text>
                        {staffRole.trekking_location && (
                            <View style={styles.syncStatus}>
                                <Feather name="map-pin" size={12} color={Colors.green} />
                                <Text style={styles.syncText}>{staffRole.trekking_location}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            <Text style={styles.sectionTitle}>Ferramentas de Moderação</Text>

            <View style={styles.grid}>
                {/* Permission +1 */}
                <TouchableOpacity
                    style={[styles.card, !(permissionBitmask & 1) && { opacity: 0.5 }]}
                    onPress={() => router.push('/scan')}
                    activeOpacity={0.8}
                    disabled={!(permissionBitmask & 1)}
                >
                    <View style={[styles.cardIconBox, { backgroundColor: (permissionBitmask & 1) ? 'rgba(0, 255, 65, 0.1)' : 'rgba(136, 136, 136, 0.1)' }]}>
                        <MaterialCommunityIcons name="barcode-scan" size={24} color={(permissionBitmask & 1) ? Colors.green : Colors.gray} />
                    </View>
                    <Text style={styles.cardTitle}>Bipar Ingressos</Text>
                    <Text style={styles.cardDesc}>Validação online na portaria</Text>
                    <View style={styles.permissionTag}>
                        <Text style={styles.permissionText}>REQ: +1</Text>
                    </View>
                </TouchableOpacity>

                {/* Permission +2 */}
                <TouchableOpacity
                    style={[styles.card, !(permissionBitmask & 2) && { opacity: 0.5 }]}
                    onPress={() => router.push('/tasks')}
                    activeOpacity={0.8}
                    disabled={!(permissionBitmask & 2)}
                >
                    <View style={[styles.cardIconBox, { backgroundColor: (permissionBitmask & 2) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(136, 136, 136, 0.1)' }]}>
                        <Feather name="list" size={24} color={(permissionBitmask & 2) ? "#3b82f6" : Colors.gray} />
                    </View>
                    <Text style={styles.cardTitle}>Atividades Extras</Text>
                    <Text style={styles.cardDesc}>Postos offline (Faltas/Bônus)</Text>
                    <View style={styles.permissionTag}>
                        <Text style={styles.permissionText}>REQ: +2</Text>
                    </View>
                </TouchableOpacity>

                {/* Permission +8 */}
                <TouchableOpacity
                    style={[styles.card, !(permissionBitmask & 8) && { opacity: 0.5 }]}
                    onPress={() => router.push('/ideal-times')}
                    activeOpacity={0.8}
                    disabled={!(permissionBitmask & 8)}
                >
                    <View style={[styles.cardIconBox, { backgroundColor: (permissionBitmask & 8) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(136, 136, 136, 0.1)' }]}>
                        <Feather name="clock" size={24} color={(permissionBitmask & 8) ? "#ef4444" : Colors.gray} />
                    </View>
                    <Text style={styles.cardTitle}>Tempos Ideais</Text>
                    <Text style={styles.cardDesc}>Sincronização de PCs</Text>
                    <View style={styles.permissionTag}>
                        <Text style={styles.permissionText}>REQ: +8</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.syncCard}>
                    <View style={styles.syncCardContent}>
                        <Feather name="refresh-cw" size={20} color={Colors.white} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.syncCardTitle}>Sincronizar Lote Offline</Text>
                            <Text style={styles.syncCardDesc}>Nenhum registro pendente.</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
        padding: Theme.spacing.l,
    },
    header: {
        marginBottom: 32,
        marginTop: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.white,
        marginBottom: 4,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.green,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.black,
        marginLeft: 4,
    },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },
    eventInfoCard: {
        backgroundColor: '#151515',
        borderRadius: Theme.borderRadius.large,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.greenDim,
    },
    eventLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.green,
        letterSpacing: 1,
        marginBottom: 4,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 12,
    },
    syncStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.green,
        marginRight: 6,
    },
    syncText: {
        fontSize: 12,
        color: Colors.gray,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 16,
    },
    grid: {
        gap: 16,
    },
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: Theme.borderRadius.large,
        padding: 20,
        borderWidth: 1,
        borderColor: '#222',
        position: 'relative',
        overflow: 'hidden',
    },
    cardIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: Colors.gray,
    },
    permissionTag: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#333',
    },
    permissionText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.gray,
    },
    syncCard: {
        backgroundColor: Colors.greenDim,
        borderRadius: Theme.borderRadius.large,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.green,
        marginTop: 8,
    },
    syncCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
    },
    syncCardDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
});
