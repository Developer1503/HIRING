import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import DSAPractice from './pages/DSAPractice';
import AptitudePractice from './pages/AptitudePractice';
import InterviewPractice from './pages/InterviewPractice';
import Profile from './pages/Profile';
import ResumeAnalysis from './pages/ResumeAnalysis';


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
            path="/practice/dsa"
            element={
              <ProtectedRoute>
                <DSAPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/aptitude"
            element={
              <ProtectedRoute>
                <AptitudePractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/interview"
            element={
              <ProtectedRoute>
                <InterviewPractice />
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
          <Route
            path="/resume-analysis"
            element={
              <ProtectedRoute>
                <ResumeAnalysis />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1071725358461-c9s9vpqcj1dfpp4nbjm4cvb68llvn46k.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </GoogleOAuthProvider>
  );
}

export default App;