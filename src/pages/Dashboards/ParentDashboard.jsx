import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion } from 'framer-motion';
import {
    Users, TrendingUp, AlertTriangle, CreditCard,
    Calendar, Clock, Bell, ChevronRight, MessageSquare, Book
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, Avatar, Card } from '../../components/atoms';

const ParentDashboard = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        client.get('/parent/children').then(res => {
            setChildren(res.data);
            if (res.data.length > 0) setSelectedChild(res.data[0]);
        });
    }, []);

    useEffect(() => {
        if (selectedChild) {
            client.get(`/analytics/parent/overview?student_id=${selectedChild.id}`).then(res => setStats(res.data));
        }
    }, [selectedChild]);

    if (children.length === 0) return <div style={{ padding: '40px' }}>No children profiles linked.</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ margin: 0 }}>Parent Dashboard</h1>
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '40px' }}>
                    {children.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedChild(c)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px',
                                borderRadius: '40px',
                                border: 'none',
                                cursor: 'pointer',
                                background: selectedChild?.id === c.id ? 'var(--primary)' : 'transparent',
                                color: selectedChild?.id === c.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Avatar name={c.user.name} size={24} />
                            {c.user.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                <Card style={{ gridColumn: 'span 1', textAlign: 'center', padding: '32px' }}>
                    <Avatar
                        name={selectedChild?.user.name}
                        size={100}
                        style={{ margin: '0 auto 16px auto', border: '4px solid #f1f5f9' }}
                    />
                    <h2 style={{ marginBottom: '4px' }}>{selectedChild?.user.name}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', textAlign: 'left' }}>
                        <div>
                            <div className="text-muted text-small">Class:</div>
                            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedChild?.school_class?.name || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-muted text-small">Section:</div>
                            <div style={{ fontWeight: 600 }}>{selectedChild?.school_class?.section || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-muted text-small">Attendance:</div>
                            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{stats?.metrics.attendance_rate || 0}%</div>
                        </div>
                        <div>
                            <div className="text-muted text-small">Avg. GPA:</div>
                            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{Math.round(stats?.metrics.gpa || 0)}</div>
                        </div>
                    </div>

                    <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div className="text-muted text-small" style={{ color: '#991b1b' }}>Outstanding Balance:</div>
                            <div style={{ fontWeight: 700, color: '#991b1b' }}>$1,500.00</div>
                        </div>
                        <Badge bg="#ef4444" color="white" style={{ fontSize: '0.7rem', fontWeight: 700 }}>DUE</Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
                        <Button variant="outline" onClick={() => alert('Opening Grade Report...')}>View Grades</Button>
                        <Button variant="outline" onClick={() => alert('Opening Payment Portal...')}>Payment History</Button>
                    </div>
                </Card>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="kpi-grid" style={{ marginBottom: 0, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                        <Card style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ color: 'var(--primary)' }}><Users size={24} /></div>
                            <div>
                                <div className="text-muted text-small">Number of Children</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{children.length}</div>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ color: 'var(--primary)' }}><TrendingUp size={24} /></div>
                            <div>
                                <div className="text-muted text-small">Latest Update</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Grade Posted</div>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ color: 'var(--primary)' }}><Calendar size={24} /></div>
                            <div>
                                <div className="text-muted text-small">Upcoming Exams</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.exams.length || 0} Exams</div>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ color: 'var(--primary)' }}><Bell size={24} /></div>
                            <div>
                                <div className="text-muted text-small">Announcements</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.announcements.length || 0} New</div>
                            </div>
                        </Card>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <Card style={{ padding: '32px' }}>
                            <h3 style={{ marginBottom: '20px' }}>Upcoming Exams</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {stats?.exams.map((ex, i) => (
                                    <div key={i} style={{ borderBottom: i < stats.exams.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: i < stats.exams.length - 1 ? '20px' : 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
                                            <Book size={18} className="text-muted" /> {ex.title}
                                        </div>
                                        <div className="text-muted text-small" style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(ex.date).toLocaleDateString()}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 09:00 AM</span>
                                        </div>
                                    </div>
                                ))}
                                {stats?.exams.length === 0 && <div className="text-muted">No upcoming exams.</div>}
                            </div>
                        </Card>

                        <Card style={{ padding: '32px' }}>
                            <h3 style={{ marginBottom: '20px' }}>Alerts Feed</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {stats?.insights.map((insight, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ color: insight.severity === 'high' ? 'var(--danger)' : 'var(--warning)', marginTop: '4px' }}>
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', lineHeight: 1.4, marginBottom: '4px' }}>{insight.message}</div>
                                            <Badge
                                                bg={insight.severity === 'high' ? '#fee2e2' : '#fff9c3'}
                                                color={insight.severity === 'high' ? '#991b1b' : '#854d0e'}
                                                style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800 }}
                                            >
                                                {insight.insight_type}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {stats?.insights.length === 0 && <div className="text-muted">No alerts at this time.</div>}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <Card style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '20px' }}>Recent Announcements</h3>
                <div style={{ display: 'flex', gap: '24px' }}>
                    {stats?.announcements.map((ann, i) => (
                        <div key={i} style={{ flex: 1, padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{ann.title}</div>
                            <div className="text-muted text-small" style={{ marginBottom: '8px' }}>{new Date(ann.created_at).toLocaleDateString()}</div>
                            <div className="text-muted text-small" style={{ lineHeight: 1.4 }}>{ann.message}</div>
                        </div>
                    ))}
                    {stats?.announcements.length === 0 && <div className="text-muted">No announcements.</div>}
                </div>
            </Card>
        </motion.div>
    );
};

export default ParentDashboard;
