import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion } from 'framer-motion';
import {
    Users, TrendingUp, Target,
    Award, AlertCircle, BarChart2,
    CheckCircle, XCircle, Clock
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, RadarChart,
    PolarGrid, PolarAngleAxis, Radar, Cell,
    LineChart, Line, PieChart, Pie
} from 'recharts';
import { useAuth } from '../../hooks';
import { Badge, Avatar, Card, ProgressBar } from '../../components/atoms';

const MyChildren = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [childData, setChildData] = useState(null);
    const [homeworks, setHomeworks] = useState([]);
    const [childrenMetrics, setChildrenMetrics] = useState({});
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
            Promise.all([
                client.get(`/analytics/parent/overview?student_id=${selectedChild.id}`),
                client.get(`/parent/homework?student_id=${selectedChild.id}`)
            ])
                .then(([analyticsRes, hwRes]) => {
                    setChildData(analyticsRes.data);
                    setHomeworks(hwRes.data || []);
                })
                .catch(err => console.error('Data sync failed:', err))
                .finally(() => setChildLoading(false));
        }
    }, [selectedChild]);

    useEffect(() => {
        if (children.length > 0) {
            children.forEach(child => {
                if (!childrenMetrics[child.id]) {
                    client.get(`/analytics/parent/overview?student_id=${child.id}`)
                        .then(res => setChildrenMetrics(prev => ({ ...prev, [child.id]: res.data.metrics })))
                        .catch(err => console.error(err));
                }
            });
        }
    }, [children]);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                <Users size={64} color="var(--primary)" />
            </motion.div>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Preparing academic profiles...</div>
        </div>
    );

    if (children.length === 0) return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-main)', fontWeight: 800 }}>No Profiles Linked</h3>
            <p style={{ color: 'var(--text-muted)' }}>You don't have any children profiles linked to your account.</p>
        </div>
    );

    // ─── Data processors ─────────────────────────────────────────────────────

    const standardTerms = ['Test 1', 'Test 2', 'Exam 1', 'Test 3', 'Exam 2'];

    const getSubjectStats = () => {
        if (!childData?.current_student?.grades) return [];
        const subjects = {};
        childData.current_student.grades.forEach(g => {
            if (!standardTerms.includes(g.term)) return;
            const name = g.subject?.name || 'Unknown';
            if (!subjects[name]) subjects[name] = { name, total: 0, count: 0 };
            subjects[name].total += parseFloat(g.score);
            subjects[name].count += 1;
        });
        return Object.values(subjects).map(s => ({
            name: s.name,
            score: Math.round(s.total / s.count),
            fullMark: 100
        })).sort((a, b) => b.score - a.score);
    };

    const getTrendData = () => {
        if (!childData?.current_student?.grades) return [];
        const termMap = {};
        childData.current_student.grades.forEach(g => {
            if (!standardTerms.includes(g.term)) return;
            if (!termMap[g.term]) termMap[g.term] = { total: 0, count: 0 };
            termMap[g.term].total += parseFloat(g.score);
            termMap[g.term].count += 1;
        });
        return standardTerms
            .filter(t => termMap[t])
            .map(t => ({ term: t, average: Math.round(termMap[t].total / termMap[t].count) }));
    };

    // Status lives in submissions[0].status, not top-level
    const getHomeworkStats = () => {
        if (!homeworks.length) return { submitted: 0, late: 0, missing: 0, total: 0 };
        let submitted = 0, late = 0, missing = 0;
        homeworks.forEach(hw => {
            const status = hw.submissions?.[0]?.status;
            if (!status) {
                missing += 1;
            } else if (status === 'graded' || status === 'submitted') {
                submitted += 1;
            } else if (status === 'late') {
                late += 1;
            } else {
                missing += 1;
            }
        });
        return { submitted, late, missing, total: homeworks.length };
    };

    const termWeights = { 'Test 1': 0.10, 'Test 2': 0.10, 'Exam 1': 0.30, 'Test 3': 0.10, 'Exam 2': 0.40 };

    const getPredictions = () => {
        if (!childData?.current_student?.grades) return [];
        const subjects = {};
        childData.current_student.grades.forEach(g => {
            if (!termWeights[g.term]) return;
            const name = g.subject?.name || 'Unknown';
            if (!subjects[name]) subjects[name] = { scores: {}, name };
            subjects[name].scores[g.term] = parseFloat(g.score);
        });
        return Object.values(subjects).map(s => {
            const completedTerms = Object.keys(s.scores);
            const completedWeight = completedTerms.reduce((sum, t) => sum + termWeights[t], 0);
            const earnedScore = completedTerms.reduce((sum, t) => sum + s.scores[t] * termWeights[t], 0);
            const currentAvg = completedWeight > 0 ? earnedScore / completedWeight : 0;
            const predicted = Math.min(100, Math.round(earnedScore + currentAvg * (1 - completedWeight)));
            return { name: s.name, predicted, progress: Math.round(completedWeight * 100) };
        }).sort((a, b) => b.predicted - a.predicted);
    };

const subjectStats = getSubjectStats();
console.log('subjectStats:', subjectStats);
console.log('grades raw:', childData?.current_student?.grades);
    const trendData = getTrendData();
    const hwStats = getHomeworkStats();
    const predictions = getPredictions();
    const strengths = subjectStats.filter(s => s.score >= 80);
    const weaknesses = subjectStats.filter(s => s.score < 60);

    const hwPieData = [
        { name: 'Submitted', value: hwStats.submitted, color: '#10B981' },
        { name: 'Late', value: hwStats.late, color: '#F59E0B' },
        { name: 'Missing', value: hwStats.missing, color: '#EF4444' },
    ].filter(d => d.value > 0);

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.15 } }
    };
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20 } }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) return (
            <div style={{ background: 'white', padding: '14px 18px', borderRadius: '14px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--primary)' }}>{payload[0].value}%</div>
            </div>
        );
        return null;
    };

    const EmptyState = ({ icon: Icon, message }) => (
        <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', borderRadius: '16px', border: '2px dashed var(--border-color)' }}>
            <Icon size={40} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '0 20px' }}>{message}</p>
        </div>
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ paddingBottom: '60px' }}>

            {/* Student Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', background: 'white', padding: '12px 32px', borderRadius: '40px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontWeight: 900, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Viewing Profile:</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {children.map(child => (
                            <button key={child.id} onClick={() => setSelectedChild(child)} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '8px 20px', borderRadius: '30px', border: 'none', cursor: 'pointer',
                                background: selectedChild?.id === child.id ? 'var(--primary)' : 'rgba(79, 70, 229, 0.05)',
                                color: selectedChild?.id === child.id ? 'white' : 'var(--primary)',
                                fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.2s'
                            }}>
                                <Avatar name={child.user.name} size={24} />
                                {child.user.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
                <Badge bg="var(--bg-main)" color="var(--text-muted)" style={{ fontWeight: 800 }}>Family Hub</Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em' }}>Performance <span style={{ color: 'var(--primary)' }}>Center</span></h1>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem' }}>Tracking academic growth for {selectedChild?.user.name}.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Last Updated</div>
                    <div style={{ fontWeight: 800 }}>{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                    {/* Subject Bar Chart */}
                    <motion.div variants={cardVariants}>
                        <Card style={{ padding: '40px', borderRadius: '32px', minHeight: '480px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Subject Performance Score</h2>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Comparative analysis across curriculum domains.</p>
                                </div>
                                <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontSize: '0.8rem', fontWeight: 800, padding: '8px 16px' }}>
                                    {childLoading ? 'SYNCHRONIZING...' : 'CURRENT TERM'}
                                </Badge>
                            </div>
                            {subjectStats.length > 0 ? (
                                <div style={{ height: '320px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={subjectStats}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }} dy={10} />
                                            <YAxis domain={[0, 100]} hide />
                                            <Tooltip cursor={{ fill: 'rgba(79,70,229,0.05)' }} content={<CustomTooltip />} />
                                            <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={44}>
                                                {subjectStats.map((entry, i) => (
                                                    <Cell key={i} fill={entry.score < 50 ? 'var(--danger)' : entry.score > 80 ? 'var(--success)' : 'var(--primary)'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : <EmptyState icon={BarChart2} message={childLoading ? 'Loading...' : 'No performance data recorded for this term.'} />}
                        </Card>
                    </motion.div>

                    {/* Trend Line */}
                    <motion.div variants={cardVariants}>
                        <Card style={{ padding: '40px', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Performance Trend</h2>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Average score progression across all assessments this term.</p>
                                </div>
                                <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px' }}>
                                    <TrendingUp size={22} color="var(--primary)" />
                                </div>
                            </div>
                            {trendData.length > 1 ? (
                                <div style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }} dy={10} />
                                            <YAxis domain={[0, 100]} hide />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="average" stroke="var(--primary)" strokeWidth={3}
                                                dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : <EmptyState icon={TrendingUp} message={childLoading ? 'Loading...' : 'Not enough data points yet to show a trend.'} />}
                        </Card>
                    </motion.div>

                    {/* Radar + Homework */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* Radar */}
                        <motion.div variants={cardVariants}>
                            <Card style={{ padding: '32px', borderRadius: '28px', height: '100%' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 900 }}>Subject Balance</h3>
                                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', margin: '0 0 24px 0' }}>Skill spread across all domains.</p>
                                {subjectStats.length >= 3 ? (
                                    <div style={{ height: '260px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={subjectStats}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }} />
                                                <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.18} strokeWidth={2} />
                                                <Tooltip content={({ active, payload }) => {
                                                    if (active && payload?.length) return (
                                                        <div style={{ background: 'white', padding: '10px 14px', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', fontWeight: 800 }}>
                                                            {payload[0].payload.name}: <span style={{ color: 'var(--primary)' }}>{payload[0].value}%</span>
                                                        </div>
                                                    );
                                                    return null;
                                                }} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : <EmptyState icon={Target} message={childLoading ? 'Loading...' : 'Need grades in 3+ subjects to render radar.'} />}
                            </Card>
                        </motion.div>

                        {/* Homework Donut */}
                        <motion.div variants={cardVariants}>
                            <Card style={{ padding: '32px', borderRadius: '28px', height: '100%' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 900 }}>Homework Completion</h3>
                                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', margin: '0 0 24px 0' }}>Submission breakdown this term.</p>
                                {hwStats.total > 0 ? (
                                    <>
                                        <div style={{ height: '180px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={hwPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                                        {hwPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                                    </Pie>
                                                    <Tooltip content={({ active, payload }) => {
                                                        if (active && payload?.length) return (
                                                            <div style={{ background: 'white', padding: '10px 14px', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', fontWeight: 800 }}>
                                                                {payload[0].name}: <span style={{ color: payload[0].payload.color }}>{payload[0].value}</span>
                                                            </div>
                                                        );
                                                        return null;
                                                    }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                                            {[
                                                { label: 'Submitted', value: hwStats.submitted, color: '#10B981', icon: <CheckCircle size={14} /> },
                                                { label: 'Late', value: hwStats.late, color: '#F59E0B', icon: <Clock size={14} /> },
                                                { label: 'Missing', value: hwStats.missing, color: '#EF4444', icon: <XCircle size={14} /> },
                                            ].map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: item.color, fontWeight: 700, fontSize: '0.875rem' }}>
                                                        {item.icon} {item.label}
                                                    </div>
                                                    <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>
                                                        {item.value} <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>/ {hwStats.total}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : <EmptyState icon={Award} message={childLoading ? 'Loading...' : 'No homework data available.'} />}
                            </Card>
                        </motion.div>
                    </div>

                    {/* Predicted Final Grades */}
                    <motion.div variants={cardVariants}>
                        <Card style={{ padding: '40px', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Predicted Final Grades</h2>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Projected end-of-term score based on current performance.</p>
                                </div>
                                <Badge bg="#FEF3C7" color="#D97706" style={{ fontWeight: 800, fontSize: '0.75rem', padding: '8px 14px' }}>PROJECTION</Badge>
                            </div>
                            {predictions.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {predictions.map((p, i) => {
                                        const color = p.predicted >= 80 ? 'var(--success)' : p.predicted >= 60 ? 'var(--primary)' : 'var(--danger)';
                                        const bgColor = p.predicted >= 80 ? '#DCFCE7' : p.predicted >= 60 ? 'var(--primary-light)' : '#FEE2E2';
                                        return (
                                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px 100px', alignItems: 'center', gap: '20px', padding: '16px 20px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.name}</div>
                                                <div style={{ position: 'relative', height: '8px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }} animate={{ width: `${p.predicted}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                        style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: color, borderRadius: '99px' }}
                                                    />
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{p.progress}% done</div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <Badge bg={bgColor} color={color} style={{ fontWeight: 900, fontSize: '0.95rem', padding: '6px 14px' }}>{p.predicted}%</Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <EmptyState icon={Target} message={childLoading ? 'Loading...' : 'No grade data to project from yet.'} />}
                        </Card>
                    </motion.div>

                    {/* Strengths & Growth */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <motion.div variants={cardVariants}>
                            <Card style={{ padding: '32px', borderRadius: '28px', borderLeft: '6px solid var(--success)', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                                    <div style={{ background: '#ecfdf5', color: 'var(--success)', padding: '12px', borderRadius: '14px' }}><Award size={24} /></div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Key Strengths</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {strengths.length > 0 ? strengths.map((s, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 800 }}>{s.name}</span>
                                                <span style={{ color: 'var(--success)', fontWeight: 900 }}>{s.score}%</span>
                                            </div>
                                            <ProgressBar value={s.score} color="var(--success)" height="8px" />
                                        </div>
                                    )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 600 }}>Analyzing academic achievements...</p>}
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div variants={cardVariants}>
                            <Card style={{ padding: '32px', borderRadius: '28px', borderLeft: '6px solid var(--danger)', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                                    <div style={{ background: '#fef2f2', color: 'var(--danger)', padding: '12px', borderRadius: '14px' }}><AlertCircle size={24} /></div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Growth Areas</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {weaknesses.length > 0 ? weaknesses.map((s, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 800 }}>{s.name}</span>
                                                <span style={{ color: 'var(--danger)', fontWeight: 900 }}>{s.score}%</span>
                                            </div>
                                            <ProgressBar value={s.score} color="var(--danger)" height="8px" />
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '10px' }}>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 600, margin: 0 }}>Maintaining solid results across all subjects.</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <motion.div variants={cardVariants}>
                        <Card style={{ padding: '32px', borderRadius: '28px', textAlign: 'center' }}>
                            <Avatar name={selectedChild?.user.name} size={90} style={{ margin: '0 auto 20px auto', border: '4px solid var(--primary-light)' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0 }}>{selectedChild?.user.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 800, margin: '4px 0 32px 0' }}>Grade {selectedChild?.school_class?.name}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    { label: 'Overall Average', value: childData?.metrics?.gpa || 0, suffix: '', badge: 'GPA', badgeBg: 'var(--primary)' },
                                    { label: 'Term Attendance', value: `${childData?.metrics?.attendance_rate || 0}%`, suffix: '', badge: 'ACTIVE', badgeBg: 'var(--success)' },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '24px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>{item.label}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--primary)', lineHeight: 1 }}>{item.value}</span>
                                            <Badge bg={item.badgeBg} color="white" style={{ fontWeight: 900, fontSize: '0.75rem' }}>{item.badge}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants}>
                        <Card style={{ padding: '32px', borderRadius: '28px' }}>
                            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <TrendingUp size={20} color="var(--primary)" /> Academic Insights
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {childData?.insights?.length > 0 ? childData.insights.map((ins, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ color: ins.severity === 'high' ? 'var(--danger)' : 'var(--warning)', flexShrink: 0 }}>
                                            {ins.severity === 'high' ? <AlertCircle size={20} /> : <Target size={20} />}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.5 }}>{ins.message}</div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <Award size={40} color="var(--success)" style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>No critical alerts identified.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default MyChildren;