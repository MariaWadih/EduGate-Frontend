import React, { useEffect, useState, useMemo } from 'react';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ClipboardList, CheckCircle, XCircle, Clock, 
    Filter, Search, Calendar, User, 
    Book, FileText, ChevronRight, MessageSquare 
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { Avatar, Card, Badge, Button, Select, Input, Toggle } from '../../components/atoms';

const ParentAssignments = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [childLoading, setChildLoading] = useState(false);

    // Filters
    const [subjectFilter, setSubjectFilter] = useState('All Subjects');
    const [missingOnly, setMissingOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLoading(true);
        client.get('/parent/children')
            .then(res => {
                setChildren(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0]);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedChild) {
            setChildLoading(true);
            client.get(`/analytics/parent/overview?student_id=${selectedChild.id}`)
                .then(res => setData(res.data))
                .catch(err => console.error(err))
                .finally(() => setChildLoading(false));
        }
    }, [selectedChild]);

    const assignments = data?.assignments || [];

    const stats = useMemo(() => {
        const total = assignments.length;
        const submitted = assignments.filter(a => a.submissions.length > 0 && a.submissions[0].status !== 'pending').length;
        const missing = assignments.filter(a => a.submissions.length === 0 || a.submissions[0].status === 'pending').length;
        const scores = assignments
            .filter(a => a.submissions.length > 0 && a.submissions[0].score !== null)
            .map(a => parseFloat(a.submissions[0].score));
        const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A';

        return { total, submitted, missing, avg };
    }, [assignments]);

    const filteredAssignments = useMemo(() => {
        return assignments.filter(a => {
            const matchesSubject = subjectFilter === 'All Subjects' || a.subject?.name === subjectFilter;
            const isMissing = a.submissions.length === 0 || a.submissions[0].status === 'pending';
            const matchesMissing = !missingOnly || isMissing;
            const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSubject && matchesMissing && matchesSearch;
        });
    }, [assignments, subjectFilter, missingOnly, searchQuery]);

    const subjects = ['All Subjects', ...new Set(assignments.map(a => a.subject?.name))];

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ClipboardList size={48} color="var(--primary)" />
            </motion.div>
            <div style={{ marginTop: '20px', fontWeight: 800, color: 'var(--text-muted)' }}>Retrieving academic tasks...</div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: '60px' }}>
            {/* Child Switcher */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', background: 'white', padding: '8px', borderRadius: '40px', width: 'fit-content', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                {children.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedChild(c)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 24px',
                            borderRadius: '40px',
                            border: 'none',
                            cursor: 'pointer',
                            background: selectedChild?.id === c.id ? 'var(--primary)' : 'transparent',
                            color: selectedChild?.id === c.id ? 'white' : 'var(--text-muted)',
                            fontWeight: 800,
                            transition: 'all 0.25s'
                        }}
                    >
                        <Avatar name={c.user.name} size={24} />
                        {c.user.name}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Assignments</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem', marginTop: '6px' }}>Overview of your children's academic tasks and performance.</p>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {[
                    { label: 'Total Assignments', val: stats.total, icon: ClipboardList, color: 'var(--primary)', bg: 'rgba(79, 70, 229, 0.08)' },
                    { label: 'Submitted', val: stats.submitted, icon: CheckCircle, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.08)' },
                    { label: 'Missing', val: stats.missing, icon: XCircle, color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.08)' },
                    { label: 'Average Grade', val: stats.avg, icon: FileText, color: 'var(--primary)', bg: 'rgba(79, 70, 229, 0.08)', suffix: '%' }
                ].map((s, i) => (
                    <Card key={i} style={{ padding: '24px', borderRadius: '24px', position: 'relative' }}>
                        <div style={{ background: s.bg, color: s.color, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '24px', right: '24px' }}>
                            <s.icon size={20} />
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{s.val}{s.suffix}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Upcoming Section */}
            <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 850, marginBottom: '24px' }}>Upcoming Assignments</h2>
                {assignments.filter(a => new Date(a.due_date) >= new Date() && a.submissions.length === 0).length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-main)', borderRadius: '24px', border: '2px dashed var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>
                        No upcoming assignments for the selected child.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                        {assignments.filter(a => new Date(a.due_date) >= new Date() && a.submissions.length === 0).map(a => (
                             <Card key={a.id} style={{ padding: '24px', borderRadius: '20px', borderLeft: '6px solid var(--warning)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <Badge bg="rgba(245, 158, 11, 0.1)" color="var(--warning)" style={{ fontWeight: 800 }}>PENDING</Badge>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} /> Due {new Date(a.due_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 850 }}>{a.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <Book size={16} /> {a.subject?.name}
                                </div>
                             </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* History Table Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 850, margin: 0 }}>Assignment List/History</h2>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '250px' }}>
                            {/* Simple Input/Select simulation via HTML for brevity or use atoms */}
                            <select 
                                value={subjectFilter} 
                                onChange={e => setSubjectFilter(e.target.value)}
                                style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 600 }}
                            >
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Show Missing Only</span>
                            <Toggle checked={missingOnly} onChange={setMissingOnly} />
                        </div>
                    </div>
                </div>

                <Card style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F9FAFB' }}>
                                <tr>
                                    <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>CHILD</th>
                                    <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>ASSIGNMENT TITLE</th>
                                    <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>SUBJECT</th>
                                    <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>DUE DATE</th>
                                    <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>SUBMISSION</th>
                                    <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>STATUS</th>
                                    <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>GRADE</th>
                                    <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>TEACHER</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssignments.map((a, idx) => {
                                    const sub = a.submissions[0];
                                    const isMissing = !sub || sub.status === 'pending';
                                    return (
                                        <tr key={a.id} style={{ borderBottom: idx < filteredAssignments.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                            <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '0.9rem' }}>{selectedChild?.user.name}</td>
                                            <td style={{ padding: '20px 24px', fontWeight: 800, fontSize: '0.9rem' }}>{a.title}</td>
                                            <td style={{ padding: '20px 24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.subject?.name}</td>
                                            <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '0.85rem' }}>{new Date(a.due_date).toISOString().split('T')[0]}</td>
                                            <td style={{ padding: '20px 24px', fontWeight: 600, fontSize: '0.85rem' }}>{sub?.submitted_at ? new Date(sub.submitted_at).toISOString().split('T')[0] : 'N/A'}</td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <Badge 
                                                    bg={isMissing ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'} 
                                                    color={isMissing ? 'var(--danger)' : 'var(--success)'}
                                                    style={{ fontWeight: 800, textTransform: 'uppercase' }}
                                                >
                                                    {isMissing ? 'Missing' : 'Submitted'}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '20px 24px', fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>{sub?.score || 'N/A'}</td>
                                            <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '0.85rem' }}>{a.teacher?.user.name}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};

export default ParentAssignments;
