import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  setRoleOverride: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Demo user database (fallback when backend is unreachable) ──
const DEMO_USERS: Record<string, { user: User; password: string }> = {
  'officer@bhumi.tn.gov.in': {
    password: 'officer123',
    user: {
      id: 'officer-001',
      email: 'officer@bhumi.tn.gov.in',
      full_name: 'K. Meenakshi Sundaram (Sub-Registrar)',
      role: 'OFFICER',
      department: 'Registration Dept, Madurai North',
      created_at: new Date().toISOString(),
    },
  },
  'admin@bhumi.tn.gov.in': {
    password: 'admin123',
    user: {
      id: 'admin-001',
      email: 'admin@bhumi.tn.gov.in',
      full_name: 'Dr. R. Suresh Kumar (IGR Admin)',
      role: 'ADMIN',
      department: 'Inspector General of Registration, Chennai',
      created_at: new Date().toISOString(),
    },
  },
  'citizen@example.com': {
    password: 'citizen123',
    user: {
      id: 'citizen-001',
      email: 'citizen@example.com',
      full_name: 'A. Ramachandran',
      role: 'CITIZEN',
      department: undefined,
      created_at: new Date().toISOString(),
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Restore session from localStorage
    const stored = authService.getStoredUser();
    const token = localStorage.getItem('bhumi_auth_token');
    if (stored && token) {
      setUser(stored);
    }
    setInitialized(true);
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    try {
      // Try real backend auth first
      const data = await authService.login(email, pass);
      setUser(data.user);
    } catch (backendErr) {
      // Fallback: demo credential check
      const demo = DEMO_USERS[email.toLowerCase()];
      if (demo && demo.password === pass) {
        // Store demo user without a real JWT (api.ts will skip attaching it)
        const demoToken = `demo-token-${demo.user.role.toLowerCase()}-${Date.now()}`;
        localStorage.setItem('bhumi_auth_token', demoToken);
        localStorage.setItem('bhumi_user', JSON.stringify(demo.user));
        setUser(demo.user);
      } else {
        throw new Error('Invalid email or password.');
      }
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const setRoleOverride = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('bhumi_user', JSON.stringify(updated));
    }
  };

  // Don't render until auth state is restored
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      login,
      logout,
      setRoleOverride,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
