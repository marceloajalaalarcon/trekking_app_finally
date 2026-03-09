import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const CODE39_DICT: Record<string, string> = {
    '0': 'bwbwbwbwb=N,N,N,W,W,N,W,N,N', // Note: actual encoding below
    '1': 'W,N,N,W,N,N,N,N,W',
    '2': 'N,N,W,W,N,N,N,N,W',
    '3': 'W,N,W,W,N,N,N,N,N',
    '4': 'N,N,N,W,W,N,N,N,W',
    '5': 'W,N,N,W,W,N,N,N,N',
    '6': 'N,N,W,W,W,N,N,N,N',
    '7': 'N,N,N,W,N,N,W,N,W',
    '8': 'W,N,N,W,N,N,W,N,N',
    '9': 'N,N,W,W,N,N,W,N,N',
    'A': 'W,N,N,N,N,W,N,N,W',
    'B': 'N,N,W,N,N,W,N,N,W',
    'C': 'W,N,W,N,N,W,N,N,N',
    'D': 'N,N,N,N,W,W,N,N,W',
    'E': 'W,N,N,N,W,W,N,N,N',
    'F': 'N,N,W,N,W,W,N,N,N',
    'G': 'N,N,N,N,N,W,W,N,W',
    'H': 'W,N,N,N,N,W,W,N,N',
    'I': 'N,N,W,N,N,W,W,N,N',
    'J': 'N,N,N,N,W,W,W,N,N',
    'K': 'W,N,N,N,N,N,N,W,W',
    'L': 'N,N,W,N,N,N,N,W,W',
    'M': 'W,N,W,N,N,N,N,W,N',
    'N': 'N,N,N,N,W,N,N,W,W',
    'O': 'W,N,N,N,W,N,N,W,N',
    'P': 'N,N,W,N,W,N,N,W,N',
    'Q': 'N,N,N,N,N,N,W,W,W',
    'R': 'W,N,N,N,N,N,W,W,N',
    'S': 'N,N,W,N,N,N,W,W,N',
    'T': 'N,N,N,N,W,N,W,W,N',
    'U': 'W,W,N,N,N,N,N,N,W',
    'V': 'N,W,W,N,N,N,N,N,W',
    'W': 'W,W,W,N,N,N,N,N,N',
    'X': 'N,W,N,N,W,N,N,N,W',
    'Y': 'W,W,N,N,W,N,N,N,N',
    'Z': 'N,W,W,N,W,N,N,N,N',
    '-': 'N,W,N,N,N,N,W,N,W',
    '.': 'W,W,N,N,N,N,W,N,N',
    ' ': 'N,W,W,N,N,N,W,N,N',
    '*': 'N,W,N,N,W,N,W,N,N', // Start/Stop
    '$': 'N,W,N,W,N,W,N,N,N',
    '/': 'N,W,N,W,N,N,N,W,N',
    '+': 'N,W,N,N,N,W,N,W,N',
    '%': 'N,N,N,W,N,W,N,W,N',
};
// Fix the '0'
CODE39_DICT['0'] = 'N,N,N,W,W,N,W,N,N';

interface Props {
    value: string;
    height?: number;
    color?: string;
    backgroundColor?: string;
    narrowWidth?: number;
    wideWidth?: number;
}

export default function Barcode({
    value,
    height = 60,
    color = '#000000',
    backgroundColor = 'transparent',
    narrowWidth = 1.5,
    wideWidth = 4,
}: Props) {
    const safeValue = `*${value.toUpperCase()}*`; // Code39 requires * at start and end
    const bars: React.ReactNode[] = [];

    let keyIndex = 0;

    // Gap between characters is one narrow white space
    const charGap = narrowWidth;

    for (let i = 0; i < safeValue.length; i++) {
        const char = safeValue[i];
        let pattern = CODE39_DICT[char];

        if (!pattern) {
            // Unrecognized chars replaced with space
            pattern = CODE39_DICT[' '];
        }

        const widths = pattern.split(',');

        // 9 elements per char, alternating black and white
        for (let j = 0; j < widths.length; j++) {
            const isBlack = j % 2 === 0;
            const w = widths[j] === 'W' ? wideWidth : narrowWidth;

            bars.push(
                <View
                    key={keyIndex++}
                    style={{
                        width: w,
                        height: height,
                        backgroundColor: isBlack ? color : backgroundColor,
                    }}
                />
            );
        }

        // Add character gap (white space) if not the last char
        if (i < safeValue.length - 1) {
            bars.push(
                <View
                    key={keyIndex++}
                    style={{
                        width: charGap,
                        height: height,
                        backgroundColor: backgroundColor,
                    }}
                />
            );
        }
    }

    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', backgroundColor }}>
            {bars}
        </View>
    );
}
