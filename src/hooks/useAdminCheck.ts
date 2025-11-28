import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin'
  };
};
