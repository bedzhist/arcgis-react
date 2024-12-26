import { useEffect, useState } from 'react';
import { auth, signOut } from '../../utils';
import AuthContext from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [portal, setPortal] = useState<__esri.Portal>();

  const logout = () => {
    signOut();
    setPortal(undefined);
  };

  useEffect(() => {
    if (
      import.meta.env.VITE_ESRI_PORTAL_URL &&
      import.meta.env.VITE_ESRI_APP_ID
    ) {
      auth()
        .then((portal) => {
          setIsAuth(true);
          setPortal(portal);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      setIsAuth(true);
    }
  }, []);

  return (
    <AuthContext
      value={{
        portal,
        logout
      }}
    >
      {isAuth && props.children}
    </AuthContext>
  );
};
