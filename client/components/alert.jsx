import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS } from '../Color';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CustomAlert({
  visible,
  title = 'Alert',
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = true,
  type = 'info', // 'info', 'success', 'error', 'warning'
}) {
  // Animation for scale/fade
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true })
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  // Icon and color by type
  let icon = 'information';
  let accent = '#ff98c3';
  if (type === 'success') { icon = 'check-circle'; accent = '#10B981'; }
  else if (type === 'error') { icon = 'close-circle'; accent = '#EF4444'; }
  else if (type === 'warning') { icon = 'alert-circle'; accent = '#fbbf24'; }

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, {
          borderTopColor: accent,
          borderTopWidth: 5,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }]}
        >
          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: accent + '22' }]}> {/* 22 = ~13% opacity */}
            <MaterialCommunityIcons name={icon} size={38} color={accent} />
          </View>
          <Text style={[styles.title, { color: accent }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: accent }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 26,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    alignItems: 'center',
    borderTopWidth: 5,
    borderTopColor: '#ff98c3', // default, overridden by accent
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#444',
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
