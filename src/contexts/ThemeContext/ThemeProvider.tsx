import { useEffect, useState } from 'react';
import { setThemeMode } from '../../utils';
import ThemeContext from './ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const DEFAULT_DARK_MODE = true;

export const ThemeProvider = (props: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useState<boolean>(DEFAULT_DARK_MODE);
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
