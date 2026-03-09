import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ModalProps } from 'react-native';
import { Colors } from '../constants/Colors';
import { Theme } from '../constants/Theme';

export interface AlertAction {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AlertModalProps extends ModalProps {
    visible: boolean;
    title: string;
    message?: string;
    actions?: AlertAction[];
    onClose?: () => void;
}

export function AlertModal({ visible, title, message, actions = [], onClose, ...props }: AlertModalProps) {
    const defaultActions: AlertAction[] = [{ text: 'OK', onPress: onClose }];
    const displayActions = actions.length > 0 ? actions : defaultActions;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            {...props}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>{title}</Text>
                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    <View style={styles.actionsContainer}>
                        {displayActions.map((action, index) => {
                            const isDestructive = action.style === 'destructive';
                            const isCancel = action.style === 'cancel';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        isDestructive && styles.destructiveButton,
                                        isCancel && styles.cancelButton,
                                        displayActions.length === 2 && styles.halfButton // Side by side if 2
                                    ]}
                                    onPress={() => {
                                        if (action.onPress) action.onPress();
                                        if (onClose) onClose();
                                    }}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        isDestructive && styles.destructiveText,
                                        isCancel && styles.cancelText
                                    ]}>
                                        {action.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Theme.spacing.l,
    },
    alertBox: {
        backgroundColor: Colors.cardBg,
        borderRadius: 16,
        padding: Theme.spacing.l,
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: Colors.darkGray,
    },
    title: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: Theme.spacing.s,
        textAlign: 'center',
    },
    message: {
        color: Colors.gray,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: Theme.spacing.xl,
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: Theme.spacing.s,
    },
    button: {
        backgroundColor: Colors.green,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minWidth: '100%',
    },
    halfButton: {
        minWidth: '48%',
    },
    cancelButton: {
        backgroundColor: Colors.darkGray,
    },
    destructiveButton: {
        backgroundColor: '#ef4444',
    },
    buttonText: {
        color: Colors.black,
        fontSize: 14,
        fontWeight: 'bold',
    },
    cancelText: {
        color: Colors.white,
    },
    destructiveText: {
        color: Colors.white,
    },
});
