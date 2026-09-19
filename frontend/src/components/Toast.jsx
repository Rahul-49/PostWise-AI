import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toast } = useAuth();
  if (!toast) return null;

  const styles = {
    success: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300 shadow-lg shadow-emerald-500/10',
    error: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-300 shadow-lg shadow-rose-500/10',
    info: 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-300 shadow-lg shadow-indigo-500/10',
  };

  const iconStyles = {
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    error: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
    info: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full animate-fade-in pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border ${
          styles[toast.type] || styles.info
        } transition-all duration-300 backdrop-blur-xl`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${iconStyles[toast.type] || iconStyles.info}`}>
            {icons[toast.type] || <Info className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-bold capitalize text-slate-900 dark:text-slate-100 font-display">
              {toast.type === 'error' ? 'Notice' : toast.type}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">{toast.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
