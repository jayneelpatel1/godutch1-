# Resend OTP Feature Implementation

## File to Modify: `src/app/(auth)/otp.tsx`

### 1. Update Imports (Line 10)
**Change:**
```tsx
import { verifyOTP, signInWithEmail } from '@/services/authService';
```

### 2. Add State Variables (After line 17)
**Add:**
```tsx
const [isResending, setIsResending] = useState(false);
const [resendCooldown, setResendCooldown] = useState(0);
const [resendMessage, setResendMessage] = useState<string | null>(null);
```

### 3. Add Countdown Timer Effect (After line 26)
**Add:**
```tsx
useEffect(() => {
  if (resendCooldown <= 0) return;
  const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
  return () => clearTimeout(timer);
}, [resendCooldown]);
```

### 4. Replace `handleResendOTP` Function (Lines 82-84)
**Replace:**
```tsx
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
```

### 5. Update Resend UI (Replace lines 147-154)
**Replace:**
```tsx
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
```

### 6. Add New Styles (Append to StyleSheet before closing `});`)
**Add:**
```tsx
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
```

## Summary of Changes
- Wires up the "Resend" button to actually call `signInWithEmail`
- Adds a 60-second cooldown timer to prevent spam
- Shows success/error feedback messages
- Disables button during cooldown and loading states
- Clears OTP inputs on successful resend