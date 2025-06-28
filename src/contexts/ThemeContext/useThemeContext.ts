import { use } from 'react';
import ThemeContext from '.';

export const useThemeContext = () => {
  const themeContext = use(ThemeContext);
  if (!themeContext) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return themeContext;
};

export default useThemeContext;
