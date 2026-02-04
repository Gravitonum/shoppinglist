import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ShoppingListsPage } from './pages/lists/ShoppingListsPage';
import { ListDetailsPage } from './pages/lists/ListDetailsPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { StoresPage } from './pages/stores/StoresPage';
import { TemplatesPage } from './pages/templates/TemplatesPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#667eea',
    borderRadius: 8,
    fontSize: 14,
  },
};

const ShoppingListApp: React.FC = () => {
  return (
    <ConfigProvider locale={ruRU} theme={theme}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/lists" replace />} />
                  <Route path="lists" element={<ShoppingListsPage />} />
                  <Route path="lists/:id" element={<ListDetailsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="stores" element={<StoresPage />} />
                  <Route path="templates" element={<TemplatesPage />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default ShoppingListApp;
