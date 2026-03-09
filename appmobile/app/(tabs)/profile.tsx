import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { useRouter } from 'expo-router';
import { getStoredUser, logoutUser, fetchUserStats } from '../../services/api';
import { AlertModal, AlertAction } from '../../components/AlertModal';

const MenuItem = ({ title, icon, color, onPress }: { title: string, icon: any, color: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuItemIcon}>
            <Feather name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.menuItemTitle, { color }]}>{title}</Text>
        <Feather name="chevron-right" size={20} color={Colors.gray} />
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>({ events_count: '--', certificates_count: '--', points: '--' });
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; actions?: AlertAction[] }>({ visible: false, title: '', message: '' });

    useEffect(() => {
        getStoredUser().then(u => setUser(u));
        fetchUserStats().then(s => setStats(s)).catch(() => { });
    }, []);

    const handleLogout = async () => {
        setAlertConfig({
            visible: true,
            title: 'Sair',
            message: 'Tem certeza que deseja sair?',
            actions: [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair', style: 'destructive', onPress: async () => {
                        await logoutUser();
                        router.replace('/auth/login');
                    }
                }
            ]
        });
    };

    const userName = user?.name || 'Usuário';
    const userEmail = user?.email || '';
    const userRole = user?.role === 'STANDARD_CREATOR' ? 'Organizador de Eventos'
        : user?.role === 'TREKKING_CREATOR' ? 'Organizador de Trekking'
            : user?.role === 'DEVELOPER' ? 'Desenvolvedor'
                : 'Participante';
    const initials = userName.substring(0, 2).toUpperCase();

    const options = [
        { id: 'edit', title: 'Editar Perfil', icon: 'user' as const, color: Colors.white },
        { id: 'notifications', title: 'Notificações', icon: 'bell' as const, color: Colors.white },
        { id: 'privacy', title: 'Segurança e Privacidade', icon: 'shield' as const, color: Colors.white },
        { id: 'help', title: 'Ajuda e Suporte', icon: 'help-circle' as const, color: Colors.white },
        { id: 'logout', title: 'Sair', icon: 'log-out' as const, color: '#FF4444' },
    ];

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Perfil</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarBorder}>
                        <Avatar size={96} initials={initials} />
                    </View>
                    <Text style={styles.nameText}>{userName}</Text>
                    <Text style={styles.roleText}>{userRole}</Text>
                    <Text style={styles.emailText}>{userEmail}</Text>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                    <Feather name="log-out" size={20} color="#FF4444" />
                    <Text style={styles.logoutButtonText}>Sair da Conta</Text>
                </TouchableOpacity>

                <View style={styles.footerInfo}>
                    <Text style={styles.versionText}>Trekking Ecosystem v1.0.0</Text>
                </View>

            </ScrollView>

            <AlertModal
                {...alertConfig}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    header: {
        paddingHorizontal: Theme.spacing.l,
        marginBottom: Theme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 1,
    },
    content: {
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 100, // accommodate tab bar
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xxxl,
    },
    avatarBorder: {
        borderWidth: 2,
        borderColor: Colors.green,
        borderRadius: 50,
        padding: 2,
        marginBottom: Theme.spacing.l,
        position: 'relative',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.green,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.black,
    },
    nameText: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    roleText: {
        color: Colors.green,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    emailText: {
        color: Colors.gray,
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBg,
        borderRadius: Theme.borderRadius.large,
        padding: Theme.spacing.xl,
        marginBottom: Theme.spacing.xxxl,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        color: Colors.gray,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.darkGray,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: Theme.spacing.l,
        borderRadius: Theme.borderRadius.large,
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.3)',
        backgroundColor: 'rgba(255, 68, 68, 0.05)',
    },
    logoutButtonText: {
        color: '#FF4444',
        fontSize: 16,
        fontWeight: '700',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray,
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.black,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.l,
    },
    menuItemTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    footerInfo: {
        alignItems: 'center',
        marginTop: Theme.spacing.xxxl,
        marginBottom: Theme.spacing.l,
    },
    versionText: {
        color: Colors.gray,
        fontSize: 12,
    },
});
