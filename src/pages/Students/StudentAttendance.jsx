import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    BarChart3,
    PieChart as PieChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useStudentDashboard, useAuth } from '../../hooks';
import { Card, Badge, Button, Avatar } from '../../components/atoms';
import { Modal } from '../../components/molecules';

const StudentAttendance = () => {
    const { data, loading, error } = useStudentDashboard();
    const { user } = useAuth();
    const [viewDate, setViewDate] = useState(new Date());
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    const attendance_trend = data?.attendance_trend || [];
    const metrics = data?.metrics || {};

    // Professional Stats Logic
    const stats = useMemo(() => {
        const total = attendance_trend.length;
        const present = attendance_trend.filter(r => r.status === 'present').length;
        const absent = attendance_trend.filter(r => r.status === 'absent').length;
        const late = attendance_trend.filter(r => r.status === 'late').length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        // Group by month for chart
        const months = {};
        attendance_trend.forEach(r => {
            const date = new Date(r.date);
            const key = date.toLocaleString('default', { month: 'short' });
            if (!months[key]) months[key] = { month: key, present: 0, absent: 0 };
            if (r.status === 'present') months[key].present++;
            else months[key].absent++;
        });

        const chartData = Object.values(months)
            .sort((a, b) => {
                const months_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return months_order.indexOf(a.month) - months_order.indexOf(b.month);
            })
            .slice(-6);

        const pieData = [
            { name: 'Present', value: present, color: '#10B981' },
            { name: 'Absent', value: absent, color: '#EF4444' },
            { name: 'Late', value: late, color: '#F59E0B' }
        ].filter(d => d.value > 0);

        return { total, present, absent, late, rate, chartData, pieData };
    }, [attendance_trend]);

    // Calendar logic memoized as well
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const record = attendance_trend.find(r => r?.date?.startsWith(dateStr));
            days.push({ day: i, record });
        }
        return days;
    }, [viewDate, attendance_trend]);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '24px' }}
            >
                <CalendarIcon size={48} color="var(--primary)" />
            </motion.div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.25rem' }}>Analyzing attendance matrix...</div>
        </div>
    );

    if (error) return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
            <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontWeight: 800 }}>Sync Failed</h2>
            <p style={{ color: 'var(--text-muted)' }}>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>Retry</Button>
        </div>
    );

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[viewDate.getMonth()];
    const year = viewDate.getFullYear();

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '80px' }}
        >
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '16px', fontWeight: 800 }}>ATTENDANCE ANALYTICS</Badge>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-0.04em' }}>Performance <span style={{ color: 'var(--primary)' }}>Insights</span></h1>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Button
                        variant="primary"
                        icon={BarChart3}
                        onClick={() => setIsAnalysisOpen(true)}
                        style={{ borderRadius: '14px' }}
                    >
                        Deep Analysis
                    </Button>
                </div>
            </header>

            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {[
                    { label: 'Attendance Rate', value: `${stats.rate}%`, icon: TrendingUp, color: '#10B981', trend: '+2.4%' },
                    { label: 'Total Present', value: stats.present, icon: CheckCircle2, color: '#4F46E5', trend: 'Stable' },
                    { label: 'Total Absences', value: stats.absent, icon: XCircle, color: '#EF4444', trend: '-15%' },
                    { label: 'Late Registry', value: stats.late, icon: Clock, color: '#F59E0B', trend: 'None' }
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Card style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ background: `${stat.color}15`, padding: '12px', borderRadius: '14px' }}>
                                    <stat.icon size={24} color={stat.color} />
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: stat.trend.startsWith('+') ? '#10B981' : stat.trend.startsWith('-') ? '#EF4444' : 'var(--text-muted)' }}>
                                    {stat.trend}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }}>
                                <stat.icon size={80} color={stat.color} />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '40px' }}>
                {/* Main Trend Chart */}
                <motion.div variants={itemVariants}>
                    <Card style={{ padding: '32px', borderRadius: '32px', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Attendance Velocity</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monthly participation comparison</p>
                            </div>
                            <select style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600 }}>
                                <option>Last 6 Months</option>
                                <option>This Year</option>
                            </select>
                        </div>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData}>
                                    <defs>
                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                        itemStyle={{ fontWeight: 800 }}
                                    />
                                    <Area type="monotone" dataKey="present" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                                    <Area type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* Breakdown Pie Chart */}
                <motion.div variants={itemVariants}>
                    <Card style={{ padding: '32px', borderRadius: '32px', height: '100%', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 800 }}>Status Distribution</h3>
                        <p style={{ margin: '0 0 32px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total session breakdown</p>
                        <div style={{ height: '250px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.total}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sessions</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
                            {stats.pieData.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 800 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
                {/* Advanced Calendar View */}
                <motion.div variants={itemVariants}>
                    <Card style={{ padding: '0', borderRadius: '32px', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 32px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CalendarIcon color="var(--primary)" size={20} />
                                <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{monthName} {year}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={prevMonth} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer' }}><ChevronLeft size={18} /></button>
                                <button onClick={nextMonth} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer' }}><ChevronRight size={18} /></button>
                            </div>
                        </div>
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{d.toUpperCase()}</div>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                                {calendarDays.map((d, i) => {
                                    if (!d) return <div key={i} style={{ height: '100px' }} />;
                                    const { record } = d;
                                    const isToday = new Date().toDateString() === new Date(year, viewDate.getMonth(), d.day).toDateString();
                                    const isPresent = record?.status === 'present';
                                    const isAbsent = record?.status === 'absent';

                                    return (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            style={{
                                                height: '100px',
                                                borderRadius: '24px',
                                                background: isPresent ? '#F0FDF4' : isAbsent ? '#FEF2F2' : 'var(--bg-main)',
                                                border: isToday ? '2px solid var(--primary)' : `1.5px solid ${isPresent ? '#BBF7D0' : isAbsent ? '#FECACA' : 'transparent'}`,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                boxShadow: isToday ? '0 0 20px rgba(79, 70, 229, 0.15)' : 'none'
                                            }}
                                        >
                                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: isToday ? 'var(--primary)' : 'var(--text-main)' }}>{d.day}</div>
                                            {record && (
                                                <div style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '8px',
                                                    background: isPresent ? 'var(--success)' : '#EF4444',
                                                    color: 'white',
                                                    fontSize: '0.6rem',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {record.status}
                                                </div>
                                            )}
                                            {isToday && (
                                                <div style={{ position: 'absolute', top: '10px', fontSize: '0.5rem', fontWeight: 900, color: 'var(--primary)' }}>TODAY</div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Side Info Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <motion.div variants={itemVariants}>
                        <Card style={{ padding: '32px', background: 'linear-gradient(135deg, var(--primary) 0%, #4338CA 100%)', color: 'white', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                    <TrendingUp size={24} />
                                </div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 700, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance Health</h4>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                                    {stats.rate >= 90 ? 'EXCELLENT' : stats.rate >= 75 ? 'GOOD' : 'CRITICAL'}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontWeight: 500 }}>
                                    Your current participation rate of <b style={{ color: 'white' }}>{stats.rate}%</b> is {stats.rate >= 80 ? 'well above' : 'below'} the institutional benchmark. Maintaining this momentum ensures full academic eligibility.
                                </p>

                                <div style={{ marginTop: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', opacity: 0.8 }}>
                                        <span>ACADEMIC YEAR GOAL</span>
                                        <span>{stats.rate}% / 100%</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.rate}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            style={{ height: '100%', background: 'white', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
                                <TrendingUp size={160} />
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card style={{ padding: '32px', borderRadius: '32px' }}>
                            <h4 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 800 }}>Recent Activity</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {attendance_trend.slice(0, 4).map((act, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: act.status === 'present' ? '#F0FDF4' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {act.status === 'present' ? <CheckCircle2 size={18} color="#10B981" /> : <XCircle size={18} color="#EF4444" />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{act.status === 'present' ? 'Late Registration' : 'Unexcused Absence'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(act.date).toLocaleDateString()} • {act.subject || 'Core Class'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
            {/* Deep Analysis Modal */}
            <Modal
                isOpen={isAnalysisOpen}
                onClose={() => setIsAnalysisOpen(false)}
                title="Deep Academic Correlation"
                width="850px"
            >
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Our AI models have correlated your attendance patterns with your academic performance across major subjects.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '24px' }}>Subject Performance Gap</h4>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                    { subject: 'Math', A: 95, B: 80, fullMark: 100 },
                                    { subject: 'Science', A: 98, B: 70, fullMark: 100 },
                                    { subject: 'English', A: 85, B: 85, fullMark: 100 },
                                    { subject: 'History', A: 80, B: 90, fullMark: 100 },
                                    { subject: 'Arts', A: 90, B: 75, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 700 }} />
                                    <Radar name="Attendance" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                                    <Radar name="GPA" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <Card style={{ padding: '24px', background: 'var(--bg-main)', border: 'none' }}>
                            <h5 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 800 }}>Consistency Score</h5>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>92.4</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>/ 100</span>
                            </div>
                            <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                You are in the top 5% of students for early morning class participation.
                            </p>
                        </Card>

                        <div>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 800 }}>Attendance vs Grades</h5>
                            <div style={{ height: '140px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Mon', gap: 2 },
                                        { name: 'Tue', gap: 5 },
                                        { name: 'Wed', gap: 3 },
                                        { name: 'Thu', gap: 8 },
                                        { name: 'Fri', gap: 4 },
                                    ]}>
                                        <XAxis dataKey="name" hide />
                                        <Tooltip labelStyle={{ display: 'none' }} />
                                        <Bar dataKey="gap" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                                Positive correlation detected on Thursday morning sessions.
                            </p>
                        </div>
                    </div>
                </div>


            </Modal>
        </motion.div>
    );
};

export default StudentAttendance;
