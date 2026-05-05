import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ThemeColor } from '@/constants/theme';

type ThemeContextType = {
  isDark: boolean;
  colors: typeof Colors.light;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: Colors.light,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() ?? 'light';
  const [isDark, setIsDark] = useState(scheme === 'dark');

  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    setIsDark(scheme === 'dark');
  }, [scheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function useTheme() {
  const { colors } = useContext(ThemeContext);
  return colors;
}
