import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Clock, Book, Calendar, CheckSquare,
    Search, Filter, ChevronRight, BarChart2,
    TrendingUp, Award, Zap, AlertCircle,
    ArrowUpRight, BookOpen, GraduationCap,
    Star, MessageSquare
} from 'lucide-react';
import { useAuth, useStudentDashboard } from '../../hooks';
import { Button, Badge, Card, Avatar } from '../../components/atoms';
import { SearchBar } from '../../components/molecules';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data, loading, error } = useStudentDashboard();
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            >
                <div style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '32px', boxShadow: '0 8px 32px rgba(79, 70, 229, 0.15)' }}>
                    <GraduationCap size={72} color="var(--primary)" />
                </div>
            </motion.div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem' }}>Synchronizing your academic portal...</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tailoring insights to your performance</div>
        </div>
    );

    if (error || !data) return (
        <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <AlertCircle size={40} color="var(--danger)" />
            </div>
            <h2 style={{ color: 'var(--text-main)', fontWeight: 800, marginBottom: '12px' }}>Connection Interrupted</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>{error || "We couldn't retrieve your dashboard data. Please verify your connection."}</p>
            <Button variant="primary" style={{ width: '100%', borderRadius: '12px' }} onClick={() => window.location.reload()}>
                Re-establish Session
            </Button>
        </div>
    );

    const {
        metrics = {},
        grades = [],
        exams = [],
        assignments = [],
        insights = [],
        courses = [],
        attendance_trend = []
    } = data || {};

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.08,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ paddingBottom: '60px' }}
        >
            {/* Header Section */}
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <motion.div variants={itemVariants}>
                    <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '12px', fontWeight: 800, letterSpacing: '0.05em' }}>
                        {getTimeGreeting()}, {user?.role?.toUpperCase() || 'STUDENT'}
                    </Badge>
                    <h1 style={{ margin: 0, fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                        Welcome Back, <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0] || 'Explorer'}</span>
                    </h1>
                </motion.div>
                <motion.div variants={itemVariants} style={{ textAlign: 'right', background: 'white', padding: '16px 24px', borderRadius: '20px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px', textTransform: 'uppercase' }}>Current Session</div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                    <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                        <Calendar size={20} />
                    </div>
                </motion.div>
            </header>

            {/* Quick Stats Grid */}
            <motion.div variants={itemVariants} className="grid-4" style={{ marginBottom: '48px' }}>
                {[
                    { label: 'Academic GPA', val: Math.round(metrics.gpa * 10) / 10, icon: TrendingUp, color: 'var(--primary)', bg: 'var(--primary-light)', hint: 'Across all subjects' },
                    { label: 'Active Tasks', val: assignments.filter(a => !a.submissions[0]).length, icon: Zap, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)', hint: 'Pending submission' },
                    { label: 'Exam Count', val: exams.length, icon: Calendar, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)', hint: 'Scheduled this month' },
                    { label: 'Completion', val: `${Math.round((assignments.filter(a => a.submissions[0]).length / (assignments.length || 1)) * 100)}%`, icon: Star, color: 'white', bg: 'var(--primary)', hint: 'Assignment trajectory', dark: true }
                ].map((stat, idx) => (
                    <Card key={idx} style={{
                        padding: '28px',
                        background: stat.dark ? 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)' : 'white',
                        color: stat.dark ? 'white' : 'inherit',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-md)',
                        border: 'none'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                background: stat.dark ? 'rgba(255, 255, 255, 0.2)' : stat.bg,
                                width: '44px', height: '44px', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                            }}>
                                <stat.icon size={22} color={stat.dark ? 'white' : stat.color} />
                            </div>
                            <div style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.02em' }}>{stat.val}</div>
                            <div style={{ fontSize: '0.9rem', color: stat.dark ? 'rgba(255,255,255,0.9)' : 'var(--text-main)', fontWeight: 800 }}>{stat.label}</div>
                            <div style={{ fontSize: '0.75rem', color: stat.dark ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>{stat.hint}</div>
                        </div>
                    </Card>
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid-2-1">
                <section>
                    {/* Performance Overview */}
                    <motion.div variants={itemVariants} style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800 }}>
                                <BarChart2 size={24} color="var(--primary)" />
                                Subject Proficiency
                            </h3>
                            <Link to="/grading" style={{ textDecoration: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                FULL ACADEMIC AUDIT <ArrowUpRight size={16} />
                            </Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {grades.map((g, i) => (
                                <Card key={i} style={{ padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontSize: '0.65rem', fontWeight: 800 }}>{g.subject.name.toUpperCase()}</Badge>
                                        <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-main)' }}>{g.score}</div>
                                    </div>
                                    <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(g.score / (g.max_score || 100)) * 100}%` }}
                                            transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                                            style={{
                                                height: '100%',
                                                background: `linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)`,
                                                borderRadius: '5px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        <span>MASTERY LEVEL</span>
                                        <span style={{ color: 'var(--text-main)' }}>{Math.round((g.score / (g.max_score || 100)) * 100)}%</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>

                    {/* Active Assignments */}
                    <motion.div variants={itemVariants} style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800 }}>
                                <BookOpen size={24} color="var(--primary)" />
                                Pipeline Assignments
                            </h3>
                            <Link to="/assignments" style={{ textDecoration: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                RESOURCE HUB <ArrowUpRight size={16} />
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {assignments.slice(0, 5).map((hw, i) => {
                                const submission = hw.submissions[0];
                                const isSubmitted = submission?.status === 'submitted' || submission?.status === 'graded';
                                return (
                                    <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px 24px', cursor: 'pointer', border: '1px solid transparent' }}
                                        onClick={() => navigate('/assignments')}
                                        whileHover={{ borderColor: 'var(--primary-light)', x: 4 }}>
                                        <div style={{ background: isSubmitted ? 'rgba(16, 185, 129, 0.1)' : 'var(--primary-light)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSubmitted ? 'var(--success)' : 'var(--primary)' }}>
                                            {isSubmitted ? <CheckSquare size={24} /> : <BookOpen size={24} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{hw.title}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                                <Badge bg="#F8FAF8" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>{hw.subject.name.toUpperCase()}</Badge>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: new Date(hw.due_date) < new Date() && !isSubmitted ? 'var(--danger)' : 'inherit' }}>
                                                    <Clock size={14} /> DUE {new Date(hw.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            {isSubmitted ? (
                                                <Badge bg="rgba(16, 185, 129, 0.1)" color="var(--success)" style={{ fontWeight: 800, padding: '8px 16px', borderRadius: '10px' }}>
                                                    {submission?.status === 'graded' ? `GRADE: ${submission.score}` : 'SUBMITTED'}
                                                </Badge>
                                            ) : (
                                                <Button size="small" variant="primary" style={{ borderRadius: '10px', fontWeight: 800, padding: '10px 20px' }}>Dispatch Work</Button>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Registered Courses */}
                    <motion.div variants={itemVariants}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800 }}>
                                <GraduationCap size={24} color="var(--primary)" />
                                My Enrolled Courses
                            </h3>
                            <Link to="/student/courses" style={{ textDecoration: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                VIEW ALL <ArrowUpRight size={16} />
                            </Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {courses && courses.map((course, i) => (
                                <Card key={i} style={{ padding: '24px', position: 'relative', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                            {course.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '4px' }}>{course.name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Avatar name={course.teacher?.user?.name || 'T'} size={24} />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prof. {course.teacher?.user?.name || 'Assigned'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                                <Clock size={14} /> 4h / week
                                            </span>
                                        </div>
                                        <Button variant="outline" size="small" style={{ borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>Syllabus</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                </section>

                <section>
                    {/* Insights & Alerts */}
                    <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                        <Card style={{ padding: '32px', background: 'white', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
                            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 800 }}>
                                <Zap size={20} color="var(--warning)" />
                                Intelligence Alerts
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {insights.map((insight, i) => (
                                    <div key={i} style={{
                                        padding: '20px',
                                        borderRadius: '16px',
                                        background: insight.severity === 'high' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                        borderLeft: `5px solid ${insight.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}`,
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: 'var(--text-main)',
                                        display: 'flex',
                                        gap: '16px'
                                    }}>
                                        <div style={{ marginTop: '2px' }}>
                                            <AlertCircle size={20} color={insight.severity === 'high' ? 'var(--danger)' : 'var(--warning)'} />
                                        </div>
                                        <div style={{ lineHeight: '1.5' }}>{insight.message}</div>
                                    </div>
                                ))}
                                {insights.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-main)', borderRadius: '16px' }}>
                                        <Star size={32} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Trajectory Clear</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>No urgent alerts detected in your academic path.</div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Attendance Trend */}
                    <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                        <Card style={{ padding: '32px', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 800 }}>
                                    <CheckSquare size={20} color="var(--success)" />
                                    Attendance Log
                                </h3>
                                <Link to="/student/attendance" style={{ textDecoration: 'none' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--success)' }}>{metrics.attendance_rate}%</div>
                                </Link>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {attendance_trend && attendance_trend.map((record, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: record.status === 'present' ? 'var(--success)' : 'var(--danger)' }}></div>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <Badge
                                            bg={record.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                                            color={record.status === 'present' ? 'var(--success)' : 'var(--danger)'}
                                            style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
                                        >
                                            {record.status}
                                        </Badge>
                                    </div>
                                ))}
                                {(!attendance_trend || attendance_trend.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                        No recent attendance records found.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Upcoming Exams Card */}
                    <motion.div variants={itemVariants}>
                        <Card style={{ padding: '32px', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 800 }}>
                                    <Calendar size={20} color="var(--primary)" />
                                    Exam Calendar
                                </h3>
                                <Badge bg="var(--primary-light)" color="var(--primary)" style={{ padding: '4px 10px', borderRadius: '8px', fontWeight: 900 }}>{exams.length}</Badge>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {exams.map((ex, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '20px', paddingBottom: i < exams.length - 1 ? '20px' : 0, borderBottom: i < exams.length - 1 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
                                        <div style={{ background: 'var(--bg-main)', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1px' }}>
                                                {new Date(ex.date).toLocaleString('default', { month: 'short' })}
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                                                {new Date(ex.date).getDate()}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>{ex.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{ex.subject.name.toUpperCase()} • {ex.duration} MINS</div>
                                        </div>
                                        <Link to="/exams">
                                            <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '10px', color: 'var(--primary)', transition: 'all 0.2s' }}>
                                                <ArrowUpRight size={18} />
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                                {exams.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                        No upcoming assessments.
                                    </div>
                                )}
                            </div>
                            {exams.length > 0 && (
                                <Button
                                    variant="outline"
                                    style={{ width: '100%', marginTop: '32px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, padding: '12px' }}
                                    onClick={() => navigate('/exams')}
                                >
                                    OPEN FULL CALENDAR
                                </Button>
                            )}
                        </Card>
                    </motion.div>
                </section>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;

