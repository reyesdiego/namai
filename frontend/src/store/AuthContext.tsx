import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  photo_url?: string;
  begin_date?: string;
  end_date?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await api.get<User>('/users/me');
          setUser(data);
        } catch (error) {
          console.error("Token invalid or expired");
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
