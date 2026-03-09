import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { createTeam, inviteToTeam } from '../../services/api';
import { AlertModal, AlertAction } from '../../components/AlertModal';

export default function CreateGroupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [groupName, setGroupName] = useState('');
    const [inviteEmails, setInviteEmails] = useState<string[]>([]);
    const [inviteInput, setInviteInput] = useState('');
    const [creating, setCreating] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; actions?: AlertAction[] }>({ visible: false, title: '', message: '' });

    const handleAddInvite = () => {
        const email = inviteInput.trim().toLowerCase();
        if (!email) return;
        if (inviteEmails.length >= 9) {
            setAlertConfig({ visible: true, title: 'Limite', message: 'Os grupos de evento têm um limite máximo de 10 membros (Você + 9 convidados).' });
            return;
        }
        if (inviteEmails.includes(email)) {
            setAlertConfig({ visible: true, title: 'Duplicado', message: 'Este email já foi adicionado.' });
            return;
        }
        setInviteEmails([...inviteEmails, email]);
        setInviteInput('');
    };

    const handleRemoveInvite = (index: number) => {
        setInviteEmails(inviteEmails.filter((_, i) => i !== index));
    };

    const handleCreate = async () => {
        if (!groupName.trim()) {
            setAlertConfig({ visible: true, title: 'Erro', message: 'Informe o nome do grupo.' });
            return;
        }

        setCreating(true);
        try {
            const team = await createTeam(groupName.trim());

            // Send invites
            let failedInvites: string[] = [];
            for (const email of inviteEmails) {
                try {
                    await inviteToTeam(team.id, email);
                } catch (e: any) {
                    console.log('Invite failed for', email, e);
                    failedInvites.push(email);
                }
            }

            if (failedInvites.length > 0) {
                setAlertConfig({
                    visible: true,
                    title: 'Alguns convites falharam',
                    message: `Os seguintes emails não possuem registro no app e não puderam ser convidados:\n\n${failedInvites.join('\n')}`,
                    actions: [{ text: 'OK', onPress: () => router.replace('/(tabs)/groups') }]
                });
            } else {
                router.replace('/(tabs)/groups');
            }
        } catch (err: any) {
            setAlertConfig({ visible: true, title: 'Erro', message: err.message || 'Não foi possível criar o grupo.' });
        } finally {
            setCreating(false);
        }
    };

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={20} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Criar Novo Grupo</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {/* Photo Upload */}
                <View style={styles.uploadSection}>
                    <TouchableOpacity style={styles.uploadCircle} activeOpacity={0.8}>
                        <View style={styles.uploadIconInner}>
                            <Feather name="image" size={32} color={Colors.darkGray} />
                        </View>
                        <View style={styles.plusBadge}>
                            <Feather name="plus" size={16} color={Colors.black} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.uploadLabel}>FOTO DO GRUPO</Text>
                </View>

                {/* Group Name Input */}
                <Text style={styles.inputLabel}>Nome do Grupo</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ex. Squad Trekking..."
                        placeholderTextColor={Colors.darkGray}
                        value={groupName}
                        onChangeText={setGroupName}
                    />
                </View>

                {/* Invite Members by Email */}
                <View style={styles.inviteHeader}>
                    <Text style={styles.sectionTitle}>Convidar Membros</Text>
                    <Text style={styles.selectedCount}>{inviteEmails.length} Convidados</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Feather name="mail" size={20} color={Colors.darkGray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Email do convidado..."
                        placeholderTextColor={Colors.darkGray}
                        value={inviteInput}
                        onChangeText={setInviteInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onSubmitEditing={handleAddInvite}
                    />
                    <TouchableOpacity onPress={handleAddInvite} style={styles.addButton}>
                        <Feather name="plus" size={20} color={Colors.black} />
                    </TouchableOpacity>
                </View>

                {inviteEmails.length > 0 && (
                    <View style={styles.emailsList}>
                        {inviteEmails.map((email, index) => (
                            <View key={index} style={styles.emailPill}>
                                <Feather name="user" size={14} color={Colors.white} />
                                <Text style={styles.emailPillText}>{email}</Text>
                                <TouchableOpacity onPress={() => handleRemoveInvite(index)}>
                                    <Feather name="x" size={14} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={creating ? '' : 'Criar Grupo'}
                    onPress={handleCreate}
                    icon={creating ? <ActivityIndicator color={Colors.black} /> : <Feather name="arrow-right" size={20} color={Colors.black} />}
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Theme.spacing.l, paddingVertical: Theme.spacing.l, borderBottomWidth: 1, borderBottomColor: Colors.cardBg },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardBg, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: Colors.white, fontSize: 18, fontWeight: '700' },
    content: { padding: Theme.spacing.l, paddingBottom: 100 },
    uploadSection: { alignItems: 'center', marginBottom: Theme.spacing.xxxl, marginTop: Theme.spacing.xl },
    uploadCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: Colors.darkGray, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: Theme.spacing.m, position: 'relative' },
    uploadIconInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.cardBg, alignItems: 'center', justifyContent: 'center' },
    plusBadge: { position: 'absolute', bottom: 0, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.black },
    uploadLabel: { color: Colors.gray, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    inputLabel: { color: Colors.white, fontSize: 14, fontWeight: '700', marginBottom: Theme.spacing.s },
    inputContainer: { borderWidth: 1, borderColor: Colors.green, borderRadius: Theme.borderRadius.xlarge, height: 56, justifyContent: 'center', paddingHorizontal: Theme.spacing.l, marginBottom: Theme.spacing.xxxl },
    textInput: { color: Colors.white, fontSize: 16 },
    inviteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.l },
    sectionTitle: { color: Colors.white, fontSize: 20, fontWeight: '800' },
    selectedCount: { color: Colors.green, fontSize: 14, fontWeight: '600' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.xlarge, height: 48, paddingHorizontal: Theme.spacing.l, marginBottom: Theme.spacing.l, borderWidth: 1, borderColor: Colors.darkGray, gap: Theme.spacing.s },
    searchInput: { flex: 1, color: Colors.white, fontSize: 16 },
    addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
    emailsList: { gap: Theme.spacing.s },
    emailPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, paddingHorizontal: 16, paddingVertical: 12, borderRadius: Theme.borderRadius.xlarge, gap: 12, borderWidth: 1, borderColor: Colors.darkGray },
    emailPillText: { flex: 1, color: Colors.white, fontSize: 14 },
    footer: { padding: Theme.spacing.l, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.cardBg },
});
