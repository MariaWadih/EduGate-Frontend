import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <AcademicYearProvider>
        <Router>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </Router>
      </AcademicYearProvider>
    </AuthProvider>
  );
}

export default App;

