import { createContext } from 'react';

export interface ThemeContextStore {
  darkMode: boolean;
  updateDarkMode: (value: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextStore | undefined>(
  undefined
);

export default ThemeContext;
