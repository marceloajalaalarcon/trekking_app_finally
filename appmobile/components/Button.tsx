import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'dashed';
    icon?: React.ReactNode;
}

export function Button({ title, onPress, variant = 'primary', icon }: ButtonProps) {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isDashed = variant === 'dashed';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.button,
                isPrimary && styles.primary,
                isOutline && styles.outline,
                isDashed && styles.dashed,
            ]}
            onPress={onPress}
        >
            {icon && <React.Fragment>{icon}</React.Fragment>}
            <Text
                style={[
                    styles.text,
                    isPrimary && styles.textPrimary,
                    (isOutline || isDashed) && styles.textOutline,
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 56,
        minWidth: 48,
        borderRadius: Theme.borderRadius.round,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Theme.spacing.xl,
        gap: Theme.spacing.s,
    },
    primary: {
        backgroundColor: Colors.green,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.green,
    },
    dashed: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.green,
        borderStyle: 'dashed',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    textPrimary: {
        color: Colors.black,
    },
    textOutline: {
        color: Colors.green,
    },
});
