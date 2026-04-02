import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { 
    Trophy, BookOpen, TrendingUp, TrendingDown, 
    Award, Star, ChevronRight, BarChart 
} from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { useAuth } from '../../hooks';
import { Avatar, Card, Badge, ProgressBar } from '../../components/atoms';

const ParentGrades = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [data, setData] = useState(null);
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
            client.get(`/analytics/parent/overview?student_id=${selectedChild.id}`)
                .then(res => setData(res.data))
                .catch(err => console.error(err))
                .finally(() => setChildLoading(false));
        }
    }, [selectedChild]);

    if (loading) return <div>Loading academic profile...</div>;

    const grades = data?.current_student?.grades || [];
    const gpa = data?.metrics.gpa || 0;

    const getSubjectStats = () => {
        const standardTerms = ['Test 1', 'Test 2', 'Exam 1', 'Test 3', 'Exam 2'];
        const subjects = {};
        
        grades.forEach(g => {
            if (!standardTerms.includes(g.term)) return;
            const name = g.subject?.name || 'Unknown';
            if (!subjects[name]) subjects[name] = { name, total: 0 };
            subjects[name].total += parseFloat(g.score);
        });

        return Object.values(subjects).map(s => ({
            name: s.name,
            score: Math.round(s.total / standardTerms.length)
        })).sort((a, b) => b.score - a.score);
    };

    const subjectStats = getSubjectStats();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                     <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Performance Record</h1>
                     <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Comprehensive grade history and curriculum analytics.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '6px', borderRadius: '40px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                    {children.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedChild(c)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 24px',
                                borderRadius: '40px',
                                border: 'none',
                                cursor: 'pointer',
                                background: selectedChild?.id === c.id ? 'var(--primary)' : 'transparent',
                                color: selectedChild?.id === c.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 800,
                                transition: 'all 0.2s'
                            }}
                        >
                            <Avatar name={c.user.name} size={24} />
                            {c.user.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <Card style={{ padding: '32px', borderRadius: '28px', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)', color: 'white' }}>
                        <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                        <div style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-0.05em' }}>{gpa}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Current term average</div>
                    </Card>

                    <Card style={{ padding: '32px', borderRadius: '28px' }}>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 800, display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Star size={20} color="var(--warning)" /> Top Ranking
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {subjectStats.slice(0, 3).map((s, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.name}</span>
                                        <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{s.score}%</span>
                                    </div>
                                    <ProgressBar value={s.score} color="var(--primary)" height="8px" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <Card style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Trophy size={20} color="var(--primary)" />
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Subject Evaluations</h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                <thead style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject / Instructor</th>
                                        {['Test 1', 'Test 2', 'Exam 1', 'Test 3', 'Exam 2'].map(term => (
                                            <th key={term} style={{ padding: '20px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{term}</th>
                                        ))}
                                        <th style={{ padding: '20px 32px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjectStats.map((subject, sIdx) => {
                                        const subjectGrades = grades.filter(g => g.subject?.name === subject.name);
                                        const terms = ['Test 1', 'Test 2', 'Exam 1', 'Test 3', 'Exam 2'];
                                        
                                        // Calculate overall based on these 5 pillars specifically as per screenshot
                                        const pillarGrades = subjectGrades.filter(g => terms.includes(g.term));
                                        const overallScore = pillarGrades.length > 0 ? (pillarGrades.reduce((sum, g) => sum + parseFloat(g.score), 0) / terms.length).toFixed(1) : '0.0';

                                        return (
                                            <tr key={sIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '24px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-main)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>
                                                            {subject.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 850, fontSize: '1rem', color: 'var(--text-main)' }}>{subject.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{subjectGrades[0]?.teacher?.user?.name || 'Assigned Faculty'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {terms.map(term => {
                                                    const grade = subjectGrades.find(g => g.term === term);
                                                    return (
                                                        <td key={term} style={{ padding: '24px 20px', textAlign: 'center' }}>
                                                            {grade ? (
                                                                <div>
                                                                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)' }}>{grade.score}</div>
                                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>/ 100</div>
                                                                </div>
                                                            ) : (
                                                                <div style={{ color: '#E2E8F0', fontWeight: 900, fontSize: '1.2rem' }}>—</div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td style={{ padding: '24px 32px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(79, 70, 229, 0.04)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                                                        <span style={{ fontWeight: 950, fontSize: '1.1rem', color: 'var(--primary)' }}>{overallScore}%</span>
                                                        <ChevronRight size={16} color="var(--primary)" style={{ opacity: 0.5 }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {grades.length === 0 && (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p style={{ fontWeight: 700 }}>Academic transcript being compiled...</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ParentGrades;
