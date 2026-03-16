import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import AIAssistantWidget from './components/molecules/AIAssistant/AIAssistantWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <AIAssistantWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;

