import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock, Users, BookOpen, Star,
    ChevronRight, Play, Book, CheckSquare,
    Search, Filter, Calendar, TrendingUp,
    AlertCircle, FileText, PlusCircle, MessageSquare,
    GraduationCap, ClipboardList, Send
} from 'lucide-react';
import { useAuth, useTeacherDashboard } from '../../hooks';
import { Link } from 'react-router-dom';
import { Button, Badge, Avatar, Card } from '../../components/atoms';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const { data, loading, error } = useTeacherDashboard();

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ background: 'var(--danger-light)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <AlertCircle size={32} color="var(--danger)" />
            </div>
            <h3 style={{ color: 'var(--text-main)' }}>Unable to load your dashboard</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
            </Button>
        </div>
    );

    if (loading || !data) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            >
                <GraduationCap size={64} color="var(--primary)" />
            </motion.div>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Preparing your classroom...</div>
        </div>
    );

    const { metrics, classes, pending_grading, recent_activity } = data;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ paddingBottom: '40px' }}
        >
            {/* Header Section */}
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <motion.div variants={itemVariants}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {getTimeGreeting()}, {user?.role || 'Professor'}
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>
                        Welcome Back, <span style={{ color: 'var(--primary)' }}>{user?.name.split(' ')[0] || 'Teacher'}</span>
                    </h1>
                </motion.div>
                <motion.div variants={itemVariants} style={{ textAlign: 'right', background: 'white', padding: '12px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>SCHOOL SESSION</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)' }}>
                        <Calendar size={16} color="var(--primary)" />
                        {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                </motion.div>
            </header>

            {/* Quick Stats Grid */}
            <motion.div variants={itemVariants} className="grid-4" style={{ marginBottom: '40px' }}>
                <Card style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ background: 'var(--primary-light)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <Users size={20} color="var(--primary)" />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{classes.length}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Classes</div>
                    </div>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }}>
                        <Users size={80} />
                    </div>
                </Card>

                <Card style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <TrendingUp size={20} color="var(--success)" />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{metrics?.class_attendance || 0}%</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg. Attendance</div>
                    </div>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }}>
                        <TrendingUp size={80} />
                    </div>
                </Card>

                <Card style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <BookOpen size={20} color="var(--warning)" />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{metrics?.homework_completion || 0}%</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>H-Work Success</div>
                    </div>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }}>
                        <BookOpen size={80} />
                    </div>
                </Card>

                <Card style={{ padding: '24px', position: 'relative', overflow: 'hidden', background: 'var(--primary)', color: 'white' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.2)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <AlertCircle size={20} color="white" />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px', color: 'white' }}>{pending_grading.length}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: 600, color: 'white' }}>Items to Grade</div>
                    </div>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}>
                        <CheckSquare size={80} color="white" />
                    </div>
                </Card>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid-2-1">
                <section>
                    {/* Quick Actions */}
                    <motion.div variants={itemVariants} style={{ marginBottom: '40px' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Play size={18} color="var(--primary)" />
                            Quick Actions
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                            <Link to="/assignments" style={{ textDecoration: 'none' }}>
                                <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px' }}>
                                        <PlusCircle size={20} color="var(--primary)" />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>New Assignment</span>
                                </Card>
                            </Link>
                            <Link to="/attendance" style={{ textDecoration: 'none' }}>
                                <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
                                        <ClipboardList size={20} color="var(--success)" />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Mark Attendance</span>
                                </Card>
                            </Link>
                            <Link to="/announcements" style={{ textDecoration: 'none' }}>
                                <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px' }}>
                                        <Send size={20} color="var(--warning)" />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Post Notice</span>
                                </Card>
                            </Link>
                            <Link to="/classes" style={{ textDecoration: 'none' }}>
                                <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px' }}>
                                        <BookOpen size={20} color="var(--primary)" />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Share Resources</span>
                                </Card>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Class List */}
                    <motion.div variants={itemVariants}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0 }}>Active Class Roster</h3>
                            <Link to="/classes" style={{ textDecoration: 'none' }}>
                                <Button variant="outline" style={{ border: 'none', color: 'var(--primary)', height: 'auto', padding: '0', fontWeight: 700 }}>
                                    View All Classes <ChevronRight size={16} />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid-1-1">
                            {classes.map((cls, i) => (
                                <Card key={i} style={{ padding: '24px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <Book size={28} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{cls.name}</h4>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Section {cls.section}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Users size={16} color="var(--text-muted)" />
                                            <span>{cls.students_count} Students</span>
                                        </div>
                                        <Badge bg="var(--success-light)" color="var(--success)">Active</Badge>
                                    </div>

                                    <Link to={`/classes/${cls.id}`} style={{ textDecoration: 'none' }}>
                                        <Button style={{ width: '100%', borderRadius: '12px' }}>
                                            Launch Classroom
                                        </Button>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                </section>

                <section>
                    {/* Grading Queue */}
                    <motion.div variants={itemVariants} style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0 }}>Grading Queue</h3>
                            {pending_grading.length > 0 && (
                                <Badge bg="var(--danger)" color="white" style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px' }}>
                                    {pending_grading.length} URGENT
                                </Badge>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pending_grading.map((sub, i) => (
                                <Card key={i} style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                                    <Avatar name={sub.student.user.name} size={40} style={{ borderRadius: '10px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{sub.homework.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sub.student.user.name}</div>
                                    </div>
                                    <Link to={`/homework/${sub.homework.id}/submissions`}>
                                        <Button size="small" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}>
                                            Grade
                                        </Button>
                                    </Link>
                                </Card>
                            ))}
                            {pending_grading.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-main)', borderRadius: '16px', border: '2px dashed var(--border-color)' }}>
                                    <CheckSquare size={32} style={{ color: 'var(--success)', marginBottom: '12px' }} />
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>Zero Pending</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You're all caught up!</div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activity / Announcements */}
                    <motion.div variants={itemVariants}>
                        <h3 style={{ marginBottom: '20px' }}>Your Recent Notices</h3>
                        <Card style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {recent_activity && recent_activity.length > 0 ? recent_activity.map((ann, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ marginTop: '4px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{ann.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {ann.content}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '8px', fontWeight: 600 }}>
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        No recent activity to show.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </section>
            </div>
        </motion.div>
    );
};

export default TeacherDashboard;

