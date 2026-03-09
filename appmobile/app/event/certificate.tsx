import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { fetchMyCertificates, fetchCertificateByHash } from '../../services/api';

export default function CertificateScreen() {
    const router = useRouter();
    const { hash, eventId } = useLocalSearchParams<{ hash?: string; eventId?: string }>();
    const insets = useSafeAreaInsets();
    const [cert, setCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCertificate();
    }, [hash, eventId]);

    const loadCertificate = async () => {
        try {
            if (hash) {
                const data = await fetchCertificateByHash(hash);
                setCert(data);
            } else {
                const all = await fetchMyCertificates();
                if (eventId) {
                    const found = all.find((c: any) => c.event_id === eventId || c.trekking_id === eventId);
                    setCert(found || all[0] || null);
                } else {
                    setCert(all[0] || null);
                }
            }
        } catch {
            setCert(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16), justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.green} />
            </View>
        );
    }

    if (!cert) {
        return (
            <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16), justifyContent: 'center', alignItems: 'center' }]}>
                <Feather name="award" size={48} color={Colors.darkGray} />
                <Text style={{ color: Colors.gray, fontSize: 16, marginTop: 16 }}>Nenhum certificado encontrado.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={{ color: Colors.green, fontWeight: '700' }}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const certDate = cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('pt-BR') : '--/--/----';

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={20} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Certificado</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.certCard}>
                    <View style={styles.certHeader}>
                        <View style={styles.certIconContainer}>
                            <Feather name="award" size={32} color={Colors.green} />
                        </View>
                        <Text style={styles.certTitle}>Certificado de Participação</Text>
                    </View>

                    <View style={styles.certBody}>
                        <Text style={styles.certLabel}>PARTICIPANTE</Text>
                        <Text style={styles.certValue}>{cert.participant_name || 'Participante'}</Text>

                        <View style={styles.certDivider} />

                        <Text style={styles.certLabel}>DATA DE EMISSÃO</Text>
                        <Text style={styles.certValue}>{certDate}</Text>

                        <View style={styles.certDivider} />

                        <Text style={styles.certLabel}>HASH DE VERIFICAÇÃO</Text>
                        <Text style={[styles.certValue, styles.hashText]}>{cert.hash}</Text>
                    </View>

                    <View style={styles.certFooter}>
                        <Feather name="shield" size={14} color={Colors.green} />
                        <Text style={styles.certFooterText}>Verificado digitalmente</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.black },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Theme.spacing.l, paddingVertical: Theme.spacing.l, borderBottomWidth: 1, borderBottomColor: Colors.cardBg },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardBg, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: Colors.white, fontSize: 18, fontWeight: '700' },
    content: { padding: Theme.spacing.l },
    certCard: { backgroundColor: Colors.cardBg, borderRadius: Theme.borderRadius.xlarge, overflow: 'hidden' },
    certHeader: { alignItems: 'center', paddingVertical: Theme.spacing.xxl, backgroundColor: 'rgba(0,255,0,0.03)' },
    certIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.greenDim, alignItems: 'center', justifyContent: 'center', marginBottom: Theme.spacing.m, borderWidth: 2, borderColor: Colors.green },
    certTitle: { color: Colors.white, fontSize: 18, fontWeight: '700' },
    certBody: { padding: Theme.spacing.l },
    certLabel: { color: Colors.gray, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
    certValue: { color: Colors.white, fontSize: 16, fontWeight: '600', marginBottom: Theme.spacing.l },
    certDivider: { height: 1, backgroundColor: Colors.darkGray, marginBottom: Theme.spacing.l },
    hashText: { fontFamily: 'monospace', fontSize: 12, color: Colors.green },
    certFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.m, gap: 6, borderTopWidth: 1, borderTopColor: Colors.darkGray },
    certFooterText: { color: Colors.gray, fontSize: 12 },
});
