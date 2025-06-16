import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import type { User, UserRole } from '@/types/auth';
import { setCredentials, logout as logoutAction, setCurrentRole as setCurrentRoleAction } from '@/redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, currentRole } = useSelector(
    (state: RootState) => state.auth
  );

  const login = (user: User, token: string) => {
    dispatch(setCredentials({ user, token }));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const updateCurrentRole = (role: UserRole) => {
    dispatch(setCurrentRoleAction(role));
  };

  return {
    user,
    token,
    isAuthenticated,
    currentRole,
    login,
    logout,
    setCurrentRole: updateCurrentRole,
  };
};
