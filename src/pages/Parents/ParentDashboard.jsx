import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion } from 'framer-motion';
import {
    Users, TrendingUp, AlertTriangle, CreditCard,
    Calendar, Clock, Bell, ChevronRight, MessageSquare, Book
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { Button, Badge, Avatar, Card } from '../../components/atoms';

const ParentDashboard = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        client.get('/parent/children')
            .then(res => {
                setChildren(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0]);
            })
            .catch(err => setError('Failed to retrieve associated profiles.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedChild) {
            setStatsLoading(true);
            client.get(`/analytics/parent/overview?student_id=${selectedChild.id}`)
                .then(res => setStats(res.data))
                .catch(err => console.error('Stats synchronization failed:', err))
                .finally(() => setStatsLoading(false));
        }
    }, [selectedChild]);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                <Users size={64} color="var(--primary)" />
            </motion.div>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Synchronizing family accounts...</div>
        </div>
    );

    if (error || children.length === 0) return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-main)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <Users size={40} color="var(--text-muted)" />
            </div>
            <h3 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Profile Linkage Required</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error || "No children profiles are currently linked to your explorer account."}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Refresh Portal</Button>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ paddingBottom: '60px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Family Overview</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>Monitor academic trajectory and institutional notifications.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '6px', borderRadius: '40px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                    {children.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedChild(c)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 20px',
                                borderRadius: '40px',
                                border: 'none',
                                cursor: 'pointer',
                                background: selectedChild?.id === c.id ? 'var(--primary)' : 'transparent',
                                color: selectedChild?.id === c.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <Avatar name={c.user.name} size={24} />
                            {c.user.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '40px', gridTemplateColumns: '350px 1fr', gap: '40px' }}>
                <motion.div variants={itemVariants}>
                    <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <Avatar
                                name={selectedChild?.user.name}
                                size={110}
                                style={{ margin: '0 auto 24px auto', border: '5px solid var(--primary-light)', boxShadow: 'var(--shadow-md)' }}
                            />
                            <h2 style={{ marginBottom: '8px', fontSize: '1.75rem', fontWeight: 800 }}>{selectedChild?.user.name}</h2>
                            <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                CLASS {selectedChild?.school_class?.name || 'N/A'} • {selectedChild?.school_class?.section || 'N/A'}
                            </Badge>

                            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>ATTENDANCE</div>
                                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{stats?.metrics.attendance_rate || 0}%</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>ACADEMIC GPA</div>
                                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{Math.round(stats?.metrics.gpa || 0)}</div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 800 }}>BALANCE DUE</div>
                                        <div style={{ fontWeight: 900, color: '#991b1b', fontSize: '1.25rem' }}>$1,500.00</div>
                                    </div>
                                    <Button variant="outline" style={{ borderColor: '#ef4444', color: '#ef4444', height: '36px', padding: '0 16px', fontSize: '0.8rem', fontWeight: 800 }}>RESOLVE</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <motion.div variants={itemVariants} className="grid-2" style={{ gap: '24px' }}>
                        {[
                            { label: 'Linked Children', val: children.length, icon: Users, color: 'var(--primary)' },
                            { label: 'Academic Status', val: 'Exemplary', icon: TrendingUp, color: 'var(--success)' },
                            { label: 'Upcoming Exams', val: `${stats?.exams.length || 0} Assessments`, icon: Calendar, color: 'var(--warning)' },
                            { label: 'New Notices', val: `${stats?.announcements.length || 0} Unread`, icon: Bell, color: 'var(--primary)' }
                        ].map((s, i) => (
                            <Card key={i} style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                                <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '14px', color: s.color }}>
                                    <s.icon size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{s.label}</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{s.val}</div>
                                </div>
                            </Card>
                        ))}
                    </motion.div>

                    <div className="grid-1-1" style={{ gap: '32px' }}>
                        <motion.div variants={itemVariants}>
                            <Card style={{ padding: '32px', height: '100%', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Calendar size={20} color="var(--primary)" /> Upcoming Exams
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {stats?.exams.map((ex, i) => (
                                        <div key={i} style={{ borderBottom: i < stats.exams.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: i < stats.exams.length - 1 ? '20px' : 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
                                                <Book size={18} color="var(--primary)" /> {ex.title}
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={14} /> {new Date(ex.date).toLocaleDateString()}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={14} /> 09:00 AM
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {stats?.exams.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            No upcoming assessments scheduled.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card style={{ padding: '32px', height: '100%', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <AlertTriangle size={20} color="var(--warning)" /> Academic Insights
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {stats?.insights.map((insight, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px' }}>
                                            <div style={{ color: insight.severity === 'high' ? 'var(--danger)' : 'var(--warning)', marginTop: '2px' }}>
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>{insight.message}</div>
                                                <Badge
                                                    bg={insight.severity === 'high' ? '#fee2e2' : '#fff9c3'}
                                                    color={insight.severity === 'high' ? '#991b1b' : '#854d0e'}
                                                    style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}
                                                >
                                                    {insight.insight_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {stats?.insights.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            No critical academic alerts.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            <motion.div variants={itemVariants}>
                <Card style={{ padding: '32px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Bell size={20} color="var(--primary)" /> Institutional Broadcasts
                        </h3>
                        <Button variant="outline" style={{ height: '32px', fontSize: '0.8rem', fontWeight: 800 }}>ARCHIVE</Button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {stats?.announcements.map((ann, i) => (
                            <div key={i} style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '20px' }}>
                                <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>{ann.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>{new Date(ann.created_at).toLocaleDateString()}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>{ann.message}</div>
                            </div>
                        ))}
                    </div>
                    {stats?.announcements.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No recent institutional announcements.
                        </div>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default ParentDashboard;
