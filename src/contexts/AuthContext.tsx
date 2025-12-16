import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  section: string;
  role?: string;
  friends: string[];
  friendsCount?: number;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, section: string, role?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  reloadCurrentUser: () => Promise<void>;
  isAuthenticated: boolean;
  loadUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('proconnect_user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        loadUsers();
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('proconnect_user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loadUsers = async () => {
    try {
      const users = await usersAPI.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await authAPI.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('proconnect_user', JSON.stringify(userData));
      setUser(userData);
      await loadUsers();
      return userData; // Return user data for redirect logic
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, section: string, role?: string) => {
    try {
      const { token, user: userData } = await authAPI.register(name, email, password, section, role);
      localStorage.setItem('token', token);
      localStorage.setItem('proconnect_user', JSON.stringify(userData));
      setUser(userData);
      await loadUsers();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setAllUsers([]);
    localStorage.removeItem('proconnect_user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await usersAPI.updateProfile(updates);
      setUser(updatedUser);
      localStorage.setItem('proconnect_user', JSON.stringify(updatedUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const reloadCurrentUser = async () => {
    if (!user) return;
    
    try {
      const updatedUser = await usersAPI.getUserProfile(user.id);
      setUser(updatedUser);
      localStorage.setItem('proconnect_user', JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Failed to reload user:', error);
    }
  };

  // Don't render children until we've checked localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      users: allUsers,
      login,
      register,
      logout,
      updateProfile,
      reloadCurrentUser,
      isAuthenticated: !!user,
      loadUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
