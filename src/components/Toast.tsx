import { useState, useEffect, useCallback } from 'react';
import { View, Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  type: ToastType;
  text: string;
}

export function Toast() {
  const theme = useTheme();
  const [animation] = useState(new Animated.Value(0));
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((type: ToastType, text: string) => {
    setToast({ type, text });
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false
    }).start();

    setTimeout(() => {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(() => {
        setToast(null);
      });
    }, 3000);
  }, [animation]);

  // Expose showToast globally
  useEffect(() => {
    (global as any).showToast = showToast;
    return () => { delete (global as any).showToast; };
  }, [showToast]);

  if (!toast) return null;

  const bgColor = toast.type === 'success' ? theme.success :
    toast.type === 'error' ? theme.danger : theme.textSecondary;

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
        <ThemedText style={[styles.text, { color: '#FFFFFF' }]}>{toast.text}</ThemedText>
        <Pressable onPress={() => setToast(null)}>
          <Ionicons name="close" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export function showToast(type: ToastType, text: string) {
  (global as any).showToast(type, text);
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
    fontSize: 14,
    fontWeight: '500',
  },
});
