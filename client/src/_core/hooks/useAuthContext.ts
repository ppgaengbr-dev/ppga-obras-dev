import { useContext, createContext, ReactNode, useState, useEffect } from 'react';

export interface AuthUser {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  linkedType: string | null;
  linkedId: number | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
