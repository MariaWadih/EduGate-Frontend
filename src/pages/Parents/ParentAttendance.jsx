import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Users, CheckCircle2, XCircle, 
    AlertCircle, Clock, ChevronRight, Filter
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { Avatar, Card, Badge, ProgressBar } from '../../components/atoms';

const ParentAttendance = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [childLoading, setChildLoading] = useState(false);

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

    if (loading) return <div>Loading records...</div>;

    const attendanceRecords = data?.attendance || [];
    const attendanceRate = data?.metrics.attendance_rate || 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'var(--success)';
            case 'absent': return 'var(--danger)';
            case 'late': return 'var(--warning)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Attendance Logs</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Daily presence tracking across academic sessions.</p>
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
                                padding: '8px 24px',
                                borderRadius: '40px',
                                border: 'none',
                                cursor: 'pointer',
                                background: selectedChild?.id === c.id ? 'var(--primary)' : 'transparent',
                                color: selectedChild?.id === c.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 800,
                                transition: 'all 0.2s'
                            }}
                        >
                            <Avatar name={c.user.name} size={24} />
                            {c.user.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                <div>
                    <Card style={{ padding: '0', borderRadius: '28px', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Recent History</h3>
                            <Badge bg="var(--bg-main)" color="var(--text-muted)" style={{ fontWeight: 800 }}>LAST 30 ENTRIES</Badge>
                        </div>
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {attendanceRecords.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#F9FAFB', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Date</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceRecords.map((rec, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '20px 24px', fontWeight: 700, color: 'var(--text-main)' }}>
                                                    {new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <Badge 
                                                        bg={`${getStatusColor(rec.status)}15`} 
                                                        color={getStatusColor(rec.status)}
                                                        style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}
                                                    >
                                                        {rec.status}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                                                    {rec.remarks || 'Standard record entry.'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No attendance history available for this term.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <Card style={{ padding: '32px', borderRadius: '28px', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--bg-main)" strokeWidth="12" />
                                <circle 
                                    cx="60" cy="60" r="54" fill="none" 
                                    stroke="var(--primary)" strokeWidth="12" 
                                    strokeDasharray={`${attendanceRate * 3.39} 339`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                />
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{attendanceRate}%</div>
                            </div>
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 900 }}>Term Stability</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>Overall presence score</p>
                    </Card>

                    <Card style={{ padding: '32px', borderRadius: '28px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 900 }}>Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Present', val: attendanceRecords.filter(r => r.status === 'present').length, color: 'var(--success)' },
                                { label: 'Absent', val: attendanceRecords.filter(r => r.status === 'absent').length, color: 'var(--danger)' },
                                { label: 'Late', val: attendanceRecords.filter(r => r.status === 'late').length, color: 'var(--warning)' }
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '14px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: s.color }}>{s.label}</span>
                                    <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default ParentAttendance;
