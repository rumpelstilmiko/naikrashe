import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);
const TOAST_LIFETIME_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message) => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, type, message }]);
    setTimeout(
      () => setToasts((items) => items.filter((item) => item.id !== id)),
      TOAST_LIFETIME_MS,
    );
  }, []);

  const api = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
