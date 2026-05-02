import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { verifyOTP, signInWithEmail } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (email && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [email]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];

    if (text.length > 1) {
      const digits = text.split('').slice(0, 6);
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const lastFilledIndex = Math.min(digits.length, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    } else {
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setError(null);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { user, error: authError } = await verifyOTP(email, otpCode);

    setIsLoading(false);

    if (authError || !user) {
      setError(authError || 'Verification failed');
    } else {
      setLoading(true);
      setUser(user);
      setLoading(false);
      router.replace('/(main)');
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setResendMessage(null);

    const { error } = await signInWithEmail(email);
    setIsResending(false);

    if (error) {
      setResendMessage(error);
    } else {
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      setResendMessage('New code sent! Check your email.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </Pressable>

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Verify OTP
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Enter the 6-digit code sent to
            </ThemedText>
            <ThemedText type="small" style={styles.email}>
              {email}
            </ThemedText>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                editable={!isLoading}
              />
            ))}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.light.danger} />
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          )}

          <Pressable
            style={[styles.button, otp.join('').length !== 6 && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading || otp.join('').length !== 6}>
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </ThemedText>
          </Pressable>

          {resendMessage && (
            <View style={[styles.resendMessage, resendMessage.includes('sent') ? styles.resendSuccess : styles.resendError]}>
              <Ionicons name={resendMessage.includes('sent') ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={16} 
                color={resendMessage.includes('sent') ? Colors.light.success : Colors.light.danger} />
              <ThemedText type="small" style={[styles.resendMessageText, resendMessage.includes('sent') ? styles.resendSuccessText : styles.resendErrorText]}>
                {resendMessage}
              </ThemedText>
            </View>
          )}

          <Pressable 
            style={styles.resendContainer} 
            onPress={handleResendOTP}
            disabled={isResending || resendCooldown > 0}>
            <ThemedText type="small" themeColor="textSecondary">
              Didn't receive code?{' '}
            </ThemedText>
            <ThemedText type="small" style={[styles.resendText, (isResending || resendCooldown > 0) && styles.resendTextDisabled]}>
              {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  backButton: {
    padding: Spacing.two,
    marginTop: Spacing.two,
    width: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.six,
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.half,
  },
  email: {
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius,
    backgroundColor: Colors.light.backgroundElement,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
  },
  otpInputFilled: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  otpInputError: {
    borderColor: Colors.light.danger,
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius,
    padding: Spacing.two,
    marginBottom: Spacing.three,
  },
  errorText: {
    color: Colors.light.danger,
    marginLeft: Spacing.one,
    flex: 1,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  resendMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  resendSuccess: { backgroundColor: '#DCFCE7' },
  resendError: { backgroundColor: '#FEE2E2' },
  resendMessageText: { marginLeft: Spacing.one, flex: 1 },
  resendSuccessText: { color: Colors.light.success, fontWeight: '500' },
  resendErrorText: { color: Colors.light.danger, fontWeight: '500' },
  resendTextDisabled: {
    color: Colors.light.textSecondary,
    fontWeight: '400',
  },
});
