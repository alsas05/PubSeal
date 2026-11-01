import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RegisterWorkPage from './pages/RegisterWorkPage';
import WorkDetailsPage from './pages/WorkDetailsPage';
import VerifyWorkPage from './pages/VerifyWorkPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import EmailVerificationBanner from './components/EmailVerificationBanner';

// Scroll to top or scroll to anchor section on navigation
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="relative flex flex-col min-h-screen bg-mocha-950 text-mocha-100 overflow-x-hidden">
          {/* Global Champagne Gold PubSeal Logo Watermark Across the Site */}
          <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center pt-10 sm:pt-14 overflow-hidden"
          >
            {/* Ambient champagne gold aura glow */}
            <div className="absolute w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] lg:w-[800px] lg:h-[800px] bg-gold-500/[0.038] rounded-full blur-[130px]" />
            <img
              src="/PubSeal_logo_gold_tight.png"
              alt="PubSeal Watermark"
              className="w-auto h-auto max-h-[70vh] sm:max-h-[75vh] lg:max-h-[78vh] max-w-[85vw] sm:max-w-[560px] lg:max-w-[620px] opacity-[0.08] filter drop-shadow-[0_0_70px_rgba(203,159,84,0.42)] object-contain transition-all duration-300"
            />
          </div>

          <Navbar />
          <EmailVerificationBanner />
          <main className="relative z-10 flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify" element={<VerifyWorkPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Protected Author Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register-work"
                element={
                  <ProtectedRoute>
                    <RegisterWorkPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/works/:id"
                element={
                  <ProtectedRoute>
                    <WorkDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

