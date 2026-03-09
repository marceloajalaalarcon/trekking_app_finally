import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing, withDelay } from 'react-native-reanimated';

export default function RegistrationSuccessScreen() {
    const router = useRouter();
    const { eventName, groupName, eventId, type, teamId } = useLocalSearchParams<{
        eventName: string; groupName: string; eventId: string; type: string; teamId?: string;
    }>();
    const insets = useSafeAreaInsets();
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
        opacity.value = withDelay(300, withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) }));
    }, [scale, opacity]);

    const animatedCheckmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: withTiming(opacity.value === 1 ? 0 : 20, { duration: 500 }) }],
    }));

    return (
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Animated.View style={[styles.checkmarkContainer, animatedCheckmarkStyle]}>
                        <Feather name="check" size={48} color={Colors.green} />
                    </Animated.View>

                    <Animated.View style={[styles.textContainer, animatedContentStyle]}>
                        <Text style={styles.title}>Inscrição{'\n'}Concluída!</Text>
                        <Text style={styles.subtitle}>
                            Você agora está inscrito em <Text style={styles.highlight}>{eventName || 'Evento'}</Text>
                            {groupName ? (
                                <Text>{'\n'}com o grupo <Text style={styles.highlight}>{groupName}</Text>.</Text>
                            ) : '.'}
                        </Text>
                    </Animated.View>
                </View>

                <Animated.View style={[styles.footer, animatedContentStyle]}>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Ver Meu Ingresso"
                            onPress={() => router.push({ pathname: '/event/ticket', params: { eventId, type, teamId } })}
                        />
                    </View>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Voltar ao Início"
                            variant="outline"
                            onPress={() => router.push('/')}
                        />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.black },
    container: { flex: 1, justifyContent: 'space-between' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Theme.spacing.l },
    checkmarkContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: Theme.spacing.xxxl, backgroundColor: Colors.greenDim, shadowColor: Colors.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
    textContainer: { alignItems: 'center', width: '100%' },
    title: { color: Colors.white, fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: Theme.spacing.m },
    subtitle: { color: Colors.gray, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: Theme.spacing.xxxl },
    highlight: { color: Colors.white, fontWeight: '700' },
    footer: { padding: Theme.spacing.l, paddingBottom: 32, gap: Theme.spacing.m },
    buttonWrapper: { width: '100%' },
});
