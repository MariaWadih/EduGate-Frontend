import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock, Calendar, CheckCircle, AlertCircle, Play,
    BookOpen, Timer, Award, Filter, Search, RefreshCcw
} from 'lucide-react';
import client from '../../api/client';
import { Button, Card, Badge } from '../../components/atoms';

const StudentExams = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await client.get('/exams');
            setExams(res.data);
        } catch (error) {
            console.error("Error fetching exams", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const startExam = (exam) => {
        navigate(`/student/exams/${exam.id}/take`);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <RefreshCcw size={48} color="var(--primary)" />
            </motion.div>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Preparing your assessments...</div>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ paddingBottom: '40px' }}
        >
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>Exams & Quizzes</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '4px' }}>Validate your knowledge and track your certification progress.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" onClick={() => fetchData(true)} disabled={refreshing}>
                        <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} style={{ marginRight: '8px' }} />
                        Refresh
                    </Button>
                </div>
            </div>

            {exams.length === 0 ? (
                <Card style={{ padding: '80px 20px', textAlign: 'center', borderStyle: 'dashed' }}>
                    <div style={{ background: 'var(--primary-light)', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <Award size={32} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>No Active Exams</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Your study schedule is clear for now. Check back later for upcoming quizzes or midterms.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '28px' }}>
                    {exams.map(exam => {
                        const submission = exam.submissions?.[0];
                        const isGraded = submission?.status === 'graded';
                        const isSubmitted = !!submission;
                        const now = new Date();
                        const start = new Date(exam.start_time);
                        const end = new Date(exam.end_time);
                        const isActive = now >= start && now <= end && !isSubmitted;

                        return (
                            <motion.div key={exam.id} variants={itemVariants} whileHover={{ y: -5 }}>
                                <Card style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: 0,
                                    overflow: 'hidden',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(0,0,0,0.06)'
                                }}>
                                    <div style={{ padding: '28px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontWeight: 800 }}>{exam.subject.name}</Badge>
                                            {isGraded ? (
                                                <Badge bg="#DCFCE7" color="#059669" style={{ fontWeight: 800 }}>Completed</Badge>
                                            ) : (isSubmitted ? (
                                                <Badge bg="#EFF6FF" color="#2563EB" style={{ fontWeight: 800 }}>Pending Review</Badge>
                                            ) : (isActive ? (
                                                <Badge bg="#FEE2E2" color="#E11D48" style={{ fontWeight: 800 }}>Active Now</Badge>
                                            ) : (now < start ? (
                                                <Badge bg="#FEF3C7" color="#D97706" style={{ fontWeight: 800 }}>Scheduled</Badge>
                                            ) : (
                                                <Badge bg="#F1F5F9" color="#64748B" style={{ fontWeight: 800 }}>Closed</Badge>
                                            ))))}
                                        </div>

                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 800 }}>{exam.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                                            {exam.description || 'Join this assessment to test your understanding of the current modules.'}
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>End Date</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={14} color="var(--primary)" /> {end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Duration</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Timer size={14} color="var(--primary)" /> {exam.duration_minutes || '60'} mins
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '24px 28px', background: '#FAFAFA', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {isGraded ? (
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Performance Check</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>
                                                    {Math.round(submission.score)} <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>/ {exam.max_score}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Status</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {isSubmitted ? 'Submitted' : (isActive ? 'Available' : 'Unavailable')}
                                                </div>
                                            </div>
                                        )}

                                        {isActive ? (
                                            <Button onClick={() => startExam(exam)} style={{ borderRadius: '10px', padding: '10px 20px' }}>
                                                <Play size={16} fill="white" style={{ marginRight: '8px' }} /> Enter Exam
                                            </Button>
                                        ) : (isSubmitted ? (
                                            <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CheckCircle size={18} /> Done
                                            </div>
                                        ) : (
                                            <Badge bg="transparent" color="var(--text-muted)" style={{ border: '1px solid var(--border-color)' }}>
                                                {now < start ? 'Opens Soon' : 'Closed'}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default StudentExams;

