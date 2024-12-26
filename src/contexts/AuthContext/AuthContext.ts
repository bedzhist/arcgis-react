import { createContext } from 'react';

export interface AuthContextStore {
  portal?: __esri.Portal;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextStore | undefined>(
  undefined
);

export default AuthContext;
