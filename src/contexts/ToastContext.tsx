import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {}
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 animate-slide-in ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
                : 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />}
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
