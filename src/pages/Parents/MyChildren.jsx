import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, TrendingUp, TrendingDown, Target, 
    BookOpen, Book, Award, AlertCircle, ChevronRight,
    Search, Filter, Calendar, BarChart2
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, RadarChart, 
    PolarGrid, PolarAngleAxis, Radar, Cell 
} from 'recharts';
import { useAuth } from '../../hooks';
import { Button, Badge, Avatar, Card, ProgressBar } from '../../components/atoms';

const MyChildren = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [childData, setChildData] = useState(null);
    const [childrenMetrics, setChildrenMetrics] = useState({});
    const [loading, setLoading] = useState(true);
    const [childLoading, setChildLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        client.get('/parent/children')
            .then(res => {
                setChildren(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0]);
            })
            .catch(err => {
                console.error(err);
                setError('Could not retrieve children profiles.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedChild) {
            setChildLoading(true);
            client.get(`/analytics/parent/overview?student_id=${selectedChild.id}`)
                .then(res => {
                    setChildData(res.data);
                })
                .catch(err => console.error('Academic sync failed:', err))
                .finally(() => setChildLoading(false));
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

    // Process subject-wise data
    const getSubjectStats = () => {
        if (!childData?.current_student?.grades) return [];
        const standardTerms = ['Test 1', 'Test 2', 'Exam 1', 'Test 3', 'Exam 2'];
        const subjects = {};
        
        childData.current_student.grades.forEach(g => {
            if (!standardTerms.includes(g.term)) return;
            const subjectName = g.subject?.name || 'Unknown';
            if (!subjects[subjectName]) {
                subjects[subjectName] = { name: subjectName, total: 0 };
            }
            subjects[subjectName].total += parseFloat(g.score);
        });

        return Object.values(subjects).map(s => ({
            name: s.name,
            score: Math.round(s.total / standardTerms.length),
            fullMark: 100
        })).sort((a, b) => b.score - a.score);
    };

    const subjectStats = getSubjectStats();
    const strengths = subjectStats.filter(s => s.score >= 80);
    const weaknesses = subjectStats.filter(s => s.score < 60);
    const midRange = subjectStats.filter(s => s.score >= 60 && s.score < 80);

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.15 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ paddingBottom: '60px' }}>
            {/* Student Switcher Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', background: 'white', padding: '12px 32px', borderRadius: '40px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontWeight: 900, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Viewing Profile:</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChild(child)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 20px',
                                    borderRadius: '30px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: selectedChild?.id === child.id ? 'var(--primary)' : 'rgba(79, 70, 229, 0.05)',
                                    color: selectedChild?.id === child.id ? 'white' : 'var(--primary)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                            >
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
                    {/* Performance Overview Chart */}
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
                                <div style={{ height: '320px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={subjectStats}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}
                                                dy={10}
                                            />
                                            <YAxis domain={[0, 100]} hide />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }} 
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
                                                                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{payload[0].payload.name}</div>
                                                                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)' }}>{payload[0].value}%</div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={44}>
                                                {subjectStats.map((entry, index) => (
                                                    <Cell key={index} fill={entry.score < 50 ? 'var(--danger)' : entry.score > 80 ? 'var(--success)' : 'var(--primary)'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{ height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', borderRadius: '24px', border: '2px dashed var(--border-color)' }}>
                                    <BarChart2 size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '16px' }} />
                                    <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No performance data recorded for this term.</p>
                                </div>
                            )}
                        </Card>
                    </motion.div>

                    {/* Detailed Analysis */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* Strengths */}
                        <motion.div variants={cardVariants}>
                            <Card style={{ padding: '32px', borderRadius: '28px', borderLeft: '6px solid var(--success)', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                                    <div style={{ background: '#ecfdf5', color: 'var(--success)', padding: '12px', borderRadius: '14px' }}>
                                        <Award size={24} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Key Strengths</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {strengths.length > 0 ? strengths.map((s, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{s.name}</span>
                                                <span style={{ color: 'var(--success)', fontWeight: 900 }}>{s.score}%</span>
                                            </div>
                                            <ProgressBar value={s.score} color="var(--success)" height="8px" />
                                        </div>
                                    )) : (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 600 }}>Analyzing academic achievements...</p>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Development Areas */}
                        <motion.div variants={cardVariants}>
                            <Card style={{ padding: '32px', borderRadius: '28px', borderLeft: '6px solid var(--danger)', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                                    <div style={{ background: '#fef2f2', color: 'var(--danger)', padding: '12px', borderRadius: '14px' }}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Growth Areas</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {weaknesses.length > 0 ? weaknesses.map((s, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{s.name}</span>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <motion.div variants={cardVariants}>
                        <Card style={{ padding: '32px', borderRadius: '28px', textAlign: 'center' }}>
                            <Avatar name={selectedChild?.user.name} size={90} style={{ margin: '0 auto 20px auto', border: '4px solid var(--primary-light)' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0 }}>{selectedChild?.user.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 800, margin: '4px 0 32px 0' }}>Grade {selectedChild?.school_class?.name}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '24px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Overall Average</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--primary)', lineHeight: 1 }}>{childData?.metrics.gpa || 0}</span>
                                        <Badge bg="var(--primary)" color="white" style={{ fontWeight: 900, fontSize: '0.75rem' }}>GPA</Badge>
                                    </div>
                                </div>
                                <div style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '24px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Term Attendance</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--primary)', lineHeight: 1 }}>{childData?.metrics.attendance_rate || 0}%</span>
                                        <Badge bg="var(--success)" color="white" style={{ fontWeight: 900, fontSize: '0.75rem' }}>ACTIVE</Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants}>
                        <Card style={{ padding: '32px', borderRadius: '28px' }}>
                            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <TrendingUp size={20} color="var(--primary)" /> Academic Insights
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {childData?.insights && childData.insights.length > 0 ? childData.insights.map((ins, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ color: ins.severity === 'high' ? 'var(--danger)' : 'var(--warning)', flexShrink: 0 }}>
                                            {ins.severity === 'high' ? <AlertCircle size={20}/> : <Target size={20}/>}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.5, color: 'var(--text-main)' }}>{ins.message}</div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ color: 'var(--success)', opacity: 0.2, marginBottom: '12px' }}>
                                            <Award size={40} style={{ margin: '0 auto' }} />
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>No critical alerts identified for this profile.</p>
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
