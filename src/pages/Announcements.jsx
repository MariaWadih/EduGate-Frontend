import React, { useState } from 'react';
import { announcementService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Calendar, User, Plus, CheckCircle2,
    Megaphone, ShieldCheck, Clock, Filter,
    ChevronRight, Zap, Info, AlertTriangle
} from 'lucide-react';
import { Button, Badge, Card, Avatar } from '../components/atoms';
import { Modal, FormField, SelectField, TextareaField } from '../components/molecules';
import { useAuth, useAnnouncements, useClasses } from '../hooks';


const Announcements = () => {
    const { user } = useAuth();
    const { data: announcements = [], loading: announcementsLoading, refetch: refetchAnnouncements } = useAnnouncements();
    const { data: classes = [], loading: classesLoading } = useClasses();
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        message: '',
        target_role: 'all',
        target_class_id: ''
    });

    const loading = announcementsLoading || classesLoading;

    const fetchData = () => {
        refetchAnnouncements();
    };


    const handleCreateSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        announcementService.create(announcementForm)
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

    const filteredAnnouncements = (announcements || []).filter(ann => {
        const role = (ann.target_role || '').toLowerCase().trim();
        const classId = ann.target_class_id;
        const isClassTargeted = role === 'class' || !!classId;

        // 1. All Messages tab shows everything fetched from API
        if (filter === 'all') return true;

        // 2. Global broadcasts show in every tab
        if (role === 'all') return true;

        // 3. Faculty Hub Tab
        if (filter === 'teacher') {
            return role === 'teacher' || isClassTargeted;
        }

        // 4. Student Life Tab
        if (filter === 'student') {
            return role === 'student' || isClassTargeted;
        }

        // 5. Direct role match fallback
        return role === filter;
    });

    const getRoleColor = (role) => {
        switch (role) {
            case 'all': return { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'rgba(79, 70, 229, 0.1)' };
            case 'teacher': return { bg: '#FEF3C7', text: '#D97706', border: 'rgba(217, 119, 6, 0.1)' };
            case 'student':
            case 'class': return { bg: '#DCFCE7', text: '#16A34A', border: 'rgba(22, 163, 74, 0.1)' };
            default: return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
        }
    };

    const filterTabs = [
        { id: 'all', label: 'All Messages', icon: <Bell size={18} /> },
        { id: 'teacher', label: 'Faculty Hub', icon: <User size={18} /> },
        { id: 'student', label: 'Student Life', icon: <Calendar size={18} /> }
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    if (loading) return (
        <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '50%' }}>
                    <Bell size={48} color="var(--primary)" />
                </div>
            </motion.div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>Aggregating system broadcasts...</div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
            <header className="flex-responsive" style={{ marginBottom: '48px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '12px', fontWeight: 800 }}>COMMUNICATION HUB</Badge>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Bulletin Board</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Stay informed with real-time system broadcasts and announcements.</p>
                </div>
                {user?.role === 'admin' && (
                    <Button onClick={() => setShowCreateModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <Megaphone size={20} style={{ marginRight: '8px' }} /> Dispatch Broadcast
                    </Button>
                )}
            </header>

            {/* Filter Tabs */}
            <div className="scroll-x" style={{ display: 'flex', gap: '8px', marginBottom: '40px', padding: '6px', background: '#F1F5F9', borderRadius: '16px', width: 'fit-content' }}>
                {filterTabs.map(tab => {
                    const isActive = filter === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: isActive ? 'white' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Announcements List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <AnimatePresence mode="popLayout">
                    {filteredAnnouncements && filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map((ann) => {
                            const style = getRoleColor(ann.target_role);
                            const roleLabel = ann.target_class_id 
                                ? `SEC: ${ann.target_class?.name || 'Class'}` 
                                : (ann.target_role === 'all' ? 'PLATFORM' : (ann.target_role || 'General').toUpperCase());

                            return (
                                <motion.div
                                    key={ann.id}
                                    layout
                                    variants={itemVariants}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card style={{
                                        padding: '32px',
                                        borderLeft: `6px solid ${style.text}`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                                    <Badge
                                                        bg={style.bg}
                                                        color={style.text}
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 800,
                                                            letterSpacing: '0.05em',
                                                            border: `1px solid ${style.border}`
                                                        }}
                                                    >
                                                        {roleLabel}
                                                    </Badge>
                                                    {ann.priority === 'high' && (
                                                        <Badge bg="#FEE2E2" color="#EF4444" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                                                            CRITICAL
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{ann.title}</h2>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <Calendar size={14} /> {new Date(ann.created_at).toLocaleDateString()}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <Clock size={14} /> {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        <p style={{
                                            lineHeight: 1.8,
                                            color: 'var(--text-main)',
                                            fontSize: '1.05rem',
                                            fontWeight: 500,
                                            marginBottom: '32px',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {ann.message}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingTop: '24px',
                                            borderTop: '1px solid var(--border-color)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Avatar name={ann.user?.name || 'Admin'} size={36} style={{ boxShadow: 'var(--shadow-sm)' }} />
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Message from </span>
                                                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{ann.user?.name || 'System Authority'}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <ShieldCheck size={16} /> Verified Broadcast
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })
                    ) : (
                        <Card style={{ textAlign: 'center', padding: '100px 40px', background: '#F9FAFB', border: '2px dashed var(--border-color)' }}>
                            <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-sm)' }}>
                                <Info size={36} color="#CBD5E1" />
                            </div>
                            <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Quiet on the Bulletin</h3>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>There are no active broadcasts for the selected category at this time.</p>
                        </Card>
                    )}
                </AnimatePresence>
            </div>

            {/* Create Announcement Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="System-Wide Broadcast"
                width="550px"
            >
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6 }}>
                        Authorized personnel may dispatch platform-wide broadcasts to students, faculty, or specific academic sections.
                    </p>
                </div>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleCreateSubmit}>
                    <FormField
                        label="BROADCAST SUBJECT"
                        placeholder="e.g. Schedule Update or Campus Event"
                        required
                        value={announcementForm.title}
                        onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        style={{ height: '52px', borderRadius: '12px' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: announcementForm.target_role === 'class' ? '1fr 1fr' : '1fr', gap: '20px' }}>
                        <SelectField
                            label="TARGET AUDIENCE"
                            value={announcementForm.target_role}
                            onChange={e => setAnnouncementForm({
                                ...announcementForm,
                                target_role: e.target.value,
                                target_class_id: e.target.value === 'class' ? announcementForm.target_class_id : ''
                            })}
                            style={{ height: '52px', borderRadius: '12px' }}
                        >
                            <option value="all">Everyone</option>
                            <option value="teacher">Faculty Members Only</option>
                            <option value="student">Student Body</option>
                            <option value="class">Specific Academic Section</option>
                        </SelectField>
                        {announcementForm.target_role === 'class' && (
                            <SelectField
                                label="ACADEMIC SECTION"
                                required
                                value={announcementForm.target_class_id}
                                onChange={e => setAnnouncementForm({ ...announcementForm, target_class_id: e.target.value })}
                                style={{ height: '52px', borderRadius: '12px' }}
                            >
                                <option value="">Select Section...</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                ))}
                            </SelectField>
                        )}
                    </div>
                    <TextareaField
                        label="BROADCAST MESSAGE"
                        rows={6}
                        placeholder="Detail the announcement here..."
                        required
                        value={announcementForm.message}
                        onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                        style={{ borderRadius: '12px', padding: '16px' }}
                    />
                    <Button type="submit" style={{ marginTop: '12px', height: '52px', borderRadius: '12px', fontWeight: 800 }} disabled={isSubmitting}>
                        <Zap size={20} style={{ marginRight: '8px' }} />
                        {isSubmitting ? 'Transmitting...' : 'Dispatch Hub Broadcast'}
                    </Button>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Announcements;
