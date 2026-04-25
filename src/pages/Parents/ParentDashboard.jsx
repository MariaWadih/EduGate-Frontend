import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion } from 'framer-motion';
import {
    Users, Calendar, Clock, MapPin, Layers
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { Avatar, Card, Badge } from '../../components/atoms';

const ParentDashboard = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [stats, setStats] = useState(null);
    const [childrenMetrics, setChildrenMetrics] = useState({});
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

    useEffect(() => {
        setLoading(true);
        client.get('/parent/children')
            .then(res => {
                setChildren(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0]);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to retrieve children profiles.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedChild) {
            setStatsLoading(true);
            client.get(`/analytics/parent/overview?student_id=${selectedChild.id}`)
                .then(res => setStats(res.data))
                .catch(err => console.error('Academic sync failed:', err))
                .finally(() => setStatsLoading(false));
        }
    }, [selectedChild]);

    useEffect(() => {
        if (children.length > 0) {
            children.forEach(child => {
                if (!childrenMetrics[child.id]) {
                    client.get(`/analytics/parent/overview?student_id=${child.id}`)
                        .then(res => {
                            setChildrenMetrics(prev => ({
                                ...prev,
                                [child.id]: res.data.metrics
                            }));
                        })
                        .catch(err => console.error(`Failed to fetch metrics for ${child.user.name}`, err));
                }
            });
        }
    }, [children]);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                <Layers size={64} color="var(--primary)" />
            </motion.div>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Synchronizing family schedules...</div>
        </div>
    );

    if (error || children.length === 0) return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-main)', fontWeight: 800 }}>No Academic Data</h3>
            <p style={{ color: 'var(--text-muted)' }}>No children profiles currently active.</p>
        </div>
    );

    const schedules = stats?.schedules || [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                     <Badge bg="rgba(79, 70, 229, 0.1)" color="var(--primary)" style={{ marginBottom: '12px', fontWeight: 800 }}>FAMILY ACADEMIC CALENDAR</Badge>
                     <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Weekly <span style={{ color: 'var(--primary)' }}>Schedules</span></h1>
                     <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: '10px' }}>Monitor and manage student academic routines and timetables.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '8px', borderRadius: '45px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                    {children.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedChild(c)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 28px',
                                borderRadius: '40px',
                                border: 'none',
                                cursor: 'pointer',
                                background: selectedChild?.id === c.id ? 'var(--primary)' : 'transparent',
                                color: selectedChild?.id === c.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 800,
                                fontSize: '1rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <Avatar name={c.user.name} size={28} />
                            {c.user.name}
                        </button>
                    ))}
                </div>
            </div>

            {statsLoading ? (
               <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                         <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Updating timetable...</span>
                    </motion.div>
               </div>
            ) : (
                <Card style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '1000px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '100px', padding: '24px', background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)', borderRight: '2px solid var(--border-color)' }}>
                                        <Clock size={20} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                                    </th>
                                    {days.map(day => (
                                        <th key={day} style={{ padding: '24px', background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>{day}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((time, timeIdx) => (
                                    <tr key={time}>
                                        <td style={{
                                            padding: '24px',
                                            textAlign: 'center',
                                            fontWeight: 800,
                                            color: 'var(--text-muted)',
                                            borderRight: '2px solid var(--border-color)',
                                            borderBottom: '1px solid #F1F5F9',
                                            background: 'var(--bg-main)',
                                            fontSize: '0.85rem'
                                        }}>
                                            {time}
                                        </td>
                                        {days.map(day => {
                                            const session = schedules.find(s => {
                                                const startHour = s.start_time?.split(':')[0];
                                                const slotHour = time.split(':')[0];
                                                return s.day_of_week === day && startHour === slotHour;
                                            });

                                            return (
                                                <td key={`${day}-${time}`} style={{ padding: '10px', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', height: '120px', background: session ? 'rgba(79, 70, 229, 0.01)' : 'transparent' }}>
                                                    {session && (
                                                        <motion.div
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            style={{
                                                                background: 'white',
                                                                padding: '16px',
                                                                borderRadius: '20px',
                                                                border: '1px solid var(--border-color)',
                                                                borderLeft: '4px solid var(--primary)',
                                                                height: '100%',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '8px' }}>{session.subject?.name}</div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                                                <MapPin size={12} /> {session.room || 'Gallery 402'}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </motion.div>
    );
};

export default ParentDashboard;
