import React from 'react';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeModeProvider } from './contexts/ThemeContext';
import { AlertProvider } from './contexts/AlertContext';
import AppRoutes from './routes/AppRoutes';

if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    alert("React Runtime Error: " + message + "\nSource: " + source + "\nLine: " + lineno + ":" + colno);
    return false;
  };
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Turn off for predictable mock database usage
      retry: false,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>
          <AlertProvider>
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </AlertProvider>
        </ThemeModeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
