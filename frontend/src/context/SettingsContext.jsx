import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services';

const SettingsContext = createContext(null);

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
};

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await settingsService.get();
            setSettings(res.data.settings);
        } catch (err) {
            // fallback defaults
            setSettings({
                siteName: 'Freshora',
                tagline: 'Your Daily Freshness Delivered.',
                logo: '',
                heroHeading: 'Your Daily Freshness Delivered.',
                heroSubheading: 'Fresh fruits and vegetables from trusted local sellers, delivered to your doorstep.',
                banners: [],
                aboutUs: { title: 'About Freshora', content: '', image: '' },
                contactUs: {
                    email: 'support@freshora.com',
                    phone: '+92 300 0000000',
                    whatsapp: '+92 300 0000000',
                    businessAddress: 'Freshora HQ, Main Boulevard, Lahore, Pakistan',
                    description: 'Have a question? Reach out and our team will get back to you within 24 hours.',
                },
                footerContent: {
                    aboutText: 'Freshora is a multi-vendor marketplace connecting local fruit and vegetable sellers with online customers.',
                    socialLinks: { facebook: '', twitter: '', instagram: '', youtube: '' },
                    copyright: `© ${new Date().getFullYear()} Freshora. All rights reserved.`,
                },
                privacyPolicy: '',
                termsAndConditions: '',
                deliveryCharges: { defaultCharge: 150, freeAbove: 3000 },
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = useCallback(async (data) => {
        const res = await settingsService.update(data);
        setSettings(res.data.settings);
        return res.data;
    }, []);

    const value = { settings, loading, fetchSettings, updateSettings };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}