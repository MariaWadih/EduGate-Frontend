import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    BookOpen,
    Calendar as CalendarIcon,
    MapPin,
    AlertCircle,
    Info,
    ChevronRight,
    Layers
} from 'lucide-react';
import { useStudentDashboard } from '../../hooks';
import { Card, Badge, Button } from '../../components/atoms';

const StudentCalendar = () => {
    const { data, loading, error } = useStudentDashboard();

    const {
        schedules = [],
        exams = [],
        assignments = []
    } = data || {};

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00'
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <Layers size={48} color="var(--primary)" />
            </motion.div>
            <div style={{ marginTop: '24px', fontWeight: 700, fontSize: '1.2rem' }}>Building your academic timetable...</div>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '80px' }}
        >
            <header style={{ marginBottom: '40px' }}>
                <Badge bg="rgba(79, 70, 229, 0.1)" color="var(--primary)" style={{ marginBottom: '16px', fontWeight: 800 }}>WEEKLY TIMETABLE</Badge>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-0.04em' }}>Academic <span style={{ color: 'var(--primary)' }}>Schedule</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px', fontWeight: 500 }}>Your weekly lecture routine and scheduled academic activities.</p>
            </header>

            <Card style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
                {/* Timetable Scroll Container */}
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '1000px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '100px', padding: '24px', background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)', borderRight: '2px solid var(--border-color)' }}>
                                    <Clock size={20} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                                </th>
                                {days.map(day => (
                                    <th key={day} style={{ padding: '24px', background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Session</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>{day}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((time, timeIdx) => (
                                <tr key={time}>
                                    {/* Left Time Label */}
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
                                        // Find course for this day and time
                                        const session = schedules.find(s => {
                                            const startHour = s.start_time?.split(':')[0];
                                            const slotHour = time.split(':')[0];
                                            return s.day_of_week === day && startHour === slotHour;
                                        });

                                        return (
                                            <td
                                                key={`${day}-${time}`}
                                                style={{
                                                    padding: '12px',
                                                    borderRight: '1px solid #F1F5F9',
                                                    borderBottom: '1px solid #F1F5F9',
                                                    verticalAlign: 'top',
                                                    height: '120px',
                                                    background: session ? 'rgba(79, 70, 229, 0.02)' : 'transparent'
                                                }}
                                            >
                                                {session && (
                                                    <motion.div
                                                        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                                                        style={{
                                                            background: 'white',
                                                            padding: '16px',
                                                            borderRadius: '20px',
                                                            border: '1px solid var(--border-color)',
                                                            borderLeft: '4px solid var(--primary)',
                                                            height: '100%',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'space-between',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                                                {session.start_time?.substring(0, 5)} - {session.end_time?.substring(0, 5)}
                                                            </div>
                                                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                                                                {session.subject?.name}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                                            <MapPin size={12} /> {session.room || 'Gallery 402'}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Visual indicator for exams or assignments here? */}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <Card style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{schedules.length}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weekly Lectures</div>
                    </div>
                </Card>
                <Card style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={24} color="#EF4444" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{exams.length}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Upcoming Exams</div>
                    </div>
                </Card>
                <Card style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarIcon size={24} color="#10B981" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{assignments.length}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Tasks</div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};

export default StudentCalendar;
