import { createContext } from 'react';

export interface ThemeContextStore {
  isDarkMode: boolean;
  set: (value: boolean) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextStore | undefined>(
  undefined
);

export default ThemeContext;
