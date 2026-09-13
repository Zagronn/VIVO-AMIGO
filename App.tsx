import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorldMapDashboard from './components/WorldMapDashboard';
import AdminRouteGuard from './components/AdminRouteGuard';

// Simple placeholder Login component for admins
const AdminLogin: React.FC = () => {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('vivo_auth_token', 'mock_token_123');
    localStorage.setItem('vivo_user_role', 'SUPER_ADMIN');
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-orange-500 font-mono flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-[#121216] border border-orange-500/40 p-6 w-full max-w-sm space-y-4 shadow-[0_0_20px_rgba(255,102,0,0.2)]">
        <h2 className="text-sm font-bold tracking-widest uppercase text-orange-400 border-b border-orange-500/30 pb-2">
          VIVO AMIGO // SECURE LOGIN
        </h2>
        <div>
          <label className="text-[10px] text-orange-500/70 uppercase tracking-wider block mb-1">Access Code</label>
          <input type="password" placeholder="••••••••" className="w-full bg-black border border-orange-500/40 p-2 text-orange-400 text-xs outline-none focus:border-orange-500" required />
        </div>
        <button type="submit" className="w-full bg-orange-500/20 border border-orange-500 py-2 text-xs font-bold uppercase tracking-widest text-orange-400 hover:bg-orange-500 hover:text-black transition">
          Authenticate Admin
        </button>
      </form>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        
        {/* Protected Super Admin Dashboard Route */}
        <Route 
          path="/admin" 
          element={
            <AdminRouteGuard>
              <WorldMapDashboard />
            </AdminRouteGuard>
          } 
        />

        {/* Default root redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
