import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { fetchEventById, fetchEventRanking, fetchMyCertificates, fetchMyEvents } from '../../services/api';
import { dbService } from '../../services/TrekkingDatabase';

export default function SubscribedDetailsScreen() {
    const { id, type, teamId } = useLocalSearchParams<{ id: string; type?: string; teamId?: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [event, setEvent] = useState<any>(null);
    const [ranking, setRanking] = useState<any[]>([]);
    const [hasCertificate, setHasCertificate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>('Carregando...');

    const eventType = (type || 'trekking') as 'trekking' | 'standard';

    useEffect(() => {
        loadData();
    }, [id, type]);

    const loadData = async () => {
        if (!id) return;
        try {
            const data = await fetchEventById(id, eventType);
            setEvent(data);
            await dbService.cacheEventDetails(id, eventType, JSON.stringify(data));

            const myEvents = await fetchMyEvents().catch(() => []);
            const myEvent = myEvents.find((e: any) => e.id === id);
            if (myEvent) {
                setStatus(myEvent.status);
            } else {
                setStatus('REGISTERED');
            }

            if (eventType === 'trekking') {
                const rank = await fetchEventRanking(id).catch(() => []);
                setRanking(rank);
            }

            const certs = await fetchMyCertificates().catch(() => []);
            const hasCert = certs.some((c: any) => c.trekking_id === id || c.event_id === id);
            setHasCertificate(hasCert);
        } catch (err: any) {
            console.log(`API Failed for event ${id} (${eventType}):`, err?.message || err);
            console.log('Trying to load event from local cache...');
            const cachedEvent = await dbService.getCachedEventDetails(id);
            if (cachedEvent) {
                setEvent(cachedEvent);
            }
            // Try to get status separately even if main API failed
            try {
                const myEvents = await fetchMyEvents();
                const myEvent = myEvents.find((e: any) => e.id === id);
                if (myEvent) {
                    setStatus(myEvent.status);
                } else {
                    setStatus('REGISTERED');
                }
            } catch {
                // Both APIs failed — compute status from cached dates
                setStatus('REGISTERED');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 0), justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.green} />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 0), justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: Colors.gray, fontSize: 16 }}>Evento não encontrado.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={{ color: Colors.green, fontWeight: '700' }}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const eventName = event.name || 'Evento';
    const eventDate = eventType === 'trekking' ? event.start_date : event.date;
    const location = event.location || 'Local a definir';
    const description = event.description || '';
    const heroImage = eventType === 'trekking'
        ? 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600'
        : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600';

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '--';
        const d = new Date(dateStr);
        return `${d.getDate()} ${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}`;
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '--:--';
        const d = new Date(dateStr);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    // Check if event ended and ticket was never scanned
    const evtEndDate = eventType === 'trekking' ? event?.end_date : (event?.end_date || event?.date);
    const isEventEnded = evtEndDate ? new Date(evtEndDate).getTime() < Date.now() : false;
    const isConfirmed = status === 'CONFIRMED' || status === 'CHECKED_IN' || status === 'ACTIVE' || status === 'COMPLETED';
    const isAbsent = isEventEnded && !isConfirmed && status === 'REGISTERED';

    const getStatusText = () => {
        if (isAbsent) return 'AUSENTE';
        if (isConfirmed) return 'PRESENÇA CONFIRMADA';
        if (status === 'COMPLETED') return 'CONCLUÍDO';
        if (status === 'CANCELED') return 'CANCELADO';
        return 'CONFIRMADO';
    };

    const getStatusColor = () => {
        if (isAbsent) return '#ef4444';
        if (isConfirmed) return Colors.green;
        if (status === 'COMPLETED') return '#4ade80';
        if (status === 'CANCELED') return '#ef4444';
        return Colors.gray;
    };

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 0) }]} >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: heroImage }} style={styles.heroImage} />
                    <View style={styles.overlay} />
                    <View style={[styles.topActions, { top: Math.max(insets.top, 16) }]}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                            <Feather name="arrow-left" size={20} color={Colors.white} />
                        </TouchableOpacity>
                        <View style={styles.rightActions}>
                            <TouchableOpacity
                                style={styles.iconQrButton}
                                onPress={() => router.push({ pathname: '/event/ticket', params: { eventId: id, type: eventType, teamId: teamId || undefined } })}
                            >
                                <MaterialCommunityIcons name="qrcode-scan" size={20} color={Colors.green} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Status Badges */}
                    <View style={styles.badgesRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                            <Text style={styles.statusBadgeText}>{getStatusText()}</Text>
                        </View>
                        {ranking.length > 0 && (
                            <View style={styles.rankBadge}>
                                <Feather name="award" size={14} color="#FFD700" />
                                <Text style={styles.rankText}>Ranking Ativo</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.title}>{eventName}</Text>
                    <Text style={styles.hostedBy}>
                        Organizado por <Text style={styles.hostName}>{event.owner?.name || 'Organizador'}</Text>
                    </Text>

                    {/* Certificate Action */}
                    {hasCertificate && (
                        <TouchableOpacity
                            style={styles.certificateAction}
                            onPress={() => router.push({ pathname: '/event/certificate', params: { eventId: id } })}
                        >
                            <View style={styles.certificateIconRow}>
                                <Feather name="file-text" size={24} color={Colors.green} />
                                <View style={styles.certTextCol}>
                                    <Text style={styles.certTitle}>Certificado Disponível</Text>
                                    <Text style={styles.certSub}>Toque para visualizar</Text>
                                </View>
                            </View>
                            <Feather name="download" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    )}

                    {/* Info Cards */}
                    <View style={styles.infoCardsRow}>
                        <View style={styles.infoCard}>
                            <View style={styles.iconCircle}>
                                <Feather name="calendar" size={16} color={Colors.green} />
                            </View>
                            <Text style={styles.infoCardValue}>{formatDate(eventDate)}</Text>
                            <Text style={styles.infoCardLabel}>DATA</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <View style={styles.iconCircle}>
                                <Feather name="clock" size={16} color={Colors.green} />
                            </View>
                            <Text style={styles.infoCardValue}>{formatTime(eventDate)}</Text>
                            <Text style={styles.infoCardLabel}>HORÁRIO</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <View style={styles.iconCircle}>
                                <Feather name="map-pin" size={16} color={Colors.green} />
                            </View>
                            <Text style={[styles.infoCardValue, { fontSize: 12 }]} numberOfLines={1}>{location}</Text>
                            <Text style={styles.infoCardLabel}>LOCAL</Text>
                        </View>
                    </View>

                    {/* About */}
                    {description ? (
                        <>
                            <Text style={styles.sectionTitle}>Sobre o Evento</Text>
                            <Text style={styles.aboutText}>{description}</Text>
                        </>
                    ) : null}

                    {/* Ranking */}
                    {ranking.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Ranking do Evento</Text>
                            <View style={styles.rankingTable}>
                                <View style={styles.rankingHeader}>
                                    <Text style={styles.rankingHeaderPos}>#</Text>
                                    <Text style={styles.rankingHeaderName}>Time</Text>
                                    <Text style={styles.rankingHeaderPoints}>Pontos</Text>
                                </View>
                                {ranking.map((item: any) => (
                                    <View key={item.team_id} style={styles.rankingRow}>
                                        <Text style={styles.rankingPos}>{item.position}</Text>
                                        <Text style={styles.rankingName}>{item.team_name}</Text>
                                        <Text style={styles.rankingPoints}>{item.points} pts</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.black },
    scrollContent: { paddingBottom: 40 },
    heroContainer: { height: 300, width: '100%', position: 'relative' },
    heroImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    topActions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
    rightActions: { flexDirection: 'row', gap: 12 },
    iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    iconQrButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.greenDim, borderWidth: 1, borderColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
    content: { padding: Theme.spacing.l, marginTop: -30, backgroundColor: Colors.black, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Changed from 12 to 8
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100, // Changed from 16, removed borderWidth and borderColor
    },
    statusBadgeText: {
        color: Colors.black, // Changed from Colors.green to Colors.black
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1, // Added letterSpacing
    },
    rankBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#332900', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#FFD700', gap: 6 },
    rankText: { color: '#FFD700', fontSize: 12, fontWeight: '800' },
    title: { color: Colors.white, fontSize: 28, fontWeight: '800', marginBottom: 8 },
    hostedBy: { color: Colors.gray, fontSize: 14, marginBottom: Theme.spacing.l },
    hostName: { color: Colors.white, fontWeight: '600' },
    certificateAction: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.large, padding: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: Theme.spacing.xxl, borderWidth: 1, borderColor: Colors.darkGray },
    certificateIconRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    certTextCol: { gap: 4 },
    certTitle: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    certSub: { color: Colors.gray, fontSize: 12 },
    infoCardsRow: { flexDirection: 'row', gap: Theme.spacing.l, marginBottom: Theme.spacing.xxl },
    infoCard: { flex: 1, backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.large, padding: Theme.spacing.m, alignItems: 'center' },
    iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.greenDim, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    infoCardValue: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    infoCardLabel: { color: Colors.gray, fontSize: 10, fontWeight: '600' },
    sectionTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: Theme.spacing.l },
    aboutText: { color: Colors.gray, fontSize: 14, lineHeight: 22, marginBottom: Theme.spacing.xxl },
    rankingTable: { backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.large, overflow: 'hidden', marginBottom: Theme.spacing.xxl },
    rankingHeader: { flexDirection: 'row', padding: Theme.spacing.m, backgroundColor: Colors.cardBg, borderBottomWidth: 1, borderBottomColor: Colors.black },
    rankingHeaderPos: { color: Colors.gray, width: 30, fontWeight: 'bold', fontSize: 12 },
    rankingHeaderName: { color: Colors.gray, flex: 1, fontWeight: 'bold', fontSize: 12 },
    rankingHeaderPoints: { color: Colors.gray, width: 60, textAlign: 'right', fontWeight: 'bold', fontSize: 12 },
    rankingRow: { flexDirection: 'row', padding: Theme.spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.black, alignItems: 'center' },
    rankingPos: { color: Colors.white, width: 30, fontWeight: 'bold' },
    rankingName: { color: Colors.white, flex: 1 },
    rankingPoints: { color: Colors.green, width: 60, textAlign: 'right', fontWeight: 'bold' },
});
