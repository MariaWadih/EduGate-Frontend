import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock, Users, BookOpen, Star,
    ChevronRight, Play, Book, CheckSquare,
    Search, Filter, Calendar
} from 'lucide-react';
import { useAuth, useTeacherDashboard } from '../../hooks';
import { Link } from 'react-router-dom';
import { Button, Badge, Avatar, Card } from '../../components/atoms';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const { data, loading, error } = useTeacherDashboard();

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--danger)' }}>Unable to load dashboard</h3>
            <p>{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
                Try Again
            </Button>
        </div>
    );

    if (loading || !data) return (

        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <BookOpen size={48} color="var(--primary)" />
            </motion.div>
        </div>
    );

    const { metrics, classes, pending_grading } = data;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Faculty Dashboard</div>
                    <h1 style={{ margin: 0 }}>Welcome Back, Prof. {user?.name.split(' ').pop() || 'Professor'}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT DATE</div>
                        <div style={{ fontWeight: 700 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
            </header>

            <Card style={{ padding: '40px', background: 'linear-gradient(135deg, var(--primary) 0%, #06B6D4 100%)', color: 'white', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '12px', color: 'white' }}>Academic Spotlight</h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px' }}>
                        You have {classes.length} active classes this semester. There are {pending_grading.length} new submissions that require your academic review.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '32px', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{classes.length}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8 }}>CLASSES</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{pending_grading.length}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8 }}>TO GRADE</div>
                    </div>
                </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0 }}>Active Class Roster</h3>
                        <Link to="/classes" style={{ textDecoration: 'none' }}>
                            <Button variant="outline" style={{ border: 'none', color: 'var(--text-muted)', height: 'auto', padding: '0' }}>
                                All Classes <ChevronRight size={14} />
                            </Button>
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {classes.map((cls, i) => (
                            <Card key={i} style={{ padding: '28px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
                                        <Users size={24} />
                                    </div>
                                    <Badge bg="var(--success-light)" color="var(--success)" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                                        ACTIVE
                                    </Badge>
                                </div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>{cls.name}</h4>
                                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={14} /> {cls.students_count} Students
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Book size={14} /> Section {cls.section}
                                    </div>
                                </div>
                                <Button style={{ width: '100%' }}>
                                    Launch Classroom
                                </Button>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0 }}>Grading Queue</h3>
                        <Badge bg="var(--danger)" color="white" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                            {pending_grading.length} URGENT
                        </Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pending_grading.map((sub, i) => (
                            <Card key={i} style={{ display: 'flex', gap: '16px', padding: '20px' }}>
                                <Avatar name={sub.student.user.name} size={44} style={{ borderRadius: '12px' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '2px' }}>{sub.homework.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sub.student.user.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                            SUBMITTED {new Date(sub.submitted_at).toLocaleDateString()}
                                        </div>
                                        <Button size="small" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                                            Grade
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {pending_grading.length === 0 && (
                            <Card style={{ textAlign: 'center', padding: '48px', borderStyle: 'dashed', border: '2px dashed var(--border-color)' }}>
                                <CheckSquare size={48} style={{ color: 'var(--success)', marginBottom: '16px', margin: '0 auto 16px auto' }} />
                                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.25rem' }}>Inbox Zero!</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>All student submissions graded.</div>
                            </Card>
                        )}
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default TeacherDashboard;
