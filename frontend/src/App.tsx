import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { NewCasePage } from './pages/NewCasePage';
import { CitizenPortalPage } from './pages/CitizenPortalPage';
import { AdminPage } from './pages/AdminPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { PattaRepositoryPage } from './pages/PattaRepositoryPage';

// Protected layout wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] antialiased">
      <Navbar />
      <Sidebar />
      <div className="pl-64">
        <main className="w-full pt-[102px] bg-[#f5f5f7] min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/landing" element={<LandingPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<AppLayout><OfficerDashboard /></AppLayout>} />
      <Route path="/cases" element={<AppLayout><OfficerDashboard /></AppLayout>} />
      <Route path="/cases/:id" element={<AppLayout><CaseDetailsPage /></AppLayout>} />
      <Route path="/new-case" element={<AppLayout><NewCasePage /></AppLayout>} />
      <Route path="/portal" element={<AppLayout><CitizenPortalPage /></AppLayout>} />
      <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />
      <Route path="/audit" element={<AppLayout><AuditLogPage /></AppLayout>} />
      <Route path="/repository" element={<AppLayout><PattaRepositoryPage /></AppLayout>} />

      {/* Fallback */}
      <Route
        path="*"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
