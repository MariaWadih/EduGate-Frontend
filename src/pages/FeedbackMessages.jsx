import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Clock, Trash2, ShieldAlert, AlertCircle } from 'lucide-react';
import { Button, Card, Avatar } from '../components/atoms';
import { TextareaField } from '../components/molecules';

const FeedbackMessages = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [type, setType] = useState('feedback');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = () => {
        setLoading(true);
        client.get('/feedback')
            .then(res => {
                setItems(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        setSubmitting(true);
        client.post('/feedback', { message: msg, type })
            .then(() => {
                setMsg('');
                fetchData();
            })
            .catch(err => console.error(err))
            .finally(() => setSubmitting(false));
    };

    const handleMarkRead = (id) => {
        client.put(`/feedback/${id}`, { is_read: true })
            .then(() => fetchData())
            .catch(err => console.error(err));
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        client.delete(`/feedback/${id}`)
            .then(() => fetchData())
            .catch(err => console.error(err));
    };

    const messageTypes = ['feedback', 'bug', 'suggestion'];

    if (loading && items.length === 0) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <MessageSquare size={40} color="var(--primary)" />
            </motion.div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Feedback & Messages</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Share your thoughts, report issues, or contact administration</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'admin' ? '1fr' : '1fr 1.5fr', gap: '40px' }}>
                {user?.role !== 'admin' && (
                    <section>
                        <Card style={{ padding: '32px', height: 'fit-content', position: 'sticky', top: '24px' }}>
                            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Send size={20} color="var(--primary)" />
                                Send New Message
                            </h3>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>MESSAGE TYPE</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {messageTypes.map(t => (
                                            <Button
                                                key={t}
                                                type="button"
                                                variant={type === t ? 'primary' : 'outline'}
                                                onClick={() => setType(t)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    borderColor: type === t ? 'var(--primary)' : 'var(--border-color)',
                                                    background: type === t ? 'var(--primary-light)' : 'white',
                                                    color: type === t ? 'var(--primary)' : 'var(--text-muted)'
                                                }}
                                            >
                                                {t}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <TextareaField
                                    label="YOUR MESSAGE"
                                    rows={6}
                                    placeholder="Tell us what's on your mind..."
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    required
                                />
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Sending...' : 'Transmit Message'}
                                </Button>
                            </form>
                        </Card>
                    </section>
                )}

                <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0 }}>Message History</h3>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>{items.length} Total</span>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {items.length > 0 ? items.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card style={{
                                    padding: '24px',
                                    borderLeft: item.is_read ? 'none' : '4px solid var(--primary)',
                                    background: item.is_read ? 'rgba(255,255,255,0.6)' : 'white'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            {user?.role === 'admin' ? (
                                                <Avatar name={item.user?.name} size={40} />
                                            ) : (
                                                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '10px' }}>
                                                    {item.type === 'bug' ? <ShieldAlert size={20} /> : <MessageSquare size={20} />}
                                                </div>
                                            )}
                                            <div>
                                                {user?.role === 'admin' && <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{item.user?.name}</div>}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    <span style={{ textTransform: 'uppercase', color: 'var(--primary)' }}>{item.type}</span>
                                                    <span>•</span>
                                                    <Clock size={12} /> {new Date(item.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {user?.role === 'admin' && !item.is_read && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleMarkRead(item.id)}
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--success)', color: 'var(--success)' }}
                                                >
                                                    Mark Read
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDelete(item.id)}
                                                style={{ padding: '6px', border: 'none', color: 'var(--danger)', opacity: 0.6 }}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.6, fontSize: '0.9375rem' }}>{item.message}</p>
                                </Card>
                            </motion.div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </section>
            </div>
        </motion.div>
    );
};

export default FeedbackMessages;
