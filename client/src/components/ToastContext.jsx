import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-dismiss toasts after 5 seconds unless they are persistent
  useEffect(() => {
    const timers = toasts.map((t) => {
      if (t.persistent) return null;
      return setTimeout(() => dismissToast(t.id), 5000);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [toasts, dismissToast]);

  const value = { toasts, showToast, dismissToast };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

function ToastContainer() {
  const { toasts, dismissToast } = useToast();
  return (
    <div className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const type = toast.type || 'success';
  return (
    <div
      className={`toast toast--${type}`}
      role="alert"
      aria-label={toast.message}
    >
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
