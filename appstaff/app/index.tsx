import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginUser } from '../services/api';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Preencha e-mail e senha.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await loginUser(email, password);
            router.replace('/home');
        } catch (err: any) {
            setError(err.message || 'Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Feather name="shield" size={40} color={Colors.green} />
                </View>
                <Text style={styles.title}>Staff Portal</Text>
                <Text style={styles.subtitle}>Acesso restrito para moderadores</Text>
            </View>

            <View style={styles.form}>
                {error ? (
                    <View style={styles.errorBox}>
                        <Feather name="alert-circle" size={16} color="#ff4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color={Colors.gray} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                        placeholderTextColor={Colors.gray}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color={Colors.gray} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Senha ou PIN"
                        placeholderTextColor={Colors.gray}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.loginButton, (!email || !password || loading) && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={!email || !password || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.black} />
                    ) : (
                        <Text style={styles.loginButtonText}>Entrar no Sistema</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
        padding: Theme.spacing.l,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.cardBg,
        borderWidth: 2,
        borderColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray,
        marginTop: 8,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        padding: 12,
        borderRadius: Theme.borderRadius.medium,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    errorText: {
        color: '#ff4444',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBg,
        borderWidth: 1,
        borderColor: '#222',
        borderRadius: Theme.borderRadius.large,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 60,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: Colors.white,
        fontSize: 16,
        height: '100%',
    },
    loginButton: {
        backgroundColor: Colors.green,
        height: 60,
        borderRadius: Theme.borderRadius.large,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    loginButtonDisabled: {
        backgroundColor: Colors.greenDim,
        opacity: 0.7,
    },
    loginButtonText: {
        color: Colors.black,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
