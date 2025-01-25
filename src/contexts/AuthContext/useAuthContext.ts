import { use } from 'react';
import AuthContext from '.';

export const useAuthContext = () => use(AuthContext);

export default useAuthContext;
