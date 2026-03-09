import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { fetchMyTeams, createTeam, inviteToTeam, leaveTeam, removeTeamMember, getStoredUser } from '../../services/api';
import { useFocusEffect } from 'expo-router';
import { AlertModal, AlertAction } from '../../components/AlertModal';

export default function GroupsScreen() {
    const insets = useSafeAreaInsets();
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateVisible, setIsCreateVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [detailsInviteEmail, setDetailsInviteEmail] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [creating, setCreating] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; actions?: AlertAction[] }>({ visible: false, title: '', message: '' });
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadTeams();
            getStoredUser().then(u => setCurrentUserId(u?.id || ''));
        }, [])
    );

    const loadTeams = async () => {
        try {
            const data = await fetchMyTeams();
            setTeams(data);
        } catch {
            setTeams([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadTeams();
    }, []);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        setCreating(true);
        try {
            await createTeam(newGroupName.trim());
            setNewGroupName('');
            setInviteEmail('');
            setIsCreateVisible(false);
            loadTeams();
        } catch (err: any) {
            setAlertConfig({ visible: true, title: 'Erro', message: err.message || 'Não foi possível criar o grupo.' });
        } finally {
            setCreating(false);
        }
    };

    const handleInviteToGroup = async () => {
        if (!detailsInviteEmail.trim() || !selectedGroup) return;
        try {
            await inviteToTeam(selectedGroup.id, detailsInviteEmail.trim());
            setAlertConfig({ visible: true, title: 'Sucesso', message: `Convite enviado para ${detailsInviteEmail}` });
            setDetailsInviteEmail('');
            loadTeams();
            // Refresh selected group details
            const updated = await fetchMyTeams();
            const refreshed = updated.find((t: any) => t.id === selectedGroup.id);
            if (refreshed) setSelectedGroup(refreshed);
        } catch (err: any) {
            setAlertConfig({ visible: true, title: 'Erro', message: err.message || 'Não foi possível convidar.' });
        }
    };

    const handleLeaveGroup = async (teamId: string) => {
        setAlertConfig({
            visible: true,
            title: 'Sair do Grupo',
            message: 'Tem certeza que deseja sair do grupo?',
            actions: [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair', style: 'destructive', onPress: async () => {
                        try {
                            await leaveTeam(teamId);
                            setSelectedGroup(null);
                            loadTeams();
                        } catch (err: any) {
                            setTimeout(() => setAlertConfig({ visible: true, title: 'Erro', message: err.message || 'Erro ao sair.' }), 500);
                        }
                    }
                }
            ]
        });
    };

    const handleRemoveMember = async (teamId: string, userId: string) => {
        try {
            await removeTeamMember(teamId, userId);
            loadTeams();
            const updated = await fetchMyTeams();
            const refreshed = updated.find((t: any) => t.id === teamId);
            if (refreshed) setSelectedGroup(refreshed);
        } catch (err: any) {
            setAlertConfig({ visible: true, title: 'Erro', message: err.message || 'Erro ao remover membro.' });
        }
    };

    const getUserRole = (team: any) => {
        const member = team.members?.find((m: any) => m.user_id === currentUserId || m.user?.id === currentUserId);
        return member?.role || 'MEMBER';
    };

    const renderGroup = ({ item }: { item: any }) => {
        const role = getUserRole(item);
        const memberCount = item._count?.members || item.members?.length || 0;
        const roleLabel = role === 'OWNER' ? 'Dono' : role === 'ADMIN' ? 'Admin' : 'Membro';

        return (
            <TouchableOpacity style={styles.groupCard} activeOpacity={0.7} onPress={() => setSelectedGroup(item)}>
                <View style={styles.groupAvatar}>
                    <Feather name="users" size={24} color={Colors.white} />
                </View>
                <View style={styles.groupTextContent}>
                    <Text style={styles.groupName}>{item.name}</Text>
                    <Text style={styles.groupDetail}>{roleLabel} • {memberCount} membros</Text>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.gray} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Grupos de Eventos</Text>
                    <Text style={styles.headerSubtitle}>Grupos para participar de eventos</Text>
                </View>
                <TouchableOpacity style={styles.createBtn} onPress={() => setIsCreateVisible(true)}>
                    <Feather name="plus" size={20} color={Colors.black} />
                    <Text style={styles.createBtnText}>Criar</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color={Colors.green} size="large" style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={teams}
                    keyExtractor={item => item.id}
                    renderItem={renderGroup}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={<Text style={styles.sectionTitle}>Meus Grupos</Text>}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="users" size={48} color={Colors.darkGray} />
                            <Text style={styles.emptyText}>Você ainda não entrou em nenhum grupo.</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} colors={[Colors.green]} />
                    }
                />
            )}

            {/* Create Group Modal */}
            <Modal visible={isCreateVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Criar Grupo</Text>
                            <TouchableOpacity onPress={() => setIsCreateVisible(false)}>
                                <Feather name="x" size={24} color={Colors.gray} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nome do Grupo</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Ex. Squad Trekking"
                                placeholderTextColor={Colors.gray}
                                value={newGroupName}
                                onChangeText={setNewGroupName}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.modalPrimaryBtn, creating && { opacity: 0.6 }]}
                            onPress={handleCreateGroup}
                            disabled={creating}
                        >
                            {creating ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.modalPrimaryBtnText}>Criar Grupo</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Group Details Modal */}
            <Modal visible={selectedGroup !== null} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedGroup && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Detalhes do Grupo</Text>
                                    <TouchableOpacity onPress={() => setSelectedGroup(null)}>
                                        <Feather name="x" size={24} color={Colors.gray} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.detailsContainer}>
                                    <View style={[styles.groupAvatar, { width: 64, height: 64, borderRadius: 32, marginBottom: 16 }]}>
                                        <Feather name="users" size={32} color={Colors.white} />
                                    </View>
                                    <Text style={styles.detailsName}>{selectedGroup.name}</Text>
                                    <Text style={styles.detailsRole}>
                                        Sua função: {getUserRole(selectedGroup) === 'OWNER' ? 'Dono' : getUserRole(selectedGroup) === 'ADMIN' ? 'Admin' : 'Membro'}
                                    </Text>

                                    {/* Members List */}
                                    <View style={styles.groupEventsContainer}>
                                        <Text style={styles.groupEventsTitle}>
                                            Membros ({selectedGroup.members?.length || 0})
                                        </Text>
                                        {selectedGroup.members?.map((member: any) => (
                                            <View key={member.id} style={styles.groupMemberItem}>
                                                <View style={styles.memberAvatarSmall}>
                                                    <Feather name="user" size={14} color={Colors.white} />
                                                </View>
                                                <Text style={styles.memberNameText}>
                                                    {member.user?.name || 'Membro'} {member.user_id === currentUserId || member.user?.id === currentUserId ? '(Você)' : ''}
                                                </Text>
                                                {['OWNER', 'ADMIN'].includes(getUserRole(selectedGroup)) && member.user_id !== currentUserId && member.user?.id !== currentUserId && (
                                                    <TouchableOpacity
                                                        style={styles.memberRemoveBtn}
                                                        onPress={() => handleRemoveMember(selectedGroup.id, member.user_id || member.user?.id)}
                                                    >
                                                        <Feather name="user-minus" size={16} color="#FF4444" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {['OWNER', 'ADMIN'].includes(getUserRole(selectedGroup)) && (
                                    <View style={styles.adminInviteSection}>
                                        <Text style={styles.groupEventsTitle}>Convidar por Email</Text>
                                        <View style={styles.inviteInputRow}>
                                            <TextInput
                                                style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                                                placeholder="email@exemplo.com"
                                                placeholderTextColor={Colors.gray}
                                                value={detailsInviteEmail}
                                                onChangeText={setDetailsInviteEmail}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                            <TouchableOpacity style={styles.addInviteBtn} onPress={handleInviteToGroup}>
                                                <Feather name="send" size={20} color={Colors.black} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.modalDangerBtn}
                                    onPress={() => handleLeaveGroup(selectedGroup.id)}
                                >
                                    <Feather name="log-out" size={20} color="#FF4444" />
                                    <Text style={styles.modalDangerBtnText}>Sair do Grupo</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <AlertModal
                {...alertConfig}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.black },
    header: { paddingHorizontal: Theme.spacing.l, marginBottom: Theme.spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: Colors.white, fontSize: 28, fontWeight: '800' },
    headerSubtitle: { color: Colors.gray, fontSize: 14, marginTop: 4 },
    createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.green, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 6 },
    createBtnText: { color: Colors.black, fontSize: 14, fontWeight: '700' },
    listContent: { paddingHorizontal: Theme.spacing.l, paddingBottom: 120 },
    sectionTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: Theme.spacing.l, marginTop: Theme.spacing.m },
    groupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, padding: Theme.spacing.l, borderRadius: Theme.borderRadius.large, marginBottom: Theme.spacing.m },
    groupAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.darkGray, alignItems: 'center', justifyContent: 'center' },
    groupTextContent: { flex: 1, marginLeft: Theme.spacing.m },
    groupName: { color: Colors.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
    groupDetail: { color: Colors.gray, fontSize: 12 },
    emptyContainer: { padding: Theme.spacing.xl, alignItems: 'center', gap: 12 },
    emptyText: { color: Colors.gray, fontSize: 14, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: Theme.spacing.l },
    modalContent: { backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.large, padding: Theme.spacing.xl, borderWidth: 1, borderColor: Colors.darkGray, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.xl },
    modalTitle: { color: Colors.white, fontSize: 20, fontWeight: '800' },
    inputContainer: { marginBottom: Theme.spacing.xl },
    inputLabel: { color: Colors.white, fontSize: 14, fontWeight: '600', marginBottom: 8 },
    modalInput: { backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.darkGray, borderRadius: 8, padding: Theme.spacing.m, color: Colors.white, fontSize: 16 },
    modalPrimaryBtn: { backgroundColor: Colors.green, padding: Theme.spacing.m, borderRadius: 8, alignItems: 'center' },
    modalPrimaryBtnText: { color: Colors.black, fontSize: 16, fontWeight: '700' },
    detailsContainer: { alignItems: 'center', marginBottom: Theme.spacing.l },
    detailsName: { color: Colors.white, fontSize: 24, fontWeight: '800', marginBottom: 4 },
    detailsRole: { color: Colors.green, fontSize: 14, fontWeight: '600', marginBottom: Theme.spacing.xl },
    groupEventsContainer: { width: '100%', marginTop: Theme.spacing.l },
    groupEventsTitle: { color: Colors.white, fontSize: 16, fontWeight: '700', marginBottom: Theme.spacing.l },
    groupMemberItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.black },
    memberAvatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.darkGray, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    memberNameText: { flex: 1, color: Colors.white, fontSize: 14, fontWeight: '600' },
    memberRemoveBtn: { padding: 6, backgroundColor: 'rgba(255,68,68,0.1)', borderRadius: 8 },
    adminInviteSection: { width: '100%', marginBottom: Theme.spacing.xxl, paddingTop: Theme.spacing.l, borderTopWidth: 1, borderTopColor: Colors.darkGray },
    inviteInputRow: { flexDirection: 'row', gap: Theme.spacing.s },
    addInviteBtn: { width: 48, height: 48, backgroundColor: Colors.green, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    modalDangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.m, borderRadius: 8, borderWidth: 1, borderColor: '#FF4444', backgroundColor: 'rgba(255,68,68,0.1)', gap: 8 },
    modalDangerBtnText: { color: '#FF4444', fontSize: 16, fontWeight: '700' },
});
