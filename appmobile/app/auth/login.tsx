import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser } from '../../services/api';
import { AlertModal, AlertAction } from '../../components/AlertModal';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; actions?: AlertAction[] }>({ visible: false, title: '', message: '' });

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setAlertConfig({ visible: true, title: 'Erro', message: 'Preencha email e senha.' });
            return;
        }

        setLoading(true);
        try {
            await loginUser(email.trim(), password);
            router.replace('/(tabs)');
        } catch (err: any) {
            setAlertConfig({ visible: true, title: 'Erro ao entrar', message: err.message || 'Credenciais inválidas' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={styles.glowContainer}>
                    <LinearGradient
                        colors={[Colors.greenDim || 'rgba(0, 255, 100, 0.15)', 'transparent']}
                        style={styles.glow}
                    />
                </View>

                <View style={{ height: 60 }} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    <View style={styles.heroSection}>
                        <View style={styles.logoBadge}>
                            <Feather name="hexagon" size={32} color={Colors.black} />
                        </View>
                        <Text style={styles.mainTitle}>Bem-vindo</Text>
                        <Text style={styles.description}>
                            Entre para ver seus eventos, gerenciar ingressos e conectar-se com seus grupos.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.inputLabel}>EMAIL</Text>
                        <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
                            <Feather name="mail" size={20} color={focusedInput === 'email' ? Colors.green : Colors.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="seu@email.com"
                                placeholderTextColor={Colors.darkGray}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <Text style={styles.inputLabel}>SENHA</Text>
                        <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
                            <Feather name="lock" size={20} color={focusedInput === 'password' ? Colors.green : Colors.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="••••••••"
                                placeholderTextColor={Colors.darkGray}
                                secureTextEntry
                                autoCapitalize="none"
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Recuperar senha</Text>
                        </TouchableOpacity>

                        <Button
                            title={loading ? 'Entrando...' : 'Entrar'}
                            onPress={handleLogin}
                            icon={<Feather name="arrow-right" size={20} color={Colors.black} />}
                        />
                    </View>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OU CONTINUE COM</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Feather name="twitter" size={20} color={Colors.white} />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Feather name="github" size={20} color={Colors.white} />
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Text style={styles.signupText}>Ainda nao tem uma conta? </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/register')}>
                        <Text style={styles.signupHighlight}>Cadastrar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <AlertModal
                {...alertConfig}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.black },
    glowContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 400, zIndex: 0 },
    glow: { flex: 1 },
    content: { padding: Theme.spacing.l, paddingBottom: 40, zIndex: 10 },
    heroSection: { marginBottom: Theme.spacing.xxxl },
    logoBadge: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: Theme.spacing.xl },
    mainTitle: { color: Colors.white, fontSize: 40, fontWeight: '900', letterSpacing: -1, marginBottom: Theme.spacing.m },
    description: { color: Colors.gray, fontSize: 16, lineHeight: 24 },
    formContainer: { marginBottom: Theme.spacing.xxxl },
    inputLabel: { color: Colors.gray, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: Theme.spacing.s, marginTop: Theme.spacing.l },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.black, borderWidth: 2, borderColor: Colors.cardBg, borderRadius: Theme.borderRadius.xlarge, height: 60, paddingHorizontal: Theme.spacing.l },
    inputWrapperFocused: { borderColor: Colors.green, backgroundColor: 'rgba(0, 255, 100, 0.05)' },
    inputIcon: { marginRight: Theme.spacing.m },
    textInput: { flex: 1, color: Colors.white, fontSize: 16, fontWeight: '500' },
    forgotPassword: { alignSelf: 'flex-end', marginTop: Theme.spacing.l, marginBottom: Theme.spacing.xxxl },
    forgotPasswordText: { color: Colors.green, fontSize: 14, fontWeight: '700' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.xxl },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.cardBg },
    dividerText: { color: Colors.gray, fontSize: 12, fontWeight: '800', letterSpacing: 1, paddingHorizontal: Theme.spacing.l },
    socialContainer: { flexDirection: 'row', gap: Theme.spacing.m },
    socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.large, height: 56, gap: Theme.spacing.s },
    socialButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    footer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: Theme.spacing.xl, borderTopWidth: 1, borderTopColor: Colors.cardBg },
    signupText: { color: Colors.gray, fontSize: 15 },
    signupHighlight: { color: Colors.green, fontSize: 15, fontWeight: '800' },
});
