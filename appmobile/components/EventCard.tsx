import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { AvatarGroup } from './Avatar';

interface EventCardProps {
    title: string;
    subtitle?: string;
    time: string;
    location: string;
    imageUri?: string;
    highlighted?: boolean;
    onPress?: () => void;
    attendeesCount?: number;
    eventType?: 'trekking' | 'standard';
}

export const EventCard = React.memo(({ title, subtitle, time, location, imageUri, highlighted, onPress, attendeesCount = 0, eventType }: EventCardProps) => {
    const isTrekking = eventType === 'trekking';

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <View style={[styles.card, highlighted && styles.highlightedCard]}>
                <View style={styles.header}>
                    <View style={styles.imageContainer}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.image} />
                        ) : (
                            <View style={[styles.image, styles.imagePlaceholder, isTrekking && { backgroundColor: 'rgba(16,185,129,0.3)' }, !isTrekking && eventType === 'standard' && { backgroundColor: 'rgba(59,130,246,0.3)' }]}>
                                <Feather name={isTrekking ? 'compass' : 'calendar'} size={20} color={isTrekking ? '#10B981' : '#3B82F6'} />
                            </View>
                        )}
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, highlighted && styles.darkText]} numberOfLines={1}>{title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {eventType && (
                                <View style={[styles.typeBadge, isTrekking ? styles.typeBadgeTrekking : styles.typeBadgeStandard]}>
                                    <Text style={[styles.typeBadgeText, isTrekking ? { color: '#10B981' } : { color: '#3B82F6' }]}>
                                        {isTrekking ? '🏔️' : '📋'}
                                    </Text>
                                </View>
                            )}
                            {subtitle && <Text style={[styles.subtitle, highlighted && styles.darkText]} numberOfLines={1}>{subtitle}</Text>}
                        </View>
                    </View>
                    <View style={[styles.arrowButton, highlighted ? styles.arrowDark : styles.arrowLight]}>
                        <Feather name="arrow-up-right" size={16} color={Colors.white} />
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={[styles.infoRow, { flexShrink: 1 }]}>
                        <View style={styles.infoItem}>
                            <Feather name="clock" size={14} color={highlighted ? Colors.black : Colors.gray} />
                            <Text style={[styles.infoText, highlighted && styles.darkText]}>{time}</Text>
                        </View>
                        <View style={[styles.divider, highlighted && styles.dividerDark]} />
                        <View style={[styles.infoItem, { flex: 1, flexShrink: 1 }]}>
                            <Feather name="map-pin" size={14} color={highlighted ? Colors.black : Colors.gray} />
                            <Text style={[styles.infoText, highlighted && styles.darkText, { flex: 1, flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">{location}</Text>
                        </View>
                    </View>
                    {attendeesCount > 0 && <AvatarGroup count={attendeesCount} />}
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: { backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.xlarge, padding: Theme.spacing.l, marginBottom: Theme.spacing.l },
    highlightedCard: { backgroundColor: Colors.green },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.l },
    imageContainer: { marginRight: Theme.spacing.m },
    image: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    imagePlaceholder: { backgroundColor: Colors.darkGray },
    titleContainer: { flex: 1 },
    title: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    subtitle: { color: Colors.gray, fontSize: 14 },
    darkText: { color: Colors.black },
    typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    typeBadgeTrekking: { backgroundColor: 'rgba(16,185,129,0.15)' },
    typeBadgeStandard: { backgroundColor: 'rgba(59,130,246,0.15)' },
    typeBadgeText: { fontSize: 10, fontWeight: '800' },
    arrowButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    arrowLight: { backgroundColor: Colors.darkGray },
    arrowDark: { backgroundColor: 'rgba(0,0,0,0.1)' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: Theme.spacing.m },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { color: Colors.gray, fontSize: 12, fontWeight: '500' },
    divider: { width: 1, height: 12, backgroundColor: Colors.darkGray, marginHorizontal: Theme.spacing.s },
    dividerDark: { backgroundColor: 'rgba(0,0,0,0.2)' },
});
