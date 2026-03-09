import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { registerUser } from '../../services/api';
import { AlertModal, AlertAction } from '../../components/AlertModal';

export default function RegisterScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; actions?: AlertAction[] }>({ visible: false, title: '', message: '' });

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setAlertConfig({ visible: true, title: 'Erro', message: 'Preencha todos os campos.' });
            return;
        }
        if (password !== confirmPassword) {
            setAlertConfig({ visible: true, title: 'Erro', message: 'As senhas não coincidem.' });
            return;
        }
        if (password.length < 6) {
            setAlertConfig({ visible: true, title: 'Erro', message: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        try {
            await registerUser(name.trim(), email.trim().toLowerCase(), password);
            router.replace('/(tabs)');
        } catch (err: any) {
            setAlertConfig({ visible: true, title: 'Erro ao criar conta', message: err.message || 'Tente novamente.' });
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
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Feather name="arrow-left" size={20} color={Colors.white} />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Criar Conta</Text>
                        <Text style={styles.subtitle}>
                            Preencha seus dados para começar a participar dos eventos.
                        </Text>
                    </View>

                    {/* Name */}
                    <Text style={styles.inputLabel}>Nome Completo</Text>
                    <View style={styles.inputContainer}>
                        <Feather name="user" size={20} color={Colors.darkGray} />
                        <TextInput
                            style={styles.input}
                            placeholder="Seu nome"
                            placeholderTextColor={Colors.darkGray}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email */}
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputContainer}>
                        <Feather name="mail" size={20} color={Colors.darkGray} />
                        <TextInput
                            style={styles.input}
                            placeholder="seuemail@exemplo.com"
                            placeholderTextColor={Colors.darkGray}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password */}
                    <Text style={styles.inputLabel}>Senha</Text>
                    <View style={styles.inputContainer}>
                        <Feather name="lock" size={20} color={Colors.darkGray} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mínimo 6 caracteres"
                            placeholderTextColor={Colors.darkGray}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.darkGray} />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text style={styles.inputLabel}>Confirmar Senha</Text>
                    <View style={styles.inputContainer}>
                        <Feather name="lock" size={20} color={Colors.darkGray} />
                        <TextInput
                            style={styles.input}
                            placeholder="Repita a senha"
                            placeholderTextColor={Colors.darkGray}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title={loading ? '' : 'Criar Conta'}
                            onPress={handleRegister}
                            icon={loading ? <ActivityIndicator color={Colors.black} /> : <Feather name="arrow-right" size={20} color={Colors.black} />}
                        />
                    </View>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Já tem uma conta? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text style={styles.loginLink}>Entrar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            <AlertModal
                {...alertConfig}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    scrollContent: {
        padding: Theme.spacing.l,
        paddingBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.spacing.xxl,
    },
    headerContainer: {
        marginBottom: Theme.spacing.xxxl,
    },
    title: {
        color: Colors.white,
        fontSize: 32,
        fontWeight: '800',
        marginBottom: Theme.spacing.m,
    },
    subtitle: {
        color: Colors.gray,
        fontSize: 14,
        lineHeight: 22,
    },
    inputLabel: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Theme.spacing.s,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBg,
        borderRadius: Theme.borderRadius.xlarge,
        height: 56,
        paddingHorizontal: Theme.spacing.l,
        marginBottom: Theme.spacing.l,
        gap: Theme.spacing.m,
        borderWidth: 1,
        borderColor: Colors.darkGray,
    },
    input: {
        flex: 1,
        color: Colors.white,
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: Theme.spacing.l,
        marginBottom: Theme.spacing.l,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        color: Colors.gray,
        fontSize: 14,
    },
    loginLink: {
        color: Colors.green,
        fontSize: 14,
        fontWeight: '700',
    },
});
