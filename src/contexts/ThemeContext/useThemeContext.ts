import { useContext } from "react";
import ThemeContext from ".";

export const useThemeContext = () => useContext(ThemeContext);

export default useThemeContext;