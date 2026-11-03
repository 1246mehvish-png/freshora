import { useSettings } from '../context/SettingsContext';
import './Legal.css';

export default function Terms() {
    const { settings } = useSettings();
    const content = settings?.termsAndConditions || '';

    return (
        <div className="legal-page">
            <section className="page-banner">
                <div className="container">
                    <h1>Terms & Conditions</h1>
                    <p>The rules and guidelines for using Freshora</p>
                </div>
            </section>
            <section className="section container">
                <div className="legal-content">
                    {content ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                        <>
                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using Freshora, you agree to be bound by these Terms & Conditions. If
                                you do not agree, please do not use our platform.
                            </p>

                            <h2>2. Eligibility</h2>
                            <p>
                                You must be at least 18 years old to create an account. By registering, you confirm
                                that you are legally capable of entering into binding contracts.
                            </p>

                            <h2>3. Account Responsibilities</h2>
                            <ul>
                                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                                <li>You agree to provide accurate and complete information during registration.</li>
                                <li>You are responsible for all activities that occur under your account.</li>
                                <li>You must notify us immediately of any unauthorized use of your account.</li>
                            </ul>

                            <h2>4. Buyer Terms</h2>
                            <ul>
                                <li>All prices are listed in PKR (Pakistani Rupees) unless stated otherwise.</li>
                                <li>Product availability and pricing are subject to change without notice.</li>
                                <li>Orders are confirmed only after successful placement and payment (where applicable).</li>
                                <li>You agree to provide a valid delivery address and contact number.</li>
                            </ul>

                            <h2>5. Seller Terms</h2>
                            <ul>
                                <li>Sellers must be approved by Freshora before listing products.</li>
                                <li>Sellers are responsible for the accuracy of product listings, pricing, and stock.</li>
                                <li>Sellers must fulfill orders in a timely manner.</li>
                                <li>Freshora reserves the right to suspend or remove sellers who violate policies.</li>
                            </ul>

                            <h2>6. Orders & Payments</h2>
                            <p>
                                Cash on Delivery is available. Online payment methods (card, gateway, wallet) are
                                enabled only when valid gateway credentials are configured. Freshora is not
                                responsible for third-party payment gateway failures.
                            </p>

                            <h2>7. Returns & Refunds</h2>
                            <p>
                                If you receive a damaged or incorrect product, please contact us within 24 hours of
                                delivery with photographic evidence. Refunds are processed after verification.
                            </p>

                            <h2>8. Prohibited Activities</h2>
                            <ul>
                                <li>Posting false, misleading, or illegal content.</li>
                                <li>Attempting to gain unauthorized access to the platform.</li>
                                <li>Using the platform for any unlawful purpose.</li>
                                <li>Interfering with the normal operation of the platform.</li>
                            </ul>

                            <h2>9. Limitation of Liability</h2>
                            <p>
                                Freshora is not liable for any indirect, incidental, or consequential damages arising
                                from the use of our platform. Our total liability is limited to the amount paid for the
                                products in question.
                            </p>

                            <h2>10. Termination</h2>
                            <p>
                                We reserve the right to suspend or terminate any account at our discretion, without
                                notice, for violations of these terms.
                            </p>

                            <h2>11. Changes to Terms</h2>
                            <p>
                                We may update these Terms & Conditions at any time. Continued use of the platform
                                after changes constitutes acceptance of the revised terms.
                            </p>

                            <h2>12. Contact</h2>
                            <p>
                                For questions about these Terms, contact us at{' '}
                                <a href="mailto:support@freshora.com">support@freshora.com</a>.
                            </p>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}