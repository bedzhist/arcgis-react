import { useEffect, useState } from 'react';
import { setThemeMode } from '../../utils';
import ThemeContext from './ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useState<boolean>(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [ready, setReady] = useState<boolean>(false);

  const updateDarkMode = (value: boolean) => {
    setDarkMode(value);
  };

  useEffect(() => {
    setThemeMode(darkMode ? 'dark' : 'light');
    setReady(true);
  }, [darkMode]);

  return (
    <ThemeContext
      value={{
        darkMode,
        updateDarkMode
      }}
    >
      {ready && props.children}
    </ThemeContext>
  );
};
