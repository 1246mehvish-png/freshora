import { useState } from 'react';
import { contactService } from '../services';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import './Contact.css';

export default function Contact() {
    const { settings } = useSettings();
    const { success, error } = useToast();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const contact = settings?.contactUs || {
        email: 'support@freshora.com',
        phone: '+92 300 0000000',
        whatsapp: '+92 300 0000000',
        businessAddress: 'Freshora HQ, Main Boulevard, Lahore, Pakistan',
        description: 'Have a question? Reach out and our team will get back to you within 24 hours.',
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            error('Please fill in all required fields');
            return;
        }
        setSubmitting(true);
        try {
            await contactService.submit(form);
            success('Message sent successfully! We will get back to you soon.');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            error(err.message || 'Failed to send message');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <section className="page-banner">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>We would love to hear from you</p>
                </div>
            </section>

            <section className="section container">
                <div className="contact-grid">
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <p>{contact.description}</p>

                        <div className="contact-item">
                            <span className="contact-icon">📧</span>
                            <div>
                                <h4>Email</h4>
                                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <div>
                                <h4>Phone</h4>
                                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">💬</span>
                            <div>
                                <h4>WhatsApp</h4>
                                <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                                    {contact.whatsapp}
                                </a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📍</span>
                            <div>
                                <h4>Address</h4>
                                <p>{contact.businessAddress}</p>
                            </div>
                        </div>

                        <div className="contact-hours">
                            <h4>🕐 Working Hours</h4>
                            <p>Monday – Saturday: 9:00 AM – 9:00 PM</p>
                            <p>Sunday: 10:00 AM – 6:00 PM</p>
                        </div>
                    </div>

                    <div className="contact-form-wrap">
                        <h2>Send a Message</h2>
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    placeholder="How can we help?"
                                />
                            </div>
                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    name="message"
                                    rows="5"
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder="Write your message here..."
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                                {submitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}