import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Footer() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        Made with{' '}
        <Ionicons name="heart" size={12} color="#E74C3C" />
        {' '}in India
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.four,
  },
  text: {
    fontSize: 12,
  },
});
