import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfflineTasksScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [teamPin, setTeamPin] = useState('');

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Atividades Extras</Text>
                <View style={styles.offlineBadge}>
                    <Text style={styles.offlineText}>OFFLINE</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.infoBox}>
                    <Feather name="info" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
                    <Text style={styles.infoText}>Esta ferramenta funciona 100% offline. Digite o número da equipe abaixo para registrar faltas graves ou bônus de atividades e sincronize mais tarde.</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ID da Equipe</Text>
                    <TextInput
                        style={styles.pinInput}
                        placeholder="Ex: a1b2c3d4..."
                        placeholderTextColor={Colors.gray}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={teamPin}
                        onChangeText={setTeamPin}
                    />
                </View>

                {teamPin.length >= 2 ? (
                    <View style={styles.actionBlock}>
                        <Text style={styles.actionTitle}>O que a equipe fez?</Text>

                        <TouchableOpacity style={[styles.actionBtn, { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                            <Feather name="check-circle" size={24} color="#10b981" />
                            <Text style={[styles.actionBtnText, { color: '#10b981' }]}>Completou Extra (+ Pontos)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                            <Feather name="x-circle" size={24} color="#ef4444" />
                            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Faltou a Regra (- Pontos)</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </ScrollView>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        marginTop: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222',
        marginRight: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
    },
    offlineBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    offlineText: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        padding: Theme.spacing.l,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: 16,
        borderRadius: Theme.borderRadius.large,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        marginBottom: 24,
        gap: 12,
    },
    infoText: {
        flex: 1,
        color: '#93c5fd',
        fontSize: 13,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 8,
    },
    pinInput: {
        backgroundColor: Colors.cardBg,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: Theme.borderRadius.large,
        paddingHorizontal: 20,
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.green,
        height: 80,
        textAlign: 'center',
        letterSpacing: 4,
    },
    actionBlock: {
        gap: 12,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
        textAlign: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: Theme.borderRadius.large,
        height: 70,
        gap: 12,
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});
