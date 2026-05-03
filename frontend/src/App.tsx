import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/AuthContext';

// Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BigBoard from './pages/BigBoard';
import AgentsCRUD from './pages/AgentsCRUD';
import PointsConfig from './pages/PointsConfig';
import AssignPoints from './pages/AssignPoints';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, token, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[var(--color-background-dark)] text-white">Cargando...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/bigboard" element={<BigBoard />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="/agents" element={<ProtectedRoute allowedRoles={['admin']}><AgentsCRUD /></ProtectedRoute>} />
        <Route path="/points" element={<ProtectedRoute allowedRoles={['admin']}><PointsConfig /></ProtectedRoute>} />
        <Route path="/assign" element={<ProtectedRoute allowedRoles={['admin']}><AssignPoints /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
