import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, User, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Badge, Card, Avatar } from '../components/atoms';
import { Modal, FormField, SelectField, TextareaField } from '../components/molecules';

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        message: '',
        target_role: 'all',
        target_class_id: ''
    });

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            client.get('/announcements'),
            client.get('/classes')
        ]).then(([annRes, classRes]) => {
            setAnnouncements(annRes.data);
            setClasses(classRes.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        client.post('/announcements', announcementForm)
            .then(() => {
                setShowCreateModal(false);
                setAnnouncementForm({ title: '', message: '', target_role: 'all', target_class_id: '' });
                fetchData();
            })
            .catch(err => {
                console.error(err);
                alert('Failed to send broadcast');
            })
            .finally(() => setIsSubmitting(false));
    };

    const filteredAnnouncements = filter === 'all'
        ? announcements
        : announcements.filter(ann => ann.target_role === filter);

    const getRoleColor = (role) => {
        switch (role) {
            case 'all': return { bg: '#EEF2FF', text: '#4F46E5', border: 'rgba(79, 70, 229, 0.1)' };
            case 'teacher': return { bg: '#FEF3C7', text: '#D97706', border: 'rgba(217, 119, 6, 0.1)' };
            case 'student': return { bg: '#DCFCE7', text: '#16A34A', border: 'rgba(22, 163, 74, 0.1)' };
            default: return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
        }
    };

    const filterTabs = [
        { id: 'all', label: 'All Messages', icon: <Bell size={18} /> },
        { id: 'teacher', label: 'For Teachers', icon: <User size={18} /> },
        { id: 'student', label: 'For Students', icon: <Calendar size={18} /> }
    ];

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Bell size={40} color="var(--primary)" />
            </motion.div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Communication Hub</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage and view all platform-wide broadcasts</p>
                </div>
                {user?.role === 'admin' && (
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus size={20} /> New Broadcast
                    </Button>
                )}
            </header>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
                {filterTabs.map(tab => (
                    <Button
                        key={tab.id}
                        variant={filter === tab.id ? 'primary' : 'outline'}
                        onClick={() => setFilter(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: filter === tab.id ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Announcements List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <AnimatePresence mode="popLayout">
                    {filteredAnnouncements.length > 0 ? filteredAnnouncements.map((ann, idx) => {
                        const style = getRoleColor(ann.target_role);
                        return (
                            <motion.div
                                key={ann.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card style={{
                                    padding: '32px',
                                    borderLeft: `6px solid ${style.text}`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <Badge
                                                    bg={style.bg}
                                                    color={style.text}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        letterSpacing: '0.05em',
                                                        border: `1px solid ${style.border}`
                                                    }}
                                                >
                                                    {ann.target_class_id ? `CLASS: ${ann.target_class?.name || 'Loading...'}` : (ann.target_role === 'all' ? 'GLOBAL' : ann.target_role.toUpperCase())}
                                                </Badge>
                                                {ann.priority === 'high' && (
                                                    <Badge bg="#FEE2E2" color="#EF4444" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                                                        URGENT
                                                    </Badge>
                                                )}
                                            </div>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{ann.title}</h2>
                                        </div>
                                        <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{new Date(ann.created_at).toLocaleDateString()}</div>
                                            <div>{new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>

                                    <p style={{
                                        lineHeight: 1.7,
                                        color: 'var(--text-main)',
                                        fontSize: '1.05rem',
                                        marginBottom: '24px',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {ann.message}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '20px',
                                        borderTop: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Avatar name={ann.user?.name || 'Admin'} size={32} />
                                            <div style={{ fontSize: '0.875rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Posted by </span>
                                                <span style={{ fontWeight: 700 }}>{ann.user?.name || 'System Admin'}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--success)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                            <CheckCircle2 size={16} />
                                            Verified Broadcast
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: '24px', border: '2px dashed var(--border-color)' }}>
                            <Bell size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: 'var(--text-muted)' }}>No announcements found in this category</h3>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Create Announcement Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Global Broadcast"
                width="500px"
            >
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9375rem' }}>
                    Send an immediate notification to students, staff, or parents.
                </p>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleCreateSubmit}>
                    <FormField
                        label="SUBJECT"
                        placeholder="e.g. Emergency Closure"
                        required
                        value={announcementForm.title}
                        onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: announcementForm.target_role === 'class' ? '1fr 1fr' : '1fr', gap: '16px' }}>
                        <SelectField
                            label="AUDIENCE"
                            value={announcementForm.target_role}
                            onChange={e => setAnnouncementForm({
                                ...announcementForm,
                                target_role: e.target.value,
                                target_class_id: e.target.value === 'class' ? announcementForm.target_class_id : ''
                            })}
                        >
                            <option value="all">Everyone</option>
                            <option value="teacher">Teachers Only</option>
                            <option value="student">All Students</option>
                            <option value="class">Specific Class</option>
                        </SelectField>
                        {announcementForm.target_role === 'class' && (
                            <SelectField
                                label="SELECT CLASS"
                                required
                                value={announcementForm.target_class_id}
                                onChange={e => setAnnouncementForm({ ...announcementForm, target_class_id: e.target.value })}
                            >
                                <option value="">Choose Class...</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                ))}
                            </SelectField>
                        )}
                    </div>
                    <TextareaField
                        label="MESSAGE"
                        rows={5}
                        placeholder="Type your message here..."
                        required
                        value={announcementForm.message}
                        onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    />
                    <Button type="submit" style={{ marginTop: '12px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Sending Broadcast...' : 'Execute Broadcast'}
                    </Button>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Announcements;
