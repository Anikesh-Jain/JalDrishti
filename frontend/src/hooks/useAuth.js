import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to access centralized JalDrishti authentication context
 * Provides user, token, isAuthenticated, isLoading, login, register, googleLogin, logout.
 */
export { useAuth };
export default useAuth;
