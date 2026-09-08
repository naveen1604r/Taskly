import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  // 1. Initial auth restoration loading splash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center p-4 text-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#7C3AED]/25">
            <CheckCircle2 className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Task<span className="text-[#7C3AED]">ly</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 text-[#7C3AED] animate-spin" />
          <span>Restoring secure session...</span>
        </div>
      </div>
    );
  }

  // 2. Redirect unauthenticated users to /login preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Render protected content
  return children ? children : <Outlet />;
}
