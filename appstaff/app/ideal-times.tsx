import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMyStaffRoles, fetchEventById, updateTrekkingSettings } from '../services/api';

type Checkpoint = { id: number | string; name: string; offsetFromPrevMinutes: number };

const DEFAULT_CHECKPOINTS: Checkpoint[] = [
    { id: 1, name: 'Largada', offsetFromPrevMinutes: 0 },
    { id: 2, name: 'CP 1', offsetFromPrevMinutes: 20 },
    { id: 3, name: 'Chegada', offsetFromPrevMinutes: 20 },
];

export default function IdealTimesScreen() {
    const router = useRouter(); // Using useRouter directly
    const insets = useSafeAreaInsets();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [trekkingId, setTrekkingId] = useState<string | null>(null);

    const [baseHour, setBaseHour] = useState('10');
    const [baseMinute, setBaseMinute] = useState('00');
    const [teamInterval, setTeamInterval] = useState('2');
    const [teamCount, setTeamCount] = useState('5');
    const [defaultCpInterval, setDefaultCpInterval] = useState('20');
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(DEFAULT_CHECKPOINTS);
    const [showConfig, setShowConfig] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setIsOffline(false);

            // 1. Get staff roles to find the Trekking ID
            const roles = await fetchMyStaffRoles();
            if (!roles || roles.length === 0) throw new Error('You are not assigned to any trekking.');
            const id = roles[0].trekking_id;
            setTrekkingId(id);

            // 2. Fetch the trekking configuration
            let eventData = null;
            try {
                eventData = await fetchEventById(id, 'trekking');
                // Save to cache for offline viewing next time
                await AsyncStorage.setItem(`@IdealTimes:${id}`, JSON.stringify(eventData));
            } catch (err) {
                // If API fails, try offline cache
                console.log('Failed to fetch from API, loading offline cache:', err);
                setIsOffline(true);
                const cached = await AsyncStorage.getItem(`@IdealTimes:${id}`);
                if (cached) eventData = JSON.parse(cached);
                else throw err; // No cache either
            }

            if (eventData) {
                // Set Configs
                if (eventData.start_date) {
                    const d = new Date(eventData.start_date);
                    setBaseHour(String(d.getHours()).padStart(2, '0'));
                    setBaseMinute(String(d.getMinutes()).padStart(2, '0'));
                }
                if (eventData.teams_start_interval) {
                    setTeamInterval(String(Math.floor(eventData.teams_start_interval / 60)));
                }
                if (eventData.max_teams !== undefined || eventData.accepted_teams_count !== undefined || eventData._count?.teams) {
                    setTeamCount(String(eventData.max_teams ?? eventData.accepted_teams_count ?? eventData._count?.teams ?? 5));
                }

                // Map Checkpoints
                if (eventData.checkpoints && eventData.checkpoints.length > 0) {
                    // Sort checkpoints by order
                    const sortedCps = [...eventData.checkpoints].sort((a, b) => a.order - b.order);

                    const mappedCps: Checkpoint[] = [];
                    let previousAccumSecs = 0;

                    sortedCps.forEach((cp, index) => {
                        const offsetSecs = cp.ideal_time_offset - previousAccumSecs;
                        mappedCps.push({
                            id: cp.id || cp.order,
                            name: cp.name,
                            offsetFromPrevMinutes: Math.floor(offsetSecs / 60)
                        });
                        previousAccumSecs = cp.ideal_time_offset;
                    });

                    setCheckpoints(mappedCps);
                }
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível carregar as configurações.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!trekkingId) return;

        try {
            setIsSaving(true);

            // Calculate start date
            const today = new Date();
            today.setHours(parseInt(baseHour) || 0, parseInt(baseMinute) || 0, 0, 0);

            // Build payload exactly like dashboard does
            let accumMin = 0;
            const cpsToSend = checkpoints.map((cp, idx) => {
                accumMin += cp.offsetFromPrevMinutes;
                return {
                    name: cp.name,
                    ideal_time_offset: accumMin * 60,
                    is_start_line: idx === 0,
                    is_finish_line: idx === checkpoints.length - 1
                };
            });

            const payload = {
                teams_start_interval: (parseInt(teamInterval) || 0) * 60,
                checkpoints_count: cpsToSend.length > 2 ? cpsToSend.length - 2 : 0,
                checkpoints: cpsToSend,
                start_date: today.toISOString(),
                max_teams: parseInt(teamCount) || 5,
            };

            await updateTrekkingSettings(trekkingId, payload);

            // Update local cache
            const cachedStr = await AsyncStorage.getItem(`@IdealTimes:${trekkingId}`);
            if (cachedStr) {
                const cached = JSON.parse(cachedStr);
                const updated = { ...cached, ...payload };
                await AsyncStorage.setItem(`@IdealTimes:${trekkingId}`, JSON.stringify(updated));
            }

            Alert.alert('Sucesso', 'Configuração sincronizada com o backend!');
            setIsOffline(false);
        } catch (error: any) {
            setIsOffline(true);
            Alert.alert(
                'Aviso (Offline)',
                'Não foi possível salvar no servidor. As alterações ficaram apenas na sua tela atual.\nQuando tiver internet, clique em Sincronizar.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const baseStartMinutes = (parseInt(baseHour) || 0) * 60 + (parseInt(baseMinute) || 0);
    const intervalMin = parseInt(teamInterval) || 1;
    const numTeams = parseInt(teamCount) || 1;

    const teams = useMemo(() =>
        Array.from({ length: numTeams }, (_, i) => ({
            id: i + 1,
            number: i + 1,
            name: `Equipe #${i + 1}`,
            startOffsetMinutes: i * intervalMin,
        })),
        [numTeams, intervalMin]
    );

    const getAccumulatedOffset = useCallback((cpIndex: number) => {
        return checkpoints.slice(0, cpIndex + 1).reduce((sum, cp) => sum + cp.offsetFromPrevMinutes, 0);
    }, [checkpoints]);

    const formatTime = useCallback((totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }, []);

    const calculateTime = useCallback((teamOffset: number, cpAccum: number) => {
        return formatTime(baseStartMinutes + teamOffset + cpAccum);
    }, [baseStartMinutes, formatTime]);

    const handleAddCp = () => {
        const newCps = [...checkpoints];
        const finish = newCps.pop()!;
        const cpNum = newCps.length;
        newCps.push({ id: Date.now(), name: `CP ${cpNum}`, offsetFromPrevMinutes: parseInt(defaultCpInterval) || 20 });
        newCps.push(finish);
        setCheckpoints(newCps);
    };

    const handleRemoveCp = (index: number) => {
        if (index === 0 || index === checkpoints.length - 1) return;
        setCheckpoints(cps => cps.filter((_, i) => i !== index));
    };

    const handleUpdateOffset = (index: number, val: string) => {
        setCheckpoints(cps => cps.map((cp, i) => i === index ? { ...cp, offsetFromPrevMinutes: parseInt(val) || 0 } : cp));
    };

    const handleUpdateName = (index: number, val: string) => {
        setCheckpoints(cps => cps.map((cp, i) => i === index ? { ...cp, name: val } : cp));
    };

    const handleApplyAll = () => {
        const interval = parseInt(defaultCpInterval) || 20;
        setCheckpoints(cps => cps.map((cp, i) => i === 0 ? cp : { ...cp, offsetFromPrevMinutes: interval }));
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={Colors.green} />
                <Text style={styles.loadingText}>Carregando configuração...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { router.back() }} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tempos Ideais</Text>

                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveButton, isOffline && styles.saveButtonOffline]}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color={Colors.black} />
                    ) : (
                        <>
                            <Feather name={isOffline ? "cloud-off" : "upload-cloud"} size={16} color={Colors.black} />
                            <Text style={styles.saveButtonText}>{isOffline ? "Salvar Local" : "Sincronizar"}</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowConfig(!showConfig)} style={styles.configToggle}>
                    <Feather name={showConfig ? 'chevron-up' : 'settings'} size={20} color={isOffline ? Colors.gray : Colors.green} />
                </TouchableOpacity>
            </View>

            {isOffline && (
                <View style={styles.offlineBadge}>
                    <Text style={styles.offlineText}>MODO OFFLINE ATIVO - DADOS LOCAIS</Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Config Section */}
                {showConfig && (
                    <View style={styles.configCard}>
                        <Text style={styles.configTitle}>
                            <Feather name="sliders" size={16} color={Colors.green} /> Configuração
                        </Text>

                        <View style={styles.configRow}>
                            <View style={styles.configField}>
                                <Text style={styles.configLabel}>Hora Largada</Text>
                                <View style={styles.timeRow}>
                                    <TextInput
                                        style={[styles.configInput, { flex: 1 }]}
                                        value={baseHour}
                                        onChangeText={setBaseHour}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        placeholder="HH"
                                        placeholderTextColor={Colors.gray}
                                    />
                                    <Text style={styles.timeSeparator}>:</Text>
                                    <TextInput
                                        style={[styles.configInput, { flex: 1 }]}
                                        value={baseMinute}
                                        onChangeText={setBaseMinute}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        placeholder="MM"
                                        placeholderTextColor={Colors.gray}
                                    />
                                </View>
                            </View>
                            <View style={styles.configField}>
                                <Text style={styles.configLabel}>Intervalo Equipes (min)</Text>
                                <TextInput
                                    style={styles.configInput}
                                    value={teamInterval}
                                    onChangeText={setTeamInterval}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.configRow}>
                            <View style={styles.configField}>
                                <Text style={styles.configLabel}>Nº de Equipes</Text>
                                <TextInput
                                    style={styles.configInput}
                                    value={teamCount}
                                    onChangeText={setTeamCount}
                                    keyboardType="number-pad"
                                />
                            </View>
                            <View style={styles.configField}>
                                <Text style={styles.configLabel}>Intervalo padrão CPs (min)</Text>
                                <View style={styles.timeRow}>
                                    <TextInput
                                        style={[styles.configInput, { flex: 1 }]}
                                        value={defaultCpInterval}
                                        onChangeText={setDefaultCpInterval}
                                        keyboardType="number-pad"
                                    />
                                    <TouchableOpacity style={styles.applyBtn} onPress={handleApplyAll}>
                                        <Text style={styles.applyBtnText}>Aplicar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Checkpoints Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Checkpoints ({checkpoints.length - 2} CPs)</Text>
                    <TouchableOpacity style={styles.addCpBtn} onPress={handleAddCp}>
                        <Feather name="plus" size={16} color={Colors.green} />
                        <Text style={styles.addCpText}>Adicionar</Text>
                    </TouchableOpacity>
                </View>

                {checkpoints.map((cp, idx) => (
                    <View key={cp.id} style={styles.cpRow}>
                        <View style={[styles.cpDot,
                        idx === 0 && { backgroundColor: Colors.green },
                        idx === checkpoints.length - 1 && { backgroundColor: '#ef4444' },
                        ]} />
                        <TextInput
                            style={styles.cpName}
                            value={cp.name}
                            onChangeText={(v) => handleUpdateName(idx, v)}
                            editable={idx !== 0 && idx !== checkpoints.length - 1}
                        />
                        <View style={styles.cpOffsetContainer}>
                            <TextInput
                                style={styles.cpOffset}
                                value={String(cp.offsetFromPrevMinutes)}
                                onChangeText={(v) => handleUpdateOffset(idx, v)}
                                keyboardType="number-pad"
                                editable={idx !== 0}
                            />
                            <Text style={styles.cpOffsetLabel}>min</Text>
                        </View>
                        {idx > 0 && idx < checkpoints.length - 1 && (
                            <TouchableOpacity onPress={() => handleRemoveCp(idx)} style={styles.cpRemove}>
                                <Feather name="trash-2" size={14} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {/* Time Table */}
                <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12, paddingHorizontal: Theme.spacing.l }]}>
                    Tabela de Tempos
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingHorizontal: Theme.spacing.m }}>
                    <View>
                        {/* Table Header */}
                        <View style={styles.tableHeaderRow}>
                            <View style={styles.tableTeamCell}>
                                <Text style={styles.tableHeaderText}>Equipe</Text>
                            </View>
                            {checkpoints.map((cp, idx) => {
                                const accum = getAccumulatedOffset(idx);
                                return (
                                    <View key={cp.id} style={styles.tableHeaderCell}>
                                        <Text style={styles.tableHeaderCpName} numberOfLines={1}>{cp.name}</Text>
                                        <Text style={styles.tableHeaderAccum}>+{accum}m</Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Table Rows */}
                        {teams.map((team) => (
                            <View key={team.id} style={styles.tableRow}>
                                <View style={styles.tableTeamCell}>
                                    <Text style={styles.tableTeamNumber}>#{team.number}</Text>
                                    <Text style={styles.tableTeamDelay}>+{team.startOffsetMinutes}m</Text>
                                </View>
                                {checkpoints.map((cp, idx) => {
                                    const accum = getAccumulatedOffset(idx);
                                    return (
                                        <View key={cp.id} style={styles.tableCell}>
                                            <Text style={styles.tableCellTime}>
                                                {calculateTime(team.startOffsetMinutes, accum)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.black },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: Colors.gray, marginTop: 12, fontSize: 14, fontWeight: '600' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.l,
        paddingVertical: Theme.spacing.m, gap: 12,
    },
    backButton: { padding: 4 },
    headerTitle: { flex: 1, color: Colors.white, fontSize: 20, fontWeight: '800' },
    configToggle: { padding: 8, backgroundColor: Colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: Colors.darkGray },
    saveButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.green, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    },
    saveButtonOffline: {
        backgroundColor: '#f59e0b', // amber
    },
    saveButtonText: { color: Colors.black, fontSize: 13, fontWeight: '800' },
    offlineBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: Theme.spacing.l, paddingVertical: 8,
        borderBottomWidth: 1, borderBottomColor: 'rgba(245, 158, 11, 0.3)', marginBottom: 8,
    },
    offlineText: { color: '#fbbf24', fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },

    // Config
    configCard: {
        marginHorizontal: Theme.spacing.l, marginBottom: 20,
        backgroundColor: Colors.cardBg, borderRadius: 16, padding: Theme.spacing.l,
        borderWidth: 1, borderColor: Colors.darkGray,
    },
    configTitle: { color: Colors.white, fontSize: 16, fontWeight: '700', marginBottom: 16 },
    configRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    configField: { flex: 1 },
    configLabel: { color: Colors.gray, fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    configInput: {
        backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.darkGray,
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
        color: Colors.green, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'],
    },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timeSeparator: { color: Colors.white, fontSize: 20, fontWeight: '800' },
    applyBtn: {
        backgroundColor: 'rgba(0, 255, 65, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 255, 65, 0.3)',
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    },
    applyBtnText: { color: Colors.green, fontSize: 12, fontWeight: '800' },

    // Checkpoints
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Theme.spacing.l, marginBottom: 8,
    },
    sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    addCpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0, 255, 65, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    addCpText: { color: Colors.green, fontSize: 12, fontWeight: '700' },
    cpRow: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: Theme.spacing.l,
        marginBottom: 6, backgroundColor: Colors.cardBg, borderRadius: 12,
        padding: 12, gap: 10, borderWidth: 1, borderColor: Colors.darkGray,
    },
    cpDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6' },
    cpName: { flex: 1, color: Colors.white, fontSize: 14, fontWeight: '700' },
    cpOffsetContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cpOffset: {
        width: 50, backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.darkGray,
        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6,
        color: Colors.green, fontSize: 14, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'],
    },
    cpOffsetLabel: { color: Colors.gray, fontSize: 11, fontWeight: '600' },
    cpRemove: { padding: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 },

    // Time Table
    tableHeaderRow: {
        flexDirection: 'row', backgroundColor: '#151917',
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        borderWidth: 1, borderColor: Colors.darkGray,
    },
    tableTeamCell: {
        width: 90, paddingVertical: 12, paddingHorizontal: 10,
        borderRightWidth: 1, borderRightColor: Colors.darkGray,
    },
    tableHeaderText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
    tableHeaderCell: {
        width: 85, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center',
        borderRightWidth: 1, borderRightColor: 'rgba(28,34,32,0.5)',
    },
    tableHeaderCpName: { color: Colors.white, fontSize: 11, fontWeight: '700' },
    tableHeaderAccum: {
        color: Colors.green, fontSize: 9, fontWeight: '800', marginTop: 4,
        backgroundColor: 'rgba(0, 255, 65, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    tableRow: {
        flexDirection: 'row', borderWidth: 1, borderTopWidth: 0, borderColor: Colors.darkGray,
        backgroundColor: Colors.cardBg,
    },
    tableTeamNumber: { color: Colors.white, fontSize: 13, fontWeight: '800' },
    tableTeamDelay: { color: Colors.gray, fontSize: 9, fontWeight: '600' },
    tableCell: {
        width: 85, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center',
        borderRightWidth: 1, borderRightColor: 'rgba(28,34,32,0.5)',
    },
    tableCellTime: { color: Colors.white, fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

