import { useSettings } from '../context/SettingsContext';
import './Legal.css';

export default function PrivacyPolicy() {
    const { settings } = useSettings();
    const content = settings?.privacyPolicy || '';

    return (
        <div className="legal-page">
            <section className="page-banner">
                <div className="container">
                    <h1>Privacy Policy</h1>
                    <p>How Freshora handles and protects your data</p>
                </div>
            </section>
            <section className="section container">
                <div className="legal-content">
                    {content ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                        <>
                            <h2>1. Introduction</h2>
                            <p>
                                Freshora ("we", "our", "us") is committed to protecting your privacy. This Privacy
                                Policy explains how we collect, use, disclose, and safeguard your information when you
                                visit our website or use our services.
                            </p>

                            <h2>2. Information We Collect</h2>
                            <p>We may collect the following types of information:</p>
                            <ul>
                                <li><strong>Personal Information:</strong> Name, email address, phone number, WhatsApp number, delivery address, and other details you provide during registration.</li>
                                <li><strong>Account Information:</strong> Username, password (encrypted), and role (buyer/seller).</li>
                                <li><strong>Transaction Information:</strong> Order history, payment details, and delivery preferences.</li>
                                <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and device information.</li>
                            </ul>

                            <h2>3. How We Use Your Information</h2>
                            <ul>
                                <li>To create and manage your account.</li>
                                <li>To process and deliver your orders.</li>
                                <li>To send order confirmations, updates, and notifications.</li>
                                <li>To improve our website, products, and services.</li>
                                <li>To provide customer support and respond to inquiries.</li>
                                <li>To prevent fraud and ensure platform security.</li>
                            </ul>

                            <h2>4. Information Sharing</h2>
                            <p>
                                We do not sell your personal information. We may share your information with sellers
                                (only as needed to fulfill your orders), service providers (payment gateways, delivery
                                partners), and legal authorities when required by law.
                            </p>

                            <h2>5. Data Security</h2>
                            <p>
                                We use industry-standard security measures including encryption, secure password
                                hashing, and role-based access controls to protect your data. However, no method of
                                transmission over the internet is 100% secure.
                            </p>

                            <h2>6. Cookies</h2>
                            <p>
                                We use cookies to remember your preferences, keep you logged in, and analyze site
                                traffic. You can disable cookies in your browser settings, though some features may not
                                work properly.
                            </p>

                            <h2>7. Your Rights</h2>
                            <p>
                                You have the right to access, update, or delete your personal information at any time
                                by contacting us. You may also request a copy of the data we hold about you.
                            </p>

                            <h2>8. Third-Party Links</h2>
                            <p>
                                Our website may contain links to third-party websites. We are not responsible for the
                                privacy practices of those sites.
                            </p>

                            <h2>9. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Any changes will be posted on this
                                page with an updated revision date.
                            </p>

                            <h2>10. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at{' '}
                                <a href="mailto:support@freshora.com">support@freshora.com</a>.
                            </p>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}