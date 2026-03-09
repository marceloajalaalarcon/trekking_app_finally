import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { fetchMyTeams, registerForEvent } from '../../services/api';
import { AlertModal, AlertAction } from '../../components/AlertModal';

export default function SelectGroupScreen() {
    const router = useRouter();
    const { eventId, type, eventName } = useLocalSearchParams<{ eventId: string; type: 'trekking' | 'standard'; eventName: string }>();
    const insets = useSafeAreaInsets();

    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; actions?: AlertAction[] }>({ visible: false, title: '', message: '' });

    useEffect(() => {
        fetchMyTeams()
            .then(data => {
                setTeams(data);
                if (data.length > 0) setSelectedTeamId(data[0].id);
            })
            .catch(() => setTeams([]))
            .finally(() => setLoading(false));
    }, []);

    const handleRegister = async () => {
        if (!eventId || !type) return;
        if (type === 'trekking' && !selectedTeamId) {
            setAlertConfig({ visible: true, title: 'Erro', message: 'Selecione um time para se inscrever.' });
            return;
        }

        setSubmitting(true);
        try {
            await registerForEvent(eventId, type, selectedTeamId || undefined);
            const groupName = teams.find(t => t.id === selectedTeamId)?.name || '';
            router.push({ pathname: '/event/success', params: { eventId, type, eventName: eventName || 'Evento', groupName, teamId: selectedTeamId || undefined } });
        } catch (err: any) {
            setAlertConfig({ visible: true, title: 'Erro', message: err.message || 'Não foi possível concluir a inscrição.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={20} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{eventName || 'Evento'}</Text>
                    <Text style={styles.headerSubtitle}>INSCRIÇÃO</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {type === 'trekking' ? (
                    <>
                        <View style={styles.titleContainer}>
                            <Text style={styles.mainTitle}>Selecione um Grupo</Text>
                            <Text style={styles.description}>
                                Escolha um grupo para participar deste evento ou crie um novo para convidar amigos.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.createGroupButton}
                            onPress={() => router.push('/group/create')}
                        >
                            <View style={styles.plusIcon}>
                                <Feather name="plus" size={16} color={Colors.black} />
                            </View>
                            <Text style={styles.createGroupText}>Criar Novo Grupo</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>SEUS GRUPOS</Text>

                        {loading ? (
                            <ActivityIndicator color={Colors.green} size="large" style={{ marginTop: 40 }} />
                        ) : teams.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Feather name="users" size={48} color={Colors.darkGray} />
                                <Text style={styles.emptyText}>Nenhum grupo encontrado</Text>
                                <Text style={styles.emptySubtext}>Crie um grupo para se inscrever neste trekking.</Text>
                            </View>
                        ) : (
                            <View style={styles.groupsList}>
                                {teams.map(team => {
                                    const isSelected = selectedTeamId === team.id;
                                    return (
                                        <TouchableOpacity
                                            key={team.id}
                                            style={[styles.groupCard, isSelected && styles.groupCardSelected]}
                                            onPress={() => setSelectedTeamId(team.id)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.groupInfo}>
                                                <View style={styles.avatarContainer}>
                                                    <Avatar size={48} />
                                                    <View style={styles.groupIconBadge}>
                                                        <Feather name="users" size={10} color={Colors.white} />
                                                    </View>
                                                </View>
                                                <View style={styles.groupTextContainer}>
                                                    <Text style={styles.groupName}>{team.name}</Text>
                                                    <Text style={[styles.groupMembers, isSelected && styles.groupMembersSelected]}>
                                                        {team._count?.members || team.members?.length || 0} Membros
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                                {isSelected && <View style={styles.radioInner} />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.titleContainer}>
                        <Text style={styles.mainTitle}>Confirmar Inscrição</Text>
                        <Text style={styles.description}>
                            Você será inscrito individualmente neste evento.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={submitting ? '' : 'Confirmar Inscrição'}
                    onPress={handleRegister}
                    icon={submitting ? <ActivityIndicator color={Colors.black} /> : <Feather name="check-circle" size={20} color={Colors.black} />}
                />
            </View>

            <AlertModal
                {...alertConfig}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.black },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.l, paddingVertical: Theme.spacing.l, borderBottomWidth: 1, borderBottomColor: Colors.cardBg },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardBg, alignItems: 'center', justifyContent: 'center' },
    headerTextContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    headerSubtitle: { color: Colors.green, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    content: { padding: Theme.spacing.l, paddingBottom: 100 },
    titleContainer: { alignItems: 'center', marginBottom: Theme.spacing.xxl },
    mainTitle: { color: Colors.white, fontSize: 24, fontWeight: '800', marginBottom: Theme.spacing.m },
    description: { color: Colors.gray, fontSize: 14, textAlign: 'center', lineHeight: 20 },
    createGroupButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Theme.spacing.l, borderWidth: 1.5, borderColor: Colors.green, borderStyle: 'dashed', borderRadius: Theme.borderRadius.round, marginBottom: Theme.spacing.xxxl, gap: Theme.spacing.s },
    plusIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
    createGroupText: { color: Colors.green, fontSize: 16, fontWeight: '700' },
    sectionTitle: { color: Colors.gray, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: Theme.spacing.l },
    groupsList: { gap: Theme.spacing.m },
    groupCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.xlarge, padding: Theme.spacing.m, borderWidth: 1, borderColor: 'transparent' },
    groupCardSelected: { borderColor: Colors.green },
    groupInfo: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { position: 'relative', marginRight: Theme.spacing.m },
    groupIconBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: Colors.black, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.cardBg },
    groupTextContainer: { justifyContent: 'center' },
    groupName: { color: Colors.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
    groupMembers: { color: Colors.gray, fontSize: 12 },
    groupMembersSelected: { color: Colors.green },
    radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.darkGray, alignItems: 'center', justifyContent: 'center' },
    radioOuterSelected: { borderColor: Colors.green },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.green },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: Colors.white, fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 4 },
    emptySubtext: { color: Colors.gray, fontSize: 14, textAlign: 'center' },
    footer: { padding: Theme.spacing.l, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.cardBg },
});
