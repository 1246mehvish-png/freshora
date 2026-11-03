import { useState, useEffect } from 'react';
import { contactService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminContactMessages() {
    const toast = useToast();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replying, setReplying] = useState(null);
    const [replyText, setReplyText] = useState('');

    const load = async () => {
        try {
            const res = await contactService.getAll();
            setMessages(res.data.messages || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await contactService.markRead(id);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to mark message as read');
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) {
            toast.error('Reply text is required');
            return;
        }
        try {
            await contactService.reply(id, replyText.trim());
            toast.success('Reply sent');
            setReplying(null);
            setReplyText('');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to send reply');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this message? This cannot be undone.')) return;
        try {
            await contactService.delete(id);
            toast.success('Message deleted');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete message');
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    const unread = messages.filter((m) => !m.isRead).length;

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Contact Messages</h1>
                    <p>{unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'All messages have been read'}</p>
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="✉️" title="No messages" message="No one has reached out yet." />
                </div>
            ) : (
                <div className="dash-card">
                    <div className="notif-list">
                        {messages.map((m) => (
                            <div className={`notif-item ${m.isRead ? '' : 'notif-unread'}`} key={m._id}>
                                <div className="notif-icon">✉️</div>
                                <div className="notif-body">
                                    <strong>
                                        {m.name} <span className="dash-muted">@{m.email}</span>
                                    </strong>
                                    <p className="notif-message">
                                        <strong>{m.subject}</strong>
                                    </p>
                                    <p className="notif-message">{m.message}</p>
                                    {m.reply && (
                                        <p className="notif-message dash-muted">Your reply: {m.reply}</p>
                                    )}
                                    <span className="notif-date">{formatDate(m.createdAt)}</span>
                                </div>
                                <div className="notif-actions">
                                    {!m.isRead && (
                                        <button
                                            className="btn btn-xs btn-outline"
                                            onClick={() => handleMarkRead(m._id)}
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-xs btn-primary"
                                        onClick={() => {
                                            setReplying(m._id);
                                            setReplyText(m.reply || '');
                                        }}
                                    >
                                        Reply
                                    </button>
                                    <button
                                        className="btn btn-xs btn-danger"
                                        onClick={() => handleDelete(m._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                                {replying === m._id && (
                                    <div className="reject-form" style={{ width: '100%' }}>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write your reply..."
                                            rows="3"
                                        />
                                        <div className="reject-form-actions">
                                            <button
                                                className="btn btn-xs btn-outline"
                                                onClick={() => {
                                                    setReplying(null);
                                                    setReplyText('');
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="btn btn-xs btn-primary"
                                                onClick={() => handleReply(m._id)}
                                            >
                                                Send Reply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
