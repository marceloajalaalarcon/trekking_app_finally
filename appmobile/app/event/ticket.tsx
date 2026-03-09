import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import Barcode from '../../components/Barcode';
import { fetchEventById, cancelRegistration, getStoredUser, fetchMyEvents } from '../../services/api';
import { dbService } from '../../services/TrekkingDatabase';
import { AlertModal, AlertAction } from '../../components/AlertModal';

export default function TicketScreen() {
    const router = useRouter();
    const { eventId, type, teamId } = useLocalSearchParams<{
        eventId: string; type: 'trekking' | 'standard'; teamId?: string;
    }>();
    const insets = useSafeAreaInsets();
    const [event, setEvent] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>('Carregando...');

    useEffect(() => {
        if (eventId && type) {
            const loadEvent = async () => {
                try {
                    const usr = await getStoredUser();
                    setUser(usr);

                    const myEvents = await fetchMyEvents().catch(() => []);
                    const myEvent = myEvents.find((e: any) => e.id === eventId);
                    if (myEvent) {
                        setStatus(myEvent.status);
                    } else {
                        setStatus('REGISTERED'); // Fallback
                    }

                    const data = await fetchEventById(eventId as string, type as 'trekking' | 'standard');
                    setEvent(data);
                    await dbService.cacheEventDetails(eventId as string, type as string, JSON.stringify(data));
                } catch (err) {
                    console.log('Ticket API Failed, loading local cache...');
                    const cachedData = await dbService.getCachedEventDetails(eventId as string);
                    if (cachedData) {
                        setEvent(cachedData);
                    }
                } finally {
                    setLoading(false);
                }
            };
            loadEvent();
        } else {
            setLoading(false);
        }
    }, [eventId, type]);

    const [cancelling, setCancelling] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; actions?: AlertAction[] }>({ visible: false, title: '', message: '' });

    const handleCancel = () => {
        setAlertConfig({
            visible: true,
            title: 'Cancelar Inscrição',
            message: 'Tem certeza que deseja cancelar sua inscrição neste evento?',
            actions: [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            await cancelRegistration(eventId!, type!, teamId);
                            setAlertConfig({
                                visible: true,
                                title: 'Inscrição cancelada',
                                message: 'Sua inscrição foi cancelada com sucesso.',
                                actions: [{ text: 'OK', onPress: () => router.push('/') }]
                            });
                        } catch (err: any) {
                            setAlertConfig({
                                visible: true,
                                title: 'Erro',
                                message: err.message || 'Não foi possível cancelar.'
                            });
                        } finally {
                            setCancelling(false);
                        }
                    }
                }
            ]
        });
    };

    if (loading) {
        return (
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16), justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.green} />
            </View>
        );
    }

    const eventName = event?.name || 'Evento';
    const eventDate = type === 'trekking' ? event?.start_date : event?.date;
    const description = event?.description || '';

    // Create Short ID payload that fits into a CODE39 linear barcode 
    const eventShort = eventId ? eventId.substring(0, 8).toUpperCase() : '----';
    const userShort = user?.id ? user.id.substring(0, 8).toUpperCase() : '----';
    const teamShort = teamId ? teamId.substring(0, 8).toUpperCase() : null;
    const groupShort6 = teamId ? teamId.substring(0, 6).toUpperCase() : (user?.id ? user.id.substring(0, 6).toUpperCase() : '------');

    // Output: T-TEAMID-E-EVENTID or U-USERID-E-EVENTID
    const barcodePayload = type === 'trekking' && teamShort
        ? `T${teamShort}-E${eventShort.substring(0, 4)}`
        : `U${userShort}-E${eventShort.substring(0, 4)}`;

    const ticketId = `#${barcodePayload}`;

    // Check if event has ended and ticket was never scanned
    const endDate = type === 'trekking' ? event?.end_date : (event?.end_date || event?.date);
    const isEventEnded = endDate ? new Date(endDate).getTime() < Date.now() : false;
    const isConfirmed = status === 'CONFIRMED' || status === 'CHECKED_IN' || status === 'ACTIVE' || status === 'COMPLETED';
    const isAbsent = isEventEnded && !isConfirmed && status === 'REGISTERED';
    const isTorn = isConfirmed || isAbsent;

    // Registration deadline logic
    const isRegistrationOpen = event?.is_registration_open === true;
    const canCancel = isRegistrationOpen && !isTorn && status === 'REGISTERED';
    const registrationDeadline = eventDate ? new Date(eventDate) : null;

    const formatDateLabel = (dateStr: string | null) => {
        if (!dateStr) return '--';
        const d = new Date(dateStr);
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        return `${months[d.getMonth()]} ${d.getDate()}`;
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '--:--';
        const d = new Date(dateStr);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    // Zigzag torn edge component
    const TornEdge = ({ direction }: { direction: 'bottom' | 'top' }) => {
        const teeth = 20;
        const toothSize = 8;
        return (
            <View style={[
                styles.tornEdgeContainer,
                direction === 'bottom' ? { bottom: -toothSize } : { top: -toothSize },
            ]}>
                <View style={styles.tornEdgeRow}>
                    {Array.from({ length: teeth }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.tornTooth,
                                {
                                    width: 0,
                                    height: 0,
                                    borderLeftWidth: toothSize,
                                    borderRightWidth: toothSize,
                                    borderLeftColor: 'transparent',
                                    borderRightColor: 'transparent',
                                    ...(direction === 'bottom'
                                        ? { borderTopWidth: toothSize, borderTopColor: Colors.cardBg }
                                        : { borderBottomWidth: toothSize, borderBottomColor: Colors.cardBg }),
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={20} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>INGRESSO</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => { setLoading(true); setEvent(null); }}>
                    <Feather name="refresh-cw" size={16} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ═══ TOP HALF (always visible) ═══ */}
                <View style={[styles.ticketCard, isTorn && styles.ticketCardTopTorn]}>
                    {/* Geometric Pattern / Image Area */}
                    <View style={styles.patternContainer}>
                        <View style={styles.patternGrid}>
                            {/* Row 1 */}
                            <View style={styles.patternRow}>
                                <View style={[styles.patternBlock, styles.patternSquare]} />
                                <View style={[styles.patternBlock, styles.patternTriangleRight]} />
                                <View style={[styles.patternBlock, styles.patternTriangleLeft]} />
                                <View style={[styles.patternBlock, styles.patternSquare]} />
                            </View>
                            {/* Row 2 */}
                            <View style={styles.patternRow}>
                                <View style={[styles.patternBlock, styles.patternTriangleLeft]} />
                                <View style={[styles.patternBlock, styles.patternSquare]} />
                                <View style={[styles.patternBlock, styles.patternSquare]} />
                                <View style={[styles.patternBlock, styles.patternTriangleRight]} />
                            </View>
                            {/* Row 3 */}
                            <View style={styles.patternRow}>
                                <View style={[styles.patternBlock, styles.patternSquare]} />
                                <View style={[styles.patternBlock, styles.patternTriangleRight]} />
                                <View style={[styles.patternBlock, styles.patternSquare]} />
                                <View style={[styles.patternBlock, styles.patternTriangleLeft]} />
                            </View>
                        </View>
                    </View>

                    {/* Event Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.eventName}>{eventName.toUpperCase()}</Text>
                        {description ? (
                            <Text style={styles.eventDescription} numberOfLines={3}>{description}</Text>
                        ) : null}

                        {/* Date and Time Row */}
                        <View style={styles.dateTimeRow}>
                            <View style={styles.dateTimeItem}>
                                <Text style={styles.dateTimeLabel}>DATE</Text>
                                <Text style={styles.dateTimeValue}>{formatDateLabel(eventDate)}</Text>
                            </View>
                            <View style={styles.dateTimeItem}>
                                <Text style={[styles.dateTimeLabel, { textAlign: 'right' }]}>TIME</Text>
                                <Text style={[styles.dateTimeValue, { textAlign: 'right' }]}>{formatTime(eventDate)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Dashed Divider with Cutouts (only when NOT torn) */}
                    {!isTorn && (
                        <View style={styles.dividerContainer}>
                            <View style={[styles.dividerCutout, styles.dividerCutoutLeft]} />
                            <View style={styles.dividerDashed} />
                            <View style={[styles.dividerCutout, styles.dividerCutoutRight]} />
                        </View>
                    )}

                    {/* Ticket ID & Seat (only when NOT torn – stays in bottom half) */}
                    {!isTorn && (
                        <>
                            <View style={styles.ticketIdSection}>
                                <View>
                                    <Text style={styles.ticketIdLabel}>TICKET  ID</Text>
                                    <Text style={styles.ticketIdValue}>{ticketId}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.ticketIdLabel}>
                                        {type === 'trekking' ? 'ID GRUPO' : 'ID ÚNICO'}
                                    </Text>
                                    <Text style={styles.ticketIdValue}>{groupShort6}</Text>
                                </View>
                            </View>

                            {/* Barcode (only when NOT torn) */}
                            <View style={styles.barcodeContainer}>
                                <View style={styles.barcodeWrapper}>
                                    <Barcode
                                        value={barcodePayload.toUpperCase()}
                                        height={60}
                                        color="#000000"
                                        backgroundColor="#FFFFFF"
                                        narrowWidth={1}
                                        wideWidth={2.5}
                                    />
                                </View>
                            </View>

                            {/* Registration Deadline */}
                            {registrationDeadline && (
                                <View style={styles.deadlineContainer}>
                                    <Feather name={isRegistrationOpen ? 'clock' : 'lock'} size={13} color={isRegistrationOpen ? Colors.green : '#ef4444'} />
                                    <Text style={[styles.deadlineText, !isRegistrationOpen && { color: '#ef4444' }]}>
                                        {isRegistrationOpen
                                            ? `Inscrições abertas até ${registrationDeadline.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${String(registrationDeadline.getHours()).padStart(2, '0')}:${String(registrationDeadline.getMinutes()).padStart(2, '0')}`
                                            : 'Inscrições encerradas'
                                        }
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Zigzag torn bottom edge */}
                    {isTorn && <TornEdge direction="bottom" />}
                </View>

                {/* ═══ TORN LABEL (between halves) ═══ */}
                {isTorn && (
                    <View style={styles.tornLabelContainer}>
                        <View style={[styles.tornLabelLine, isAbsent && { backgroundColor: '#ef4444' }]} />
                        <View style={[styles.tornLabelBadge, isAbsent && { backgroundColor: '#ef4444' }]}>
                            <Feather name={isAbsent ? 'x-circle' : 'check-circle'} size={14} color={isAbsent ? Colors.white : Colors.black} />
                            <Text style={[styles.tornLabelText, isAbsent && { color: Colors.white }]}>
                                {isAbsent ? 'AUSENTE' : 'PRESENÇA CONFIRMADA'}
                            </Text>
                        </View>
                        <View style={[styles.tornLabelLine, isAbsent && { backgroundColor: '#ef4444' }]} />
                    </View>
                )}

                {/* ═══ BOTTOM HALF (only when torn) ═══ */}
                {isTorn && (
                    <View style={[styles.ticketCard, styles.ticketCardBottomTorn]}>
                        {/* Zigzag torn top edge */}
                        <TornEdge direction="top" />

                        {/* Ticket ID & Seat */}
                        <View style={[styles.ticketIdSection, { paddingTop: 20 }]}>
                            <View>
                                <Text style={styles.ticketIdLabel}>TICKET  ID</Text>
                                <Text style={styles.ticketIdValue}>{ticketId}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.ticketIdLabel}>
                                    {type === 'trekking' ? 'ID GRUPO' : 'ID ÚNICO'}
                                </Text>
                                <Text style={styles.ticketIdValue}>{groupShort6}</Text>
                            </View>
                        </View>

                        {/* Barcode with strikethrough effect */}
                        <View style={[styles.barcodeContainer, { opacity: 0.4 }]}>
                            <View style={styles.barcodeWrapper}>
                                <Barcode
                                    value={barcodePayload.toUpperCase()}
                                    height={60}
                                    color="#000000"
                                    backgroundColor="#FFFFFF"
                                    narrowWidth={1}
                                    wideWidth={2.5}
                                />
                            </View>
                            {/* Diagonal strikethrough line */}
                            <View style={styles.barcodeStrikethrough} />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Footer Buttons — only show cancel when registration is open */}
            {canCancel && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                        disabled={cancelling}
                    >
                        <Text style={styles.cancelButtonText}>
                            {cancelling ? 'Cancelando...' : 'Cancelar Inscrição'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <AlertModal
                {...alertConfig}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.black },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.l,
        paddingVertical: Theme.spacing.m,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 2,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 200,
    },

    // ─── Ticket Card ─────────────────────────────────
    ticketCard: {
        backgroundColor: Colors.cardBg,
        borderRadius: 20,
        overflow: 'hidden',
    },

    // ─── Geometric Pattern ───────────────────────────
    patternContainer: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },
    patternGrid: {
        gap: 6,
    },
    patternRow: {
        flexDirection: 'row',
        gap: 6,
    },
    patternBlock: {
        flex: 1,
        height: 60,
        backgroundColor: Colors.white,
        borderRadius: 4,
    },
    patternSquare: {
        // Full square block
    },
    patternTriangleRight: {
        borderTopRightRadius: 30,
        borderBottomLeftRadius: 30,
    },
    patternTriangleLeft: {
        borderTopLeftRadius: 30,
        borderBottomRightRadius: 30,
    },

    // ─── Event Info ──────────────────────────────────
    infoSection: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    eventName: {
        color: Colors.white,
        fontSize: 28,
        fontWeight: '900',
        lineHeight: 34,
        marginBottom: 12,
        letterSpacing: 1,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        marginBottom: 16,
    },
    statusBadgeText: {
        color: Colors.black,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    eventDescription: {
        color: Colors.gray,
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    dateTimeItem: {
        gap: 4,
    },
    dateTimeLabel: {
        color: Colors.gray,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    dateTimeValue: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: '800',
    },

    // ─── Divider ─────────────────────────────────────
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 1,
        position: 'relative',
        marginVertical: 16, // added margin to space out from text
    },
    dividerDashed: {
        flex: 1,
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#333',
    },
    dividerCutout: {
        width: 32, // slightly larger for the stroke to render cleanly inside card margin
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.black,
        position: 'absolute',
        zIndex: 2,
        borderWidth: 1,
        borderColor: '#333',
    },
    dividerCutoutLeft: { left: -16 },
    dividerCutoutRight: { right: -16 },

    // ─── Ticket ID ───────────────────────────────────
    ticketIdSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    ticketIdLabel: {
        color: Colors.gray,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
        fontFamily: 'monospace',
        marginBottom: 4,
    },
    ticketIdValue: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'monospace',
    },

    // ─── Registration Deadline ───────────────────────
    deadlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    deadlineText: {
        color: Colors.green,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // ─── Barcode ─────────────────────────────────────
    barcodeContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        alignItems: 'center',
    },
    barcodeWrapper: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
    },
    barcodeHint: {
        marginTop: 12,
        color: Colors.black,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },


    // ─── Torn Ticket Effect ─────────────────────────
    ticketCardTopTorn: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'visible',
        paddingBottom: 0,
    },
    ticketCardBottomTorn: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        overflow: 'visible',
        paddingTop: 0,
    },
    tornEdgeContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10,
        overflow: 'hidden',
    },
    tornEdgeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    tornTooth: {
        // Dynamic styles applied inline
    },
    tornLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    tornLabelLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.green,
        opacity: 0.3,
    },
    tornLabelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.green,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
    },
    tornLabelText: {
        color: Colors.black,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    barcodeStrikethrough: {
        position: 'absolute',
        top: '45%',
        left: 10,
        right: 10,
        height: 3,
        backgroundColor: '#ef4444',
        transform: [{ rotate: '-5deg' }],
        borderRadius: 2,
    },

    // ─── Footer ──────────────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Theme.spacing.l,
        paddingTop: Theme.spacing.m,
        paddingBottom: 32,
        gap: Theme.spacing.m,
        backgroundColor: Colors.black,
    },
    cancelButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: Theme.borderRadius.round,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '700',
    },
});
