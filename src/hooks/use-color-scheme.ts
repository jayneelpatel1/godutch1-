/**
 * @hook useColorScheme
 * @description Re-exports React Native's useColorScheme for consistency.
 *              On web, a hydrated version is used to avoid SSR mismatch.
 */
export { useColorScheme } from 'react-native';
