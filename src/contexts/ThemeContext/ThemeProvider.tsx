import { useEffect, useState } from 'react';
import { setThemeMode } from '../../utils';
import ThemeContext from './ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [ready, setReady] = useState<boolean>(false);

  const set = (value: boolean) => {
    setIsDarkMode(value);
  };
  const toggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    setThemeMode(isDarkMode ? 'dark' : 'light');
    setReady(true);
  }, [isDarkMode]);

  return (
    <ThemeContext
      value={{
        isDarkMode,
        set,
        toggle
      }}
    >
      {ready && props.children}
    </ThemeContext>
  );
};
