import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

interface UserContextType {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Create default user
const defaultUser: User = {
  id: 1,
  username: 'defaultuser',
  email: 'user@example.com',
  name: 'Demo User',
  createdAt: new Date()
};

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  isLoading: false,
  isAuthenticated: true
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Default user is always available
  const value = {
    user: defaultUser,
    isLoading,
    isAuthenticated: true
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
