import { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, register as authRegister, getMe } from '@/api/authApi';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getMe();
          setUser(userData);
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authLogin({ email, password });
    localStorage.setItem('token', token);
    setUser(user);
    navigate('/dashboard');
  };

  const register = async (email, password) => {
    const { token, user } = await authRegister({ email, password });
    localStorage.setItem('token', token);
    setUser(user);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);