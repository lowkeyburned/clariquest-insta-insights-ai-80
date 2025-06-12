
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
