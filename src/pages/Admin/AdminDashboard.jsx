import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import {
    Users, TrendingUp, AlertTriangle, CreditCard,
    ChevronRight, MessageSquare, Bell, Calendar, GraduationCap, Plus,
    Award, Target, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { Button, Badge, Avatar, Card } from '../../components/atoms';
import { Modal, FormField, SelectField, TextareaField } from '../../components/molecules';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null);

    // Form states
    const [facultyForm, setFacultyForm] = useState({ name: '', email: '', role: 'teacher' });
    const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', target_role: 'all' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = () => {
        setLoading(true);
        client.get('/analytics/admin/overview')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFacultySubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        client.post('/users/register', {
            ...facultyForm,
            password: 'password' // Default password for demo
        })
            .then(() => {
                alert('Faculty member registered successfully!');
                setFacultyForm({ name: '', email: '', role: 'teacher' });
                setActiveModal(null);
                fetchData();
            })
            .catch(err => {
                console.error(err);
                alert(err.response?.data?.message || 'Failed to register faculty');
            })
            .finally(() => setIsSubmitting(false));
    };

    const handleAnnouncementSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        client.post('/announcements', announcementForm)
            .then(() => {
                alert('Announcement broadcasted successfully!');
                setAnnouncementForm({ title: '', message: '', target_role: 'all' });
                setActiveModal(null);
                fetchData();
            })
            .catch(err => {
                console.error(err);
                alert(err.response?.data?.message || 'Failed to send announcement');
            })
            .finally(() => setIsSubmitting(false));
    };

    if (loading && !data) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Activity size={48} color="var(--primary)" />
            </motion.div>
        </div>
    );

    if (!data) return <div>Error loading dashboard data.</div>;

    const { metrics, feedback, rankings, charts, insights } = data;

    const handleExport = () => {
        const rows = [
            ['Sonic Nebula', 'System Intelligence Report'],
            ['Generated At', new Date().toLocaleString()],
            [''],
            ['KEY METRICS'],
            ['Metric', 'Value'],
            ['Total Students', metrics.total_students],
            ['Total Teachers', metrics.total_teachers],
            ['Attendance Rate', `${metrics.attendance_rate}%`],
            ['Collection Rate', `${metrics.collection_rate}%`],
            [''],
            ['TOP PERFORMING CLASSES'],
            ['Class', 'Avg Score', 'Students'],
            ...rankings.top_classes.map(c => [c.name, c.avg_score, c.student_count]),
            [''],
            ['ELITE STUDENTS'],
            ['Name', 'GPA', 'Class'],
            ...rankings.best_students.map(s => [s.name, s.gpa, s.class]),
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `intelligence_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9'];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>OVERVIEW</div>
                    <h1 style={{ margin: 0 }}>System Intelligence</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LAST UPDATED</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            </header>

            <div className="overview-banner" style={{ marginBottom: '40px' }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '2.25rem', marginBottom: '16px', fontWeight: 800 }}>Global Performance Insight</h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.95, lineHeight: 1.6, marginBottom: '32px' }}>
                        Platform attendance is holding steady at <span style={{ fontWeight: 800 }}>{metrics.attendance_rate}%</span>.
                        We've identified {metrics.chronic_absenteeism} critical attendance alerts this week across the faculty network.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Button
                            onClick={() => navigate('/feedback')}
                            style={{ background: 'white', color: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                            <Activity size={18} />
                            View Real-time Logs
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}
                        >
                            Export Analytics
                        </Button>
                    </div>
                </div>
            </div>

            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {[
                    { label: 'Avg. Attendance', value: `${metrics.attendance_rate}%`, trend: '+2.1%', up: true, icon: <Activity size={20} />, color: '#4F46E5', bg: '#EEF2FF', path: '/attendance' },
                    { label: 'Collection Rate', value: `${metrics.collection_rate}%`, trend: '-0.4%', up: false, icon: <CreditCard size={20} />, color: '#10B981', bg: '#DCFCE7', path: '/financial' },
                    { label: 'Total Students', value: metrics.total_students, trend: '+12', up: true, icon: <GraduationCap size={20} />, color: '#F59E0B', bg: '#FEF3C7', path: '/students' },
                    { label: 'Active Alerts', value: metrics.chronic_absenteeism, trend: 'Critical', up: false, icon: <AlertTriangle size={20} />, color: '#EF4444', bg: '#FEE2E2', path: '/feedback' }
                ].map((stat, i) => (
                    <Card
                        key={i}
                        style={{ padding: '24px', cursor: 'pointer' }}
                        onClick={() => navigate(stat.path)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ background: stat.bg, color: stat.color, padding: '12px', borderRadius: '12px' }}>
                                {stat.icon}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: stat.up ? 'var(--success)' : 'var(--danger)' }}>
                                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                    </Card>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '40px' }}>
                {/* Attendance Trend Chart */}
                <Card style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Attendance Trends</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Daily system-wide attendance percentage</p>
                        </div>
                        <SelectField
                            value="Last 7 Days"
                            onChange={() => { }}
                            style={{ width: 'auto', padding: '8px 12px' }}
                        >
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </SelectField>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.attendance_trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    formatter={(value) => [`${value}%`, 'Attendance Rate']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="var(--primary)"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 3, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Attendance by Grade Bar Chart */}
                <Card style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '8px' }}>Grade Breakdown</h3>
                    <p style={{ margin: '0 0 24px 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Attendance rate by academic level</p>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.attendance_by_grade} layout="vertical" margin={{ left: -20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="grade" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => [`${value}%`, 'Rate']} />
                                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
                                    {charts.attendance_by_grade.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '40px' }}>
                {/* Registration Trend */}
                <Card style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '8px' }}>User Growth</h3>
                    <p style={{ margin: '0 0 24px 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>New registrations per month</p>
                    <div style={{ height: '240px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.registration_trend}>
                                <XAxis dataKey="month" hide />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card style={{ padding: '32px', background: 'linear-gradient(to right, #4F46E5, #0EA5E9)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
                        <div style={{ maxWidth: '60%' }}>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '16px' }}>Performance Optimizer</h3>
                            <p style={{ opacity: 0.9, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                                Grade 10-A is showing a <span style={{ fontWeight: 800 }}>14% higher</span> engagement rate than the school average.
                                Consider applying their Mathematics teaching module to other sections.
                            </p>
                            <Button style={{ background: 'white', color: 'var(--primary)', marginTop: '24px' }}>
                                View Full Intelligence Report
                            </Button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', opacity: 0.2 }}>
                            <TrendingUp size={120} strokeWidth={3} />
                        </div>
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                {/* Top Performing Classes */}
                <Card style={{ padding: '32px', cursor: 'pointer' }} onClick={() => navigate('/academy')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: '#EEF2FF', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                            <Award size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Top Classes</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {rankings.top_classes.map((cls, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-light)', width: '24px' }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{cls.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cls.student_count} Students</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--success)' }}>{Math.round(cls.avg_score)}%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Score</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Students */}
                <Card style={{ padding: '32px', cursor: 'pointer' }} onClick={() => navigate('/students')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: '#DCFCE7', color: 'var(--success)', padding: '8px', borderRadius: '8px' }}>
                            <Target size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Elite Performers</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {rankings.best_students.map((student, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Avatar name={student.name} size={32} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.class}</div>
                                </div>
                                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.125rem' }}>{student.gpa}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* System Insights */}
                <Card style={{ padding: '32px', background: 'var(--text-main)', color: 'white', cursor: 'pointer' }} onClick={() => navigate('/feedback')}>
                    <h3 style={{ color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Bell size={20} />
                        AI Insights
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {insights.length > 0 ? insights.map((insight, i) => (
                            <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <Badge style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', px: '6px', py: '2px', background: insight.severity === 'high' ? 'var(--danger)' : 'var(--warning)', borderRadius: '4px' }}>
                                        {insight.severity}
                                    </Badge>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(insight.created_at).toLocaleDateString()}</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4 }}>{insight.message}</div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', opacity: 0.6, padding: '40px 0' }}>
                                <Activity size={32} style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '0.875rem' }}>No critical insights currently detected. System is stable.</div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px', marginBottom: '40px' }}>
                <Card style={{ padding: 0, cursor: 'pointer' }} onClick={() => navigate('/feedback')}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Recent User Feedback</h3>
                        <Button variant="outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Review All</Button>
                    </div>
                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {feedback.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', gap: '20px', paddingBottom: i < feedback.length - 1 ? '24px' : 0, borderBottom: i < feedback.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                <Avatar name={msg.name} size={48} style={{ borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{msg.name} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>{msg.role}</span></div>
                                        <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 600 }}>{msg.time}</div>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.5 }}>{msg.msg}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0 }}>Quick Actions</h3>
                            <Button variant="outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => navigate('/settings')}>Configure</Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                            {[
                                {
                                    label: 'Register New Faculty',
                                    desc: 'Onboard new teachers or staff',
                                    icon: <Plus size={20} />,
                                    color: 'var(--primary)',
                                    action: () => setActiveModal('faculty')
                                },
                                {
                                    label: 'Broadcast Announcement',
                                    desc: 'Send school-wide notifications',
                                    icon: <Bell size={20} />,
                                    color: 'var(--warning)',
                                    action: () => setActiveModal('announcement')
                                },
                                {
                                    label: 'Financial Audit',
                                    desc: 'Review collection performance',
                                    icon: <CreditCard size={20} />,
                                    color: 'var(--success)',
                                    action: () => navigate('/financial')
                                },
                                {
                                    label: 'Academic Configuration',
                                    desc: 'Manage terms and grading',
                                    icon: <Calendar size={20} />,
                                    color: 'var(--secondary)',
                                    action: () => navigate('/academy')
                                }
                            ].map((action, i) => (
                                <Card
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        width: '100%',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border-color)'
                                    }}
                                    onClick={action.action}
                                >
                                    <div style={{
                                        color: action.color,
                                        background: 'white',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        {action.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>{action.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{action.desc}</div>
                                    </div>
                                    <ChevronRight size={16} style={{ opacity: 0.3 }} />
                                </Card>
                            ))}
                        </div>
                        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <MessageSquare size={18} color="var(--primary)" />
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>Need help? Use the AI Assistant</div>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>

            {/* Quick Action Modals */}
            <Modal
                isOpen={activeModal === 'faculty'}
                onClose={() => setActiveModal(null)}
                title="Register Faculty"
                width="500px"
            >
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9375rem' }}>Add a new teacher or administrative staff member to the system.</p>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleFacultySubmit}>
                    <FormField
                        label="FULL NAME"
                        placeholder="e.g. Dr. Jane Smith"
                        required
                        value={facultyForm.name}
                        onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })}
                    />
                    <FormField
                        label="EMAIL ADDRESS"
                        type="email"
                        placeholder="jane.smith@edugate.com"
                        required
                        value={facultyForm.email}
                        onChange={e => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    />
                    <SelectField
                        label="ROLE"
                        value={facultyForm.role}
                        onChange={e => setFacultyForm({ ...facultyForm, role: e.target.value })}
                    >
                        <option value="teacher">Teacher</option>
                        <option value="admin">Administrator</option>
                    </SelectField>
                    <Button type="submit" style={{ marginTop: '12px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Registering...' : 'Complete Onboarding'}
                    </Button>
                </form>
            </Modal>

            <Modal
                isOpen={activeModal === 'announcement'}
                onClose={() => setActiveModal(null)}
                title="Broadcast Announcement"
                width="500px"
            >
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9375rem' }}>Send an immediate notification to students, staff, or parents.</p>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleAnnouncementSubmit}>
                    <FormField
                        label="SUBJECT"
                        placeholder="e.g. Emergency Closure"
                        required
                        value={announcementForm.title}
                        onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    />
                    <SelectField
                        label="TARGET AUDIENCE"
                        value={announcementForm.target_role}
                        onChange={e => setAnnouncementForm({ ...announcementForm, target_role: e.target.value })}
                    >
                        <option value="all">Everyone</option>
                        <option value="teacher">Teachers Only</option>
                        <option value="student">Students & Parents</option>
                    </SelectField>
                    <TextareaField
                        label="MESSAGE"
                        rows={5}
                        placeholder="Type your message here..."
                        required
                        value={announcementForm.message}
                        onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    />
                    <Button type="submit" style={{ marginTop: '12px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Broadcast'}
                    </Button>
                </form>
            </Modal>
        </motion.div>
    );
};

export default AdminDashboard;
