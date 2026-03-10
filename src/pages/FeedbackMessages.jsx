import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useFeedback } from '../hooks';
import { feedbackService } from '../services';
import {
    MessageSquare, Send, Clock, Trash2,
    ShieldAlert, AlertCircle, Sparkles,
    CheckCircle2, Inbox, Flag, Coffee
} from 'lucide-react';
import { Button, Card, Avatar, Badge } from '../components/atoms';
import { TextareaField } from '../components/molecules';

const FeedbackMessages = () => {
    const { user } = useAuth();
    const { data: feedbackData, loading, refetch: fetchData } = useFeedback();
    const items = Array.isArray(feedbackData) ? feedbackData : [];
    const [msg, setMsg] = useState('');
    const [type, setType] = useState('feedback');
    const [submitting, setSubmitting] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        setSubmitting(true);
        feedbackService.create({ message: msg, type })
            .then(() => {
                setMsg('');
                fetchData();
            })
            .catch(err => console.error(err))
            .finally(() => setSubmitting(false));
    };

    const handleMarkRead = (id) => {
        feedbackService.update(id, { is_read: true })
            .then(() => fetchData())
            .catch(err => console.error(err));
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        feedbackService.delete(id)
            .then(() => fetchData())
            .catch(err => console.error(err));
    };

    const messageTypes = [
        { id: 'feedback', icon: <MessageSquare size={16} />, label: 'Feedback' },
        { id: 'bug', icon: <ShieldAlert size={16} />, label: 'Bug Report' },
        { id: 'suggestion', icon: <Sparkles size={16} />, label: 'Suggestion' }
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    if (loading && items.length === 0) return (
        <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '50%' }}>
                    <Inbox size={48} color="var(--primary)" />
                </div>
            </motion.div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>Synchronizing your communications...</div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ maxWidth: '1100px', margin: '0 auto' }}
        >
            <header className="flex-responsive" style={{ marginBottom: '48px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '12px', fontWeight: 800 }}>SUPPORT & FEEDBACK</Badge>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Support Inbox</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Share your thoughts or report issues directly to the administration.</p>
                </div>
            </header>

            <div className={user?.role === 'admin' ? '' : 'grid-2-1'} style={{ gap: '40px' }}>
                {user?.role !== 'admin' && (
                    <motion.section variants={itemVariants}>
                        <Card style={{ padding: '40px', height: 'fit-content', position: 'sticky', top: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Dispatch Message</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Communication is private and encrypted.</p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '12px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CLASSIFICATION</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {messageTypes.map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    borderRadius: '12px',
                                                    border: `2px solid ${type === t.id ? 'var(--primary)' : 'var(--bg-main)'}`,
                                                    background: type === t.id ? 'var(--primary-light)' : 'var(--bg-main)',
                                                    color: type === t.id ? 'var(--primary)' : 'var(--text-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {t.icon}
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <TextareaField
                                    label="MESSAGE BODY"
                                    rows={8}
                                    placeholder="Describe your request or feedback in detail..."
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    required
                                    style={{ borderRadius: '16px', padding: '20px', fontSize: '1rem' }}
                                />

                                <Button type="submit" disabled={submitting} style={{ height: '56px', borderRadius: '14px', fontSize: '1rem', fontWeight: 800 }}>
                                    <Send size={20} style={{ marginRight: '8px' }} />
                                    {submitting ? 'Transmitting...' : 'Dispatch Hub Message'}
                                </Button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                                    <Coffee size={18} color="var(--primary)" />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>We typically respond within 24 hours.</span>
                                </div>
                            </form>
                        </Card>
                    </motion.section>
                )}

                <motion.section variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Communication History</h3>
                            <Badge bg="var(--bg-main)" color="var(--text-muted)" style={{ fontWeight: 700 }}>{items.length} MESSAGES</Badge>
                        </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {items.length > 0 ? items.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card style={{
                                    padding: '32px',
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    borderLeft: item.is_read ? '1px solid var(--border-color)' : '6px solid var(--primary)',
                                    background: item.is_read ? 'rgba(255,255,255,0.6)' : 'white',
                                    boxShadow: item.is_read ? 'none' : '0 10px 30px rgba(0,0,0,0.04)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            {user?.role === 'admin' ? (
                                                <Avatar name={item.user?.name} size={48} style={{ border: '2px solid white', boxShadow: 'var(--shadow-sm)' }} />
                                            ) : (
                                                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '14px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                                                    {item.type === 'bug' ? <ShieldAlert size={24} /> : (item.type === 'feedback' ? <MessageSquare size={24} /> : <Sparkles size={24} />)}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    {user?.role === 'admin' && <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{item.user?.name}</span>}
                                                    <Badge
                                                        bg={item.type === 'bug' ? '#FEE2E2' : 'var(--primary-light)'}
                                                        color={item.type === 'bug' ? '#EF4444' : 'var(--primary)'}
                                                        style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.05em' }}
                                                    >
                                                        {item.type.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    <Clock size={14} />
                                                    {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {user?.role === 'admin' && !item.is_read && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleMarkRead(item.id)}
                                                    style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 800, borderRadius: '10px', borderColor: 'var(--success)', color: 'var(--success)' }}
                                                >
                                                    <CheckCircle2 size={14} style={{ marginRight: '6px' }} /> Mark Resolved
                                                </Button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                style={{
                                                    background: 'none', border: 'none', padding: '10px',
                                                    color: 'var(--danger)', opacity: 0.4, cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    borderRadius: '8px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        color: 'var(--text-main)',
                                        lineHeight: 1.8,
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {item.message}
                                    </p>

                                    {!item.is_read && user?.role !== 'admin' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, marginTop: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Flag size={14} /> Awaiting Administrator Review
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        )) : (
                            <Card style={{ textAlign: 'center', padding: '100px 40px', background: '#F9FAFB', border: '2px dashed var(--border-color)', borderRadius: '24px' }}>
                                <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-sm)' }}>
                                    <MessageSquare size={36} color="#CBD5E1" />
                                </div>
                                <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Your Inbox is Empty</h3>
                                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>You haven't sent any messages or reports yet.</p>
                            </Card>
                        )}
                    </AnimatePresence>
                </motion.section>
            </div>
        </motion.div>
    );
};

export default FeedbackMessages;
