import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <SettingsProvider>
                    <AuthProvider>
                        <CartProvider>
                            <App />
                        </CartProvider>
                    </AuthProvider>
                </SettingsProvider>
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
);
