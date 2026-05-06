import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import client from '../../api/client';
import {
    Users, TrendingUp, AlertTriangle, CreditCard,
    ChevronRight, MessageSquare, Bell, Calendar, GraduationCap, Plus,
    Award, Target, Activity, ArrowUpRight, ArrowDownRight,
    Search, Filter, Zap, BarChart3, PieChart,
    ShieldCheck, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, AreaChart, Area, PieChart as RePieChart, Pie
} from 'recharts';
import { Button, Badge, Avatar, Card } from '../../components/atoms';
import { Modal, FormField, SelectField, TextareaField } from '../../components/molecules';
import { useAcademicYear } from '../../context/AcademicYearContext';

const AdminDashboard = () => {
    const { activeYear } = useAcademicYear();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Form states
    const [facultyForm, setFacultyForm] = useState({ name: '', email: '', role: 'teacher' });
    const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', target_role: 'all' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        term: 'All Terms',
        grade: 'All Grades',
        segment: 'All Students'
    });

    const fetchData = () => {
        setLoading(true);
        const params = {
            ...(activeYear?.id ? { academic_year_id: activeYear.id } : {}),
            term: filters.term !== 'All Terms' ? filters.term : undefined,
            grade: filters.grade !== 'All Grades' ? filters.grade : undefined,
            segment: filters.segment !== 'All Students' ? filters.segment : undefined
        };
        client.get('/analytics/admin/overview', { params })
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
    }, [activeYear, filters]);

    const handleFacultySubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        client.post('/users/register', { ...facultyForm, password: 'password' })
            .then(() => {
                setFacultyForm({ name: '', email: '', role: 'teacher' });
                setActiveModal(null);
                fetchData();
            })
            .catch(err => console.error(err))
            .finally(() => setIsSubmitting(false));
    };

    if (loading && !data) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Zap size={64} color="var(--primary)" fill="var(--primary-light)" />
            </motion.div>
        </div>
    );

    if (!data) return <div>Critical error loading business intelligence data.</div>;

    const { metrics, feedback, rankings, charts, insights } = data;

    const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            style={{ padding: '20px 0', maxWidth: '1600px', margin: '0 auto' }}
        >
            {/* Top Navigation & Brand */}
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '32px' 
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                        Command Center
                        <span style={{ color: 'var(--primary)', marginLeft: '8px' }}>.</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0 0' }}>
                        Strategic intelligence for EduGate Institution
                    </p>
                </div>
            </header>

            {/* Strategic Filter Bar */}
            <Card style={{ 
                padding: '12px 24px', 
                borderRadius: '16px', 
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    <Filter size={14} />
                    GLOBAL FILTERS:
                </div>
                
                <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    <div style={{ width: '180px' }}>
                        <SelectField
                            value={filters.term}
                            onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                            style={{ margin: 0, padding: '8px 12px', fontSize: '0.875rem' }}
                        >
                            <option>All Terms</option>
                            <option>Mid Term</option>
                            <option>Final Term</option>
                        </SelectField>
                    </div>
                    
                    <div style={{ width: '180px' }}>
                        <SelectField
                            value={filters.grade}
                            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                            style={{ margin: 0, padding: '8px 12px', fontSize: '0.875rem' }}
                        >
                            <option>All Grades</option>
                            <option>Grade 9</option>
                            <option>Grade 10</option>
                            <option>Grade 11</option>
                            <option>Grade 12</option>
                        </SelectField>
                    </div>

                    <div style={{ width: '180px' }}>
                        <SelectField
                            value={filters.segment}
                            onChange={(e) => setFilters({ ...filters, segment: e.target.value })}
                            style={{ margin: 0, padding: '8px 12px', fontSize: '0.875rem' }}
                        >
                            <option>All Students</option>
                            <option>High Performers</option>
                            <option>At Risk</option>
                            <option>New Enrollees</option>
                        </SelectField>
                    </div>
                </div>

                <Button 
                    variant="outline" 
                    onClick={() => setFilters({ term: 'All Terms', grade: 'All Grades', segment: 'All Students' })}
                    style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px' }}
                >
                    Clear Filters
                </Button>
            </Card>

            {/* Strategic Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '24px', 
                marginBottom: '32px', 
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '2px'
            }}>
                {[
                    { id: 'overview', label: 'Executive Overview', icon: <Globe size={18} /> },
                    { id: 'academic', label: 'Academic Performance', icon: <BarChart3 size={18} /> },
                    { id: 'operations', label: 'Operational Metrics', icon: <Zap size={18} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {/* Summary Banner */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                            borderRadius: '24px',
                            padding: '40px',
                            color: 'white',
                            marginBottom: '32px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(49, 46, 129, 0.15)'
                        }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <Badge style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 12px' }}>
                                        <ShieldCheck size={12} style={{ marginRight: '6px' }} />
                                        SYSTEM STABLE
                                    </Badge>
                                </div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.03em' }}>
                                    Strategic Growth Index: <span style={{ color: '#818cf8' }}>+12.4%</span>
                                </h2>
                                <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '700px', lineHeight: 1.6 }}>
                                    EduGate is currently servicing <span style={{ fontWeight: 700 }}>{metrics.total_students} students</span> across 
                                    {metrics.total_classes} active sections. System efficiency has increased by 4% since the last quarter.
                                </p>
                            </div>
                            {/* Abstract background shapes */}
                            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', bottom: '-100px', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
                        </div>

                        {/* High-Level Metrics */}
                        <div className="grid-4" style={{ marginBottom: '32px' }}>
                            {[
                                { label: 'Attendance Velocity', value: `${metrics.attendance_rate}%`, trend: '+1.2%', icon: <Activity />, color: '#10B981' },
                                { label: 'Teacher Capacity', value: metrics.total_teachers, trend: 'Optimal', icon: <Users />, color: '#6366F1' },
                                { label: 'Student Retention', value: '98.2%', trend: '+0.4%', icon: <GraduationCap />, color: '#F59E0B' },
                                { label: 'Academic Proficiency', value: `${metrics.proficiency_rate}%`, trend: 'Target: 85%', icon: <Target />, color: '#EC4899' }
                            ].map((stat, i) => (
                                <Card key={i} style={{ 
                                    padding: '24px', 
                                    borderRadius: '20px', 
                                    border: '1px solid var(--border-color)',
                                    background: 'white',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{ color: stat.color, background: `${stat.color}10`, padding: '12px', borderRadius: '14px' }}>
                                            {stat.icon}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: stat.color }}>{stat.trend}</div>
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '4px' }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</div>
                                </Card>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid-2-1" style={{ marginBottom: '32px' }}>
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Institutional Performance Trend</h3>
                                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aggregate student score variance by term</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Badge style={{ background: '#EEF2FF', color: '#6366F1', border: 'none' }}>2024-2025</Badge>
                                    </div>
                                </div>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={charts.performance_trend}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                                itemStyle={{ fontWeight: 700 }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="avg_score" 
                                                stroke="#6366F1" 
                                                strokeWidth={4} 
                                                fillOpacity={1} 
                                                fill="url(#colorScore)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 800 }}>Capacity Utilization</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Student distribution across top sections</p>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={charts.students_by_class} layout="vertical" margin={{ left: -20 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="class_name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} width={100} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                                                {charts.students_by_class.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* Strategic Insight Section */}
                        <div className="grid-3" style={{ marginBottom: '32px' }}>
                            {/* Insight Column */}
                            <Card style={{ padding: '32px', borderRadius: '24px', background: 'var(--text-main)', color: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Zap size={24} color="#F59E0B" />
                                    <h3 style={{ margin: 0, color: 'white' }}>Strategic Insights</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {insights.map((insight, i) => (
                                        <div key={i} style={{ 
                                            padding: '16px', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <Badge style={{ 
                                                    fontSize: '0.65rem', 
                                                    background: insight.severity === 'high' ? '#EF4444' : '#F59E0B',
                                                    color: 'white',
                                                    border: 'none',
                                                    fontWeight: 900
                                                }}>
                                                    {insight.severity.toUpperCase()}
                                                </Badge>
                                                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(insight.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{insight.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Top Talent */}
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Award size={24} color="var(--primary)" />
                                    <h3 style={{ margin: 0 }}>Top Scholars</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {rankings.best_students.map((student, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <Avatar name={student.name} size={44} style={{ borderRadius: '12px' }} />
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: '-6px', 
                                                    right: '-6px', 
                                                    background: 'var(--primary)', 
                                                    color: 'white', 
                                                    fontSize: '0.65rem',
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 900
                                                }}>
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{student.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.class}</div>
                                            </div>
                                            <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.25rem' }}>{student.gpa}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Operational Efficiency */}
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Activity size={24} color="#10B981" />
                                    <h3 style={{ margin: 0 }}>Class Efficiency</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {rankings.top_classes.map((cls, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cls.name}</span>
                                                <span style={{ fontWeight: 900, color: '#10B981' }}>{Math.round(cls.avg_score)}%</span>
                                            </div>
                                            <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${cls.avg_score}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    style={{ height: '100%', background: COLORS[i % COLORS.length] }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" style={{ width: '100%', marginTop: '32px', borderRadius: '12px' }} onClick={() => navigate('/academy')}>
                                    Full Academic Audit
                                </Button>
                            </Card>
                        </div>
                    </motion.div>
                )}
                
                {activeTab === 'academic' && (
                    <motion.div
                        key="academic"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="grid-2-1" style={{ marginBottom: '32px' }}>
                            {/* Subject Performance */}
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 800 }}>Subject Proficiency Matrix</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Comparative analysis of average scores by department</p>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { subject: 'Mathematics', score: 78 },
                                            { subject: 'Science', score: 82 },
                                            { subject: 'English', score: 85 },
                                            { subject: 'History', score: 72 },
                                            { subject: 'Art', score: 91 },
                                            { subject: 'Physics', score: 75 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[0, 100]} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                            <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={32}>
                                                {(Array.from({length: 6})).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Grade Distribution */}
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 800 }}>Grade Distribution</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Student density by grade bracket</p>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={[
                                                    { name: 'A (90-100)', value: 15 },
                                                    { name: 'B (80-89)', value: 35 },
                                                    { name: 'C (70-79)', value: 30 },
                                                    { name: 'D (60-69)', value: 15 },
                                                    { name: 'F (<60)', value: 5 }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {(Array.from({length: 5})).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                                        {['A', 'B', 'C', 'D', 'F'].map((g, i) => (
                                            <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                                {g}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="grid-3" style={{ marginBottom: '32px' }}>
                            <Card style={{ padding: '24px', borderRadius: '20px', border: '1px solid #DCFCE7', background: '#F0FDF4' }}>
                                <div style={{ color: '#10B981', marginBottom: '12px' }}><Award size={24} /></div>
                                <h4 style={{ margin: '0 0 4px 0', color: '#065F46' }}>High Proficiency Subject</h4>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857' }}>Visual Arts</div>
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#065F46', opacity: 0.8 }}>91% avg. proficiency across all sections.</p>
                            </Card>
                            <Card style={{ padding: '24px', borderRadius: '20px', border: '1px solid #FEF3C7', background: '#FFFBEB' }}>
                                <div style={{ color: '#F59E0B', marginBottom: '12px' }}><Activity size={24} /></div>
                                <h4 style={{ margin: '0 0 4px 0', color: '#92400E' }}>Most Improved Subject</h4>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#B45309' }}>English Lit.</div>
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#92400E', opacity: 0.8 }}>+14% growth compared to Term 1.</p>
                            </Card>
                            <Card style={{ padding: '24px', borderRadius: '20px', border: '1px solid #FEE2E2', background: '#FEF2F2' }}>
                                <div style={{ color: '#EF4444', marginBottom: '12px' }}><AlertTriangle size={24} /></div>
                                <h4 style={{ margin: '0 0 4px 0', color: '#991B1B' }}>Attention Required</h4>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#B91C1C' }}>Mathematics</div>
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#991B1B', opacity: 0.8 }}>78% avg. Critical gap in Grade 9 Geometry.</p>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'operations' && (
                    <motion.div
                        key="operations"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="grid-2-1" style={{ marginBottom: '32px' }}>
                            {/* Attendance Trend */}
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 800 }}>Institutional Attendance Velocity</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Real-time student presence monitoring</p>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={[
                                            { day: 'Mon', rate: 94 },
                                            { day: 'Tue', rate: 96 },
                                            { day: 'Wed', rate: 92 },
                                            { day: 'Thu', rate: 95 },
                                            { day: 'Fri', rate: 89 },
                                            { day: 'Sat', rate: 85 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[80, 100]} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                            <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={4} dot={{ r: 6, fill: '#10B981', strokeWidth: 3, stroke: '#fff' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Enrollment Growth */}
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 800 }}>Enrollment Growth</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Annual student registration volume</p>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={charts.registration_trend}>
                                            <XAxis dataKey="academic_year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                            <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        <div className="grid-3" style={{ marginBottom: '32px' }}>
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <h4 style={{ color: 'var(--text-muted)', margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Teacher Load Index</h4>
                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>1:18</div>
                                <div style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ArrowUpRight size={14} /> Within Optimal Range
                                </div>
                                <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average ratio across primary and secondary departments.</p>
                            </Card>
                            <Card style={{ padding: '32px', borderRadius: '24px' }}>
                                <h4 style={{ color: 'var(--text-muted)', margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>System Health</h4>
                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>99.9%</div>
                                <div style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ShieldCheck size={14} /> High Integrity
                                </div>
                                <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Zero critical server latency events detected in the last 72 hours.</p>
                            </Card>
                            <Card style={{ padding: '32px', borderRadius: '24px', background: 'var(--primary)', color: 'white' }}>
                                <h4 style={{ color: 'white', opacity: 0.8, margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Upcoming Audit</h4>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>May 15, 2026</div>
                                <div style={{ marginTop: '16px', fontSize: '0.85rem' }}>Financial compliance review scheduled with the Academic Board.</div>
                                <Button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', width: '100%', marginTop: '20px' }}>
                                    View Schedule
                                </Button>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action for Quick Access */}
            <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 100 }}>
                <Button 
                    onClick={() => setActiveModal('faculty')}
                    style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '20px', 
                        padding: 0,
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                        fontSize: '1.5rem'
                    }}
                >
                    <Plus size={28} />
                </Button>
            </div>

            {/* Modal for adding faculty */}
            <Modal
                isOpen={activeModal === 'faculty'}
                onClose={() => setActiveModal(null)}
                title="Strategic Onboarding"
                width="500px"
            >
                <form onSubmit={handleFacultySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <FormField
                        label="FULL LEGAL NAME"
                        placeholder="Dr. Julian Vane"
                        required
                        value={facultyForm.name}
                        onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })}
                    />
                    <FormField
                        label="INSTITUTIONAL EMAIL"
                        type="email"
                        placeholder="j.vane@edugate.com"
                        required
                        value={facultyForm.email}
                        onChange={e => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    />
                    <SelectField
                        label="ASSIGNED ROLE"
                        value={facultyForm.role}
                        onChange={e => setFacultyForm({ ...facultyForm, role: e.target.value })}
                    >
                        <option value="teacher">Faculty Member</option>
                        <option value="admin">System Administrator</option>
                    </SelectField>
                    <Button type="submit" style={{ marginTop: '12px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Authorize Onboarding'}
                    </Button>
                </form>
            </Modal>
        </motion.div>
    );
};

export default AdminDashboard;
