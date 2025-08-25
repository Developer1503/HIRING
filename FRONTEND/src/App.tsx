import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DSAAssessment from './pages/DSAAssessment';
import AptitudeAssessment from './pages/AptitudeAssessment';
import InterviewAssessment from './pages/InterviewAssessment';
import Results from './pages/Results';
import Analytics from './pages/Analytics';
import Practice from './pages/Practice';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  return state.isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function AppContent() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/dsa"
            element={
              <ProtectedRoute>
                <DSAAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/aptitude"
            element={
              <ProtectedRoute>
                <AptitudeAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/interview"
            element={
              <ProtectedRoute>
                <InterviewAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;