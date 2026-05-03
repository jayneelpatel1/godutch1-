import { useState, useEffect } from 'react';
import { View, Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  type: ToastType;
  text1: string;
}

let toastRef: { show: (type: ToastType, text1: string) => void } | null = null;

export function Toast() {
  const [animation] = useState(new Animated.Value(0));
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    toastRef = {
      show: (type: ToastType, text1: string) => {
        setToast({ type, text1 });
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false, // Web doesn't support native driver
        }).start();

        setTimeout(() => {
        Animated.timing(animation, {
             toValue: 0,
             duration: 300,
             useNativeDriver: false, // Web doesn't support native driver
           }).start(() => {
            setToast(null);
          });
        }, 3000);
      },
    };

    return () => { toastRef = null; };
  }, [animation]);

  if (!toast) return null;

  const bgColor = toast.type === 'success' ? Colors.light.success :
    toast.type === 'error' ? Colors.light.danger : Colors.light.text;

  const icon = toast.type === 'success' ? 'checkmark-circle' :
    toast.type === 'error' ? 'close-circle' : 'information-circle';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animation,
          transform: [{
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            }),
          }],
        },
      ]}>
      <View style={[styles.toast, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
        <ThemedText style={styles.text}>{toast.text1}</ThemedText>
        <Pressable onPress={() => setToast(null)}>
          <Ionicons name="close" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export function showToast(type: ToastType, text1: string) {
  toastRef?.show(type, text1);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  text: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
