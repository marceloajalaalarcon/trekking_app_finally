import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraView } from 'expo-camera';
import { dbService } from '../../services/TrekkingDatabase';
import { AlertModal, AlertAction } from '../../components/AlertModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CameraScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const scannedRef = useRef(false);
    const [scanMessage, setScanMessage] = useState<string>('SALVANDO...');
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; actions?: AlertAction[] }>({ visible: false, title: '', message: '' });

    // Slider state
    const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
    const isCameraActiveRef = useRef(true);

    // Sync refs when state changes
    useEffect(() => {
        isCameraActiveRef.current = isCameraActive;
    }, [isCameraActive]);

    const setAndSaveCameraState = useCallback(async (active: boolean) => {
        setIsCameraActive(active);
        try {
            await AsyncStorage.setItem('@tracking_camera_active', active ? 'true' : 'false');
        } catch (e) {
            console.error('Failed to save camera state', e);
        }
    }, []);

    // Load initial camera state
    useEffect(() => {
        const loadCameraState = async () => {
            try {
                const savedState = await AsyncStorage.getItem('@tracking_camera_active');
                if (savedState !== null) {
                    const isActive = savedState === 'true';
                    setIsCameraActive(isActive);
                    isCameraActiveRef.current = isActive;

                    // Immediately jump slider to correct position
                    translateX.setValue(isActive ? 0 : MAX_TRAVEL);
                }
            } catch (e) {
                console.error('Failed to load camera state', e);
            }
        };
        loadCameraState();
    }, []);

    useEffect(() => {
        scannedRef.current = scanned;
    }, [scanned]);

    const TRACK_WIDTH = 280;
    const THUMB_SIZE = 48;
    const PADDING = 4;
    const MAX_TRAVEL = TRACK_WIDTH - THUMB_SIZE - (PADDING * 2);

    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (e, gestureState) => {
                let val = gestureState.dx;
                if (!isCameraActiveRef.current) {
                    val = MAX_TRAVEL + gestureState.dx;
                }
                if (val < 0) val = 0;
                if (val > MAX_TRAVEL) val = MAX_TRAVEL;
                translateX.setValue(val);
            },
            onPanResponderRelease: (e, gestureState) => {
                let currentVal = gestureState.dx;
                let active = isCameraActiveRef.current;

                if (!active) {
                    currentVal = MAX_TRAVEL + gestureState.dx; // dx will be negative when dragging left
                }

                // When camera is ON, user drags right to turn off. The threshold is 80% right.
                if (active && currentVal > MAX_TRAVEL * 0.8) {
                    Animated.spring(translateX, {
                        toValue: MAX_TRAVEL,
                        useNativeDriver: true,
                    }).start(() => setAndSaveCameraState(false));
                }
                // When camera is OFF, user drags left to turn on. The threshold is 20% right (i.e. dragged 80% left).
                else if (!active && currentVal < MAX_TRAVEL * 0.2) {
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start(() => setAndSaveCameraState(true));
                }
                // Otherwise didn't drag enough, snap back to initial position
                else {
                    Animated.spring(translateX, {
                        toValue: active ? 0 : MAX_TRAVEL,
                        useNativeDriver: true,
                    }).start();
                }
            }
        })
    ).current;

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            // Ensure DB is initialized
            await dbService.init();
        };

        getCameraPermissions();
    }, []);

    const handleBarcodeScanned = useCallback(async ({ type, data }: { type: string; data: string }) => {
        if (scannedRef.current) return;
        setScanned(true);
        setScanMessage('SALVANDO...');

        // Expected format: cp_1234_hashexample or start_1234_hash
        const parts = data.split('_');
        if (parts.length >= 2) {
            const qrType = parts[0]; // 'start', 'cp', 'end'
            const qrTrekkingId = parts[1];

            if (['start', 'cp', 'end'].includes(qrType)) {
                if (qrType === 'cp' || qrType === 'end') {
                    const hasStart = await dbService.hasRegisteredStart(qrTrekkingId);
                    if (!hasStart) {
                        setScanMessage('CANCELADO');
                        setAlertConfig({
                            visible: true,
                            title: 'Ponto Inicial Ausente',
                            message: 'Você precisa registrar o CP START deste evento antes de bipar os pontos seguintes.',
                            actions: [{ text: "OK", onPress: () => setTimeout(() => setScanned(false), 2000) }]
                        });
                        return;
                    }
                }

                await dbService.saveCheckin({
                    qr_data: data,
                    type: qrType as any,
                    trekking_id: qrTrekkingId,
                    cp_id: parts[2] || 'unknown',
                    scanned_at: Date.now()
                });
                setAlertConfig({
                    visible: true,
                    title: 'Check-in Registrado!',
                    message: `Tipo: ${qrType.toUpperCase()}\nHorário: ${new Date().toLocaleTimeString('pt-BR')}`,
                    actions: [{ text: "OK", onPress: () => setTimeout(() => setScanned(false), 2000) }]
                });
                return;
            }
        }

        setScanMessage('INVÁLIDO');
        setAlertConfig({
            visible: true,
            title: "QR Code Inválido",
            message: "Este QR Code não pertence ao Tracking App.",
            actions: [{ text: "OK", onPress: () => setTimeout(() => setScanned(false), 1500) }]
        });
    }, []);

    if (hasPermission === null) {
        return <View style={styles.safeArea} />;
    }
    if (hasPermission === false) {
        return (
            <View style={[styles.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: Colors.white, fontSize: 16 }}>Sem acesso à câmera</Text>
            </View>
        );
    }

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
            <View style={styles.container}>
                {/* Real Camera View or Placeholder */}
                {isCameraActive ? (
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        enableTorch={isFlashOn}
                        onBarcodeScanned={handleBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                    />
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}>
                        <Feather name="camera-off" size={64} color={Colors.darkGray} />
                    </View>
                )}

                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                        <Feather name="x" size={24} color={Colors.green} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.iconButton} onPress={() => setIsFlashOn(!isFlashOn)}>
                        <Feather name={isFlashOn ? "zap-off" : "zap"} size={24} color={Colors.green} />
                    </TouchableOpacity>
                </View>

                {isCameraActive && (
                    <View style={styles.viewfinderContainer}>
                        <View style={styles.viewfinder}>
                            {/* Viewfinder Corners */}
                            <View style={[styles.corner, styles.topLeftCorner]} />
                            <View style={[styles.corner, styles.topRightCorner]} />
                            <View style={[styles.corner, styles.bottomLeftCorner]} />
                            <View style={[styles.corner, styles.bottomRightCorner]} />
                        </View>
                    </View>
                )}

                <View
                    style={[styles.footerOverlay, { backgroundColor: 'rgba(17,17,17,0.9)' }]}
                >
                    <Text style={[styles.footerTitle, { color: Colors.white }]}>Tracking App</Text>
                    <Text style={[styles.footerSubtitle, { color: '#ccc' }]}>Aponte para o QR Code para registrar</Text>

                    <View style={[styles.swipeContainer, { alignItems: 'center' }]}>
                        <View style={[styles.swipeTrack, { width: TRACK_WIDTH, position: 'relative', backgroundColor: isCameraActive ? Colors.green : Colors.darkGray }]}>
                            {scanned ? (
                                <Text style={styles.swipeText}>{scanMessage}</Text>
                            ) : (
                                <>
                                    <Animated.View
                                        style={[styles.swipeThumb, { transform: [{ translateX }] }]}
                                        {...panResponder.panHandlers}
                                    >
                                        <Feather name={isCameraActive ? "camera" : "camera-off"} size={20} color={isCameraActive ? Colors.green : Colors.gray} />
                                    </Animated.View>

                                    <Text style={[styles.swipeText, { color: isCameraActive ? Colors.black : Colors.white }]} pointerEvents="none">
                                        {isCameraActive ? 'DESLIGAR CÂMERA' : 'LIGAR CÂMERA'}
                                    </Text>

                                    {isCameraActive ? (
                                        <View style={[styles.arrowsRight, { right: 20 }]} pointerEvents="none">
                                            <Feather name="chevron-right" size={16} color={Colors.black} style={{ marginLeft: -8 }} />
                                            <Feather name="chevron-right" size={16} color={Colors.black} style={{ marginLeft: -8 }} />
                                        </View>
                                    ) : (
                                        <View style={[styles.arrowsRight, { left: 20, right: undefined }]} pointerEvents="none">
                                            <Feather name="chevron-left" size={16} color={Colors.white} style={{ marginRight: -8 }} />
                                            <Feather name="chevron-left" size={16} color={Colors.white} style={{ marginRight: -8 }} />
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                </View>

            </View>

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
        backgroundColor: '#EAEAEA', // Light background to simulate the preview
    },
    container: {
        flex: 1,
        position: 'relative',
    },
    cameraBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#EAEAEA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraLens: {
        width: '100%',
        height: 400,
        backgroundColor: '#111',
        borderRadius: 20,
        opacity: 0.9,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        paddingTop: Theme.spacing.m,
        zIndex: 10,
    },
    iconButton: {
        padding: 8,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.darkGray,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.green,
    },
    liveText: {
        color: Colors.green,
        fontWeight: '700',
        fontSize: 12,
    },
    viewfinderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewfinder: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: Colors.green,
    },
    topLeftCorner: {
        top: 0,
        left: 0,
        borderTopWidth: 2,
        borderLeftWidth: 2,
    },
    topRightCorner: {
        top: 0,
        right: 0,
        borderTopWidth: 2,
        borderRightWidth: 2,
    },
    bottomLeftCorner: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
    },
    bottomRightCorner: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 2,
        borderRightWidth: 2,
    },
    footerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: Theme.spacing.l,
        alignItems: 'center',
    },
    footerTitle: {
        color: Colors.black,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    footerSubtitle: {
        color: '#666',
        fontSize: 14,
        marginBottom: 40,
    },
    swipeContainer: {
        width: '100%',
        paddingHorizontal: Theme.spacing.xl,
    },
    swipeTrack: {
        backgroundColor: Colors.green,
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    swipeThumb: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.black,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    swipeText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: Colors.black,
        fontWeight: '800',
        fontSize: 14,
        zIndex: 1,
    },
    arrowsRight: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        zIndex: 1,
    },
});
