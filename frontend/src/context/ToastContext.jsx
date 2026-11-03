import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    return ctx;
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback(
        (message, type = 'info', duration = 3500) => {
            const id = Date.now() + Math.random();
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => remove(id), duration);
        },
        [remove]
    );

    const toast = {
        success: (m) => show(m, 'success'),
        error: (m) => show(m, 'error'),
        info: (m) => show(m, 'info'),
        warning: (m) => show(m, 'warning'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
                        <span className="toast-icon">
                            {t.type === 'success' && '✓'}
                            {t.type === 'error' && '✕'}
                            {t.type === 'info' && 'ℹ'}
                            {t.type === 'warning' && '⚠'}
                        </span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
