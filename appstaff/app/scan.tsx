import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { processStaffCheckin } from '../services/api';

export default function QRScanScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const handleBarcodeScanned = async (scanningResult: BarcodeScanningResult) => {
        if (scanned) return;
        setScanned(true);

        const { data } = scanningResult;

        try {
            const result = await processStaffCheckin(data);
            if (result.alreadyCheckedIn) {
                alert(`⚠️ ATENÇÃO: Ingresso já validado!\n\n${result.participant} (${result.event})\n\nEste ingresso já foi bipado anteriormente. Verifique se o participante está tentando entrar novamente.`);
            } else {
                alert(`✅ ${result.message}\n${result.participant} (${result.event})`);
            }
        } catch (error: any) {
            alert(`❌ Falha no Check-in:\n${error.message}`);
        } finally {
            // Libera a camera para ler o próximo ingresso
            setTimeout(() => {
                setScanned(false);
            }, 3000);
        }
    };

    if (!permission) {
        return <View style={[styles.container, { paddingTop: insets.top }]} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl }]}>
                <Feather name="camera-off" size={64} color={Colors.gray} style={{ marginBottom: 24 }} />
                <Text style={styles.title}>Câmera Bloqueada</Text>
                <Text style={styles.desc}>O AppStaff precisa acessar a câmera do seu dispositivo para bipar os ingressos na portaria.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Permitir Acesso</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
                    <Text style={{ color: Colors.gray }}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bipar Ingresso</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <MaterialCommunityIcons name="barcode-scan" size={80} color={Colors.green} style={styles.icon} />
                <Text style={styles.title}>Ler Código de Barras</Text>
                <Text style={styles.desc}>Aponte a câmera para o ingresso do participante para validar o Check-in e confirmar a presença da equipe no banco de dados.</Text>

                <View style={styles.scannerWrapper}>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr", "pdf417", "code128", "code39", "ean13", "ean8", "upc_e"]
                        }}
                        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                    />
                    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                        <View style={styles.overlay}>
                            <View style={styles.scanTarget} />
                        </View>
                    </View>
                </View>

                {scanned && (
                    <View style={styles.scannedBadge}>
                        <Feather name="check" size={16} color={Colors.black} />
                        <Text style={styles.scannedText}>Processando ingresso...</Text>
                    </View>
                )}
            </View>
        </View>
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
        justifyContent: 'space-between',
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
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Theme.spacing.xl,
    },
    icon: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 12,
        textAlign: 'center',
    },
    desc: {
        fontSize: 14,
        color: Colors.gray,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    scannerWrapper: {
        width: 300,
        height: 180,
        borderRadius: Theme.borderRadius.large,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: Colors.greenDim,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanTarget: {
        width: 280,
        height: 140,
        borderWidth: 2,
        borderColor: Colors.green,
        borderStyle: 'dashed',
        borderRadius: Theme.borderRadius.medium,
        backgroundColor: 'transparent',
    },
    scannedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.green,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 24,
        gap: 8,
    },
    scannedText: {
        color: Colors.black,
        fontWeight: 'bold',
    },
    permissionButton: {
        backgroundColor: Colors.green,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: Theme.borderRadius.medium,
        marginTop: 16,
    },
    permissionButtonText: {
        color: Colors.black,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
