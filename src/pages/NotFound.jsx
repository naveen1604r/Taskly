import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * Taskly Production Friendly Error & 404 Page
 * Maintains the dark modern aesthetic, glassmorphism, and seamless navigation.
 */
export default function NotFound({
  code = '404',
  title = 'Page Not Found',
  message = "The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.",
  showRetry = false,
  onRetry,
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        {/* Visual Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600/20 to-purple-600/20 border border-brand-500/30 mb-6 shadow-inner">
          <AlertTriangle className="w-10 h-10 text-brand-400" />
        </div>

        {/* Code & Title */}
        <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-3">
          Error {code}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-medium shadow-lg shadow-brand-500/20 transition-all"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Footer help note */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-xs text-slate-400">
          Taskly Enterprise Productivity &bull; All systems operational
        </div>
      </div>
    </div>
  );
}
