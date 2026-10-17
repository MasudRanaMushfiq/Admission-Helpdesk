import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

// toast.success() / toast.error(), auto-close
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const close = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message, type) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => close(id), type === 'error' ? 4500 : 3000);
    },
    [close],
  );

  const toast = useMemo(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'} onClick={() => close(t.id)}>
            <span className="toast-icon">{t.type === 'error' ? '!' : '✓'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
