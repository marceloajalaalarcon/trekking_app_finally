import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { AvatarGroup } from '../../components/Avatar';
import { fetchEventById, fetchMyEvents } from '../../services/api';

export default function EventDetailsScreen() {
    const { id, type } = useLocalSearchParams<{ id: string; type: 'trekking' | 'standard' }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [event, setEvent] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [teamId, setTeamId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const isTrekking = type === 'trekking';

    useEffect(() => {
        if (id && type) {
            Promise.all([
                fetchEventById(id, type),
                fetchMyEvents()
            ]).then(([eventData, myEvents]) => {
                setEvent(eventData);
                const sub = myEvents.find((e: any) => String(e.id) === String(id));
                if (sub) {
                    setIsSubscribed(true);
                    setTeamId(sub.team_id || null);
                }
            }).catch(err => {
                console.error('Failed to load event data', err);
            }).finally(() => setLoading(false));
        }
    }, [id, type]);

    if (loading) {
        return (
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16), justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.green} />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16), justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: Colors.gray, fontSize: 16 }}>Evento não encontrado.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={{ color: Colors.green, fontWeight: '700' }}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const eventName = event.name || 'Evento';
    const eventDate = isTrekking ? event.start_date : event.date;
    const eventLocation = event.location || 'Local a definir';
    const eventDescription = event.description || 'Sem descrição disponível.';
    const ownerName = event.owner?.name || 'Organizador';
    const maxParticipants = event._count?.participants || event._count?.teams || event.max_participants || 0;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return { day: '--', weekday: '---' };
        const d = new Date(dateStr);
        const day = `${d.getDate()} ${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}`;
        const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
        return { day, weekday };
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '--:--';
        const d = new Date(dateStr);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const { day, weekday } = formatDate(eventDate);
    const time = formatTime(eventDate);
    const heroImage = isTrekking
        ? 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600'
        : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600';

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: heroImage }} style={styles.heroImage} />
                    <View style={styles.overlay} />
                    <View style={styles.topActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                            <Feather name="arrow-left" size={20} color={Colors.white} />
                        </TouchableOpacity>
                        <View style={styles.rightActions}>
                            {isTrekking && isSubscribed && (
                                <TouchableOpacity
                                    style={[styles.iconButton, { backgroundColor: Colors.green }]}
                                    onPress={() => router.push('/camera')}
                                >
                                    <Feather name="camera" size={20} color={Colors.black} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.iconButton}>
                                <Feather name="heart" size={20} color={Colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Feather name="share-2" size={20} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={[styles.badge, isTrekking ? { borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)' } : { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                        <Text style={[styles.badgeText, isTrekking ? { color: '#10B981' } : { color: '#3B82F6' }]}>
                            {isTrekking ? '🏔️ TREKKING' : '📋 EVENTO PADRÃO'}
                        </Text>
                    </View>

                    <Text style={styles.title}>{eventName}</Text>
                    <Text style={styles.hostedBy}>
                        Organizado por <Text style={styles.hostName}>{ownerName}</Text>
                    </Text>

                    {/* Info Cards */}
                    <View style={styles.infoCardsRow}>
                        <View style={styles.infoCard}>
                            <View style={styles.iconCircle}>
                                <Feather name="calendar" size={16} color={Colors.green} />
                            </View>
                            <Text style={styles.infoCardValue}>{day}</Text>
                            <Text style={styles.infoCardLabel}>{weekday}</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <View style={styles.iconCircle}>
                                <Feather name="clock" size={16} color={Colors.green} />
                            </View>
                            <Text style={styles.infoCardValue}>{time}</Text>
                            <Text style={styles.infoCardLabel}>INÍCIO</Text>
                        </View>
                    </View>

                    {/* Location */}
                    <Text style={styles.sectionTitle}>Localização</Text>
                    <View style={styles.mapPlaceholder}>
                        <View style={styles.gridLineV} />
                        <View style={styles.gridLineH} />
                        <View style={styles.mapPinWrapper}>
                            <View style={styles.mapPin}>
                                <Feather name="map-pin" size={16} color={Colors.black} />
                            </View>
                            <View style={styles.mapPinDot} />
                        </View>
                        <View style={styles.mapLabel}>
                            <Text style={styles.mapLabelText}>{eventLocation}</Text>
                        </View>
                    </View>

                    {/* About */}
                    <Text style={styles.sectionTitle}>Sobre o Evento</Text>
                    <Text style={styles.aboutText}>{eventDescription}</Text>

                    {/* Group / Certificate Info */}
                    {!isTrekking && (
                        <View style={styles.infoCardsRow}>
                            <View style={styles.infoCard}>
                                <View style={[styles.iconCircle, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                                    <Feather name="users" size={16} color="#3B82F6" />
                                </View>
                                <Text style={styles.infoCardValue}>{event.is_group_event ? 'Grupo' : 'Individual'}</Text>
                                <Text style={styles.infoCardLabel}>MODALIDADE</Text>
                            </View>
                            <View style={styles.infoCard}>
                                <View style={[styles.iconCircle, { backgroundColor: event.has_certificate ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)' }]}>
                                    <Feather name="award" size={16} color={event.has_certificate ? '#10B981' : Colors.gray} />
                                </View>
                                <Text style={styles.infoCardValue}>{event.has_certificate ? 'Sim' : 'Não'}</Text>
                                <Text style={styles.infoCardLabel}>CERTIFICADO</Text>
                            </View>
                        </View>
                    )}

                    {/* Attendees */}
                    <View style={styles.attendeesHeader}>
                        <Text style={styles.sectionTitle}>Participantes</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>Ver Todos</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.attendeesContainer}>
                        <AvatarGroup count={maxParticipants} max={4} />
                        <Text style={styles.attendeesText}>pessoas participarão</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>STATUS</Text>
                    {isSubscribed ? (
                        <Text style={[styles.priceValue, { fontSize: 16, color: Colors.green }]}>✅ Inscrito</Text>
                    ) : (
                        <Text style={[styles.priceValue, { fontSize: 16 }]}>
                            {event.is_registration_open ? 'Abertas' : '🔒 Fechadas'}
                        </Text>
                    )}
                </View>
                <View style={styles.footerButton}>
                    {isSubscribed ? (
                        <Button
                            title="Ver Ingresso"
                            onPress={() => router.push({ pathname: '/event/ticket', params: { eventId: id, type, teamId: teamId || undefined } })}
                        />
                    ) : (
                        <Button
                            title={event.is_registration_open ? 'Inscrever-se' : 'Indisponível'}
                            onPress={() => event.is_registration_open && router.push({ pathname: '/event/register', params: { eventId: id, type, eventName } })}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.black },
    scrollContent: { paddingBottom: 100 },
    heroContainer: { height: 300, width: '100%', position: 'relative' },
    heroImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
    topActions: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
    rightActions: { flexDirection: 'row', gap: 12 },
    iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    content: { padding: Theme.spacing.l, marginTop: -20, backgroundColor: Colors.black, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: Theme.spacing.l, borderWidth: 1 },
    badgeText: { fontSize: 12, fontWeight: '800' },
    title: { color: Colors.white, fontSize: 28, fontWeight: '800', marginBottom: 8 },
    hostedBy: { color: Colors.gray, fontSize: 14, marginBottom: Theme.spacing.xxl },
    hostName: { color: Colors.white, fontWeight: '600' },
    infoCardsRow: { flexDirection: 'row', gap: Theme.spacing.l, marginBottom: Theme.spacing.xxl },
    infoCard: { flex: 1, backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.large, padding: Theme.spacing.l, alignItems: 'center' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.greenDim, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    infoCardValue: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    infoCardLabel: { color: Colors.gray, fontSize: 10, fontWeight: '600' },
    sectionTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: Theme.spacing.l },
    mapPlaceholder: { width: '100%', height: 120, backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.large, marginBottom: Theme.spacing.xxl, position: 'relative', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    gridLineV: { position: 'absolute', width: 1, height: '100%', backgroundColor: Colors.darkGray },
    gridLineH: { position: 'absolute', height: 1, width: '100%', backgroundColor: Colors.darkGray },
    mapPinWrapper: { alignItems: 'center', justifyContent: 'center' },
    mapPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
    mapPinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.greenDim, marginTop: -4 },
    mapLabel: { position: 'absolute', bottom: 16, left: 16, backgroundColor: Colors.black, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
    mapLabelText: { color: Colors.white, fontSize: 12 },
    aboutText: { color: Colors.gray, fontSize: 14, lineHeight: 22, marginBottom: Theme.spacing.xxl },
    readMore: { color: Colors.green, fontWeight: '600' },
    attendeesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.l },
    viewAll: { color: Colors.green, fontWeight: '600', fontSize: 14 },
    attendeesContainer: { flexDirection: 'row', alignItems: 'center' },
    attendeesText: { color: Colors.gray, fontSize: 14, marginLeft: Theme.spacing.m },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.black, flexDirection: 'row', paddingHorizontal: Theme.spacing.l, paddingTop: Theme.spacing.m, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.cardBg, alignItems: 'center' },
    priceContainer: { flex: 1 },
    priceLabel: { color: Colors.gray, fontSize: 12, fontWeight: '600', marginBottom: 4 },
    priceValue: { color: Colors.white, fontSize: 24, fontWeight: '800' },
    footerButton: { flex: 2 },
});
