import { useContext } from 'react';
import { UserContext } from '@/context/user-context';

export const useAuth = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  
  return context;
};
