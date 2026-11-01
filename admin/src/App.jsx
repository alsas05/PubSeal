import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminNavbar from './components/AdminNavbar';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminStudioPage from './pages/AdminStudioPage';

function AdminAppRoutes() {
  const { isAuthenticated } = useAdminAuth();

  return (
    <div className="relative flex flex-col min-h-screen bg-mocha-950 text-mocha-100 overflow-x-hidden selection:bg-gold-500/30 selection:text-gold-200">
      {/* Background Champagne Gold PubSeal Logo Watermark */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center pt-10 overflow-hidden"
      >
        <div className="absolute w-[600px] h-[600px] bg-gold-500/[0.035] rounded-full blur-[140px]" />
        <img
          src="/PubSeal_logo_gold_tight.png"
          alt="PubSeal Watermark"
          className="w-auto h-auto max-h-[75vh] max-w-[600px] opacity-[0.06] filter drop-shadow-[0_0_60px_rgba(203,159,84,0.35)] object-contain"
        />
      </div>

      {isAuthenticated ? (
        <main className="relative z-10 flex-1">
          <Routes>
            <Route path="/" element={<AdminStudioPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      ) : (
        <main className="relative z-10 flex-1">
          <Routes>
            <Route path="*" element={<AdminLoginPage />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminAppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

