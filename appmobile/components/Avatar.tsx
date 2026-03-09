import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';

interface AvatarProps {
    uri?: string;
    size?: number;
    initials?: string;
    hasBorder?: boolean;
}

export function Avatar({ uri, size = 32, initials, hasBorder = false }: AvatarProps) {
    const borderRadius = size / 2;

    return (
        <View
            style={[
                styles.container,
                { width: size, height: size, borderRadius },
                hasBorder && styles.border,
            ]}
        >
            {uri ? (
                <Image
                    source={{ uri }}
                    style={[{ width: size, height: size, borderRadius }]}
                />
            ) : (
                <View style={[{ width: size, height: size, borderRadius }, styles.placeholder]}>
                    <Text style={styles.initials}>{initials || '?'}</Text>
                </View>
            )}
        </View>
    );
}

interface AvatarGroupProps {
    count: number;
    max?: number;
}

export function AvatarGroup({ count, max = 3 }: AvatarGroupProps) {
    const renderAvatars = () => {
        const bubbles = [];
        const bubblesToRender = Math.min(count, max);
        const extraCount = count - max + 1; // If count > max, we replace the last bubble with the extra count.

        for (let i = 0; i < bubblesToRender; i++) {
            const isLastBubble = i === max - 1 && count > max;
            bubbles.push(
                <View key={i} style={[styles.overlap, { left: i * 16, zIndex: i }]}>
                    {isLastBubble ? (
                        <View style={[styles.avatarPlaceholderContainer, { width: 28, height: 28, borderRadius: 14 }]}>
                            <Text style={styles.lastAvatarText} numberOfLines={1} adjustsFontSizeToFit>+{extraCount}</Text>
                        </View>
                    ) : (
                        <Avatar size={28} hasBorder initials=" " />
                    )}
                </View>
            );
        }
        return bubbles;
    };

    return (
        <View style={styles.groupContainer}>
            <View style={styles.avatarsWrapper}>
                {renderAvatars()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.darkGray,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    border: {
        borderWidth: 2,
        borderColor: Colors.cardBg,
    },
    placeholder: {
        backgroundColor: Colors.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        color: Colors.black,
        fontWeight: '700',
        fontSize: 12,
    },
    groupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        width: 60, // Aprox width of 3 overlapping avatars (28 + 16 + 16)
        height: 28,
    },
    overlap: {
        position: 'absolute',
    },
    avatarPlaceholderContainer: {
        backgroundColor: Colors.darkGray,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.cardBg,
    },
    lastAvatarText: {
        color: Colors.green,
        fontSize: 10,
        fontWeight: '800',
    },
    extraText: {
        color: Colors.black,
        fontSize: 10,
        fontWeight: '800',
    },
});
