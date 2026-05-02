import React, { useEffect, useState, useMemo } from 'react';
import client from '../../api/client';
import { motion } from 'framer-motion';
import {
    TrendingUp, CheckCircle, XCircle, Clock,
    Calendar, FileText, Timer, Award, RefreshCcw,
    CheckCircle2, BookOpen
} from 'lucide-react';
import { Avatar, Card, Badge, Button } from '../../components/atoms';
import { Modal } from '../../components/molecules';

const ParentExams = () => {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [reviewModal, setReviewModal] = useState(false);
    const [reviewExam, setReviewExam] = useState(null);

    // Fetch children
    useEffect(() => {
        client.get('/parent/children')
            .then(res => {
                setChildren(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0]);
            })
            .catch(err => console.error(err));
    }, []);

useEffect(() => {
    if (!selectedChild) return; // don't fetch until child is selected
    setLoading(true);
    client.get(`/parent/exams?student_id=${selectedChild.id}`)
        .then(res => setExams(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
}, [selectedChild]);

    const now = new Date();

    const stats = useMemo(() => {
        const total = exams.length;
        const submitted = exams.filter(e => e.my_submission).length;
        const pending = exams.filter(e => !e.my_submission && new Date(e.end_time) > now).length;
        const graded = exams.filter(e => e.my_submission?.status === 'graded');
        const scores = graded.map(e => (e.my_submission.score / e.max_score) * 100);
        const avg = scores.length > 0
            ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
            : 'N/A';
        return { total, submitted, pending, avg };
    }, [exams]);

    const filteredExams = useMemo(() => {
        return exams.filter(e => {
            if (statusFilter === 'All') return true;
            if (statusFilter === 'Submitted') return !!e.my_submission;
            if (statusFilter === 'Missing') return !e.my_submission && new Date(e.end_time) < now;
            if (statusFilter === 'Upcoming') return !e.my_submission && new Date(e.start_time) > now;
            if (statusFilter === 'Graded') return e.my_submission?.status === 'graded';
            return true;
        });
    }, [exams, statusFilter]);

    const upcomingExams = exams.filter(e =>
        !e.my_submission && new Date(e.end_time) > now
    );

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <TrendingUp size={48} color="var(--primary)" />
            </motion.div>
            <div style={{ marginTop: '20px', fontWeight: 800, color: 'var(--text-muted)' }}>Loading exam records...</div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: '60px' }}>

            {/* Child Switcher */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', background: 'white', padding: '8px', borderRadius: '40px', width: 'fit-content', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                {children.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedChild(c)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 24px', borderRadius: '40px', border: 'none',
                            cursor: 'pointer',
                            background: selectedChild?.id === c.id ? 'var(--primary)' : 'transparent',
                            color: selectedChild?.id === c.id ? 'white' : 'var(--text-muted)',
                            fontWeight: 800, transition: 'all 0.25s'
                        }}
                    >
                        <Avatar name={c.user.name} size={24} />
                        {c.user.name}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Exams Monitoring</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem', marginTop: '6px' }}>
                    Track your child's exam performance and upcoming assessments.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {[
                    { label: 'Total Exams', val: stats.total, icon: TrendingUp, color: 'var(--primary)', bg: 'rgba(79, 70, 229, 0.08)' },
                    { label: 'Submitted', val: stats.submitted, icon: CheckCircle, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.08)' },
                    { label: 'Pending', val: stats.pending, icon: Clock, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.08)' },
                    { label: 'Avg Score', val: stats.avg === 'N/A' ? 'N/A' : `${stats.avg}%`, icon: Award, color: 'var(--primary)', bg: 'rgba(79, 70, 229, 0.08)' },
                ].map((s, i) => (
                    <Card key={i} style={{ padding: '24px', borderRadius: '24px', position: 'relative' }}>
                        <div style={{ background: s.bg, color: s.color, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '24px', right: '24px' }}>
                            <s.icon size={20} />
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{s.val}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Upcoming Exams */}
            <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 850, marginBottom: '24px' }}>Upcoming Exams</h2>
                {upcomingExams.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-main)', borderRadius: '24px', border: '2px dashed var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>
                        No upcoming exams for {selectedChild?.user?.name}.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                        {upcomingExams.map(e => {
                            const end = new Date(e.end_time);
                            const start = new Date(e.start_time);
                            const isActive = now >= start && now <= end;
                            return (
                                <Card key={e.id} style={{ padding: '24px', borderRadius: '20px', borderLeft: `6px solid ${isActive ? 'var(--danger)' : 'var(--warning)'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <Badge
                                            bg={isActive ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'}
                                            color={isActive ? 'var(--danger)' : 'var(--warning)'}
                                            style={{ fontWeight: 800 }}
                                        >
                                            {isActive ? 'ACTIVE NOW' : 'UPCOMING'}
                                        </Badge>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} /> Due {end.toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 850 }}>{e.title}</h3>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <BookOpen size={14} /> {e.subject?.name}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Timer size={14} />
                                            {e.duration_minutes
                                                ? `${e.duration_minutes} mins`
                                                : `${Math.round((new Date(e.end_time) - new Date(e.start_time)) / 60000)} mins`}
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Exam History Table */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 850, margin: 0 }}>Exam History</h2>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 600 }}
                    >
                        {['All', 'Submitted', 'Missing', 'Upcoming', 'Graded'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <Card style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F9FAFB' }}>
                                <tr>
                                    {['STUDENT', 'EXAM TITLE', 'SUBJECT', 'TYPE', 'START DATE', 'END DATE', 'STATUS', 'SCORE', 'ACTIONS'].map(h => (
                                        <th key={h} style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExams.map((e, idx) => {
                                    const sub = e.my_submission;
                                    const isGraded = sub?.status === 'graded';
                                    const isSubmitted = !!sub;
                                    const isPast = new Date(e.end_time) < now;
                                    const isMissing = !isSubmitted && isPast;

                                    return (
                                        <tr key={e.id} style={{ borderBottom: idx < filteredExams.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                            <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '0.9rem' }}>
                                                {selectedChild?.user?.name}
                                            </td>
                                            <td style={{ padding: '20px 24px', fontWeight: 800, fontSize: '0.9rem' }}>{e.title}</td>
                                            <td style={{ padding: '20px 24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.subject?.name}</td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <Badge
                                                    bg={e.type === 'mcq' ? 'var(--primary-light)' : '#E0F2FE'}
                                                    color={e.type === 'mcq' ? 'var(--primary)' : '#0369A1'}
                                                    style={{ fontWeight: 800, fontSize: '0.7rem' }}
                                                >
                                                    {e.type?.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '0.85rem' }}>
                                                {new Date(e.start_time).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '0.85rem' }}>
                                                {new Date(e.end_time).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <Badge
                                                    bg={
                                                        isGraded ? 'rgba(16,185,129,0.1)' :
                                                        isSubmitted ? 'rgba(59,130,246,0.1)' :
                                                        isMissing ? 'rgba(239,68,68,0.1)' :
                                                        'rgba(245,158,11,0.1)'
                                                    }
                                                    color={
                                                        isGraded ? 'var(--success)' :
                                                        isSubmitted ? '#2563EB' :
                                                        isMissing ? 'var(--danger)' :
                                                        'var(--warning)'
                                                    }
                                                    style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}
                                                >
                                                    {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : isMissing ? 'Missing' : 'Upcoming'}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '20px 24px', fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>
                                                {isGraded
                                                    ? `${Math.round(sub.score)} / ${e.max_score}`
                                                    : 'N/A'}
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                {isSubmitted && e.type === 'mcq' && isGraded && (
                                                    <Button
                                                        size="small"
                                                        variant="outline"
                                                        onClick={() => { setReviewExam(e); setReviewModal(true); }}
                                                        style={{ fontSize: '0.8rem' }}
                                                    >
                                                        View Answers
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredExams.length === 0 && (
                                    <tr>
                                        <td colSpan={9} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            No exams found for the selected filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* MCQ Review Modal */}
            <Modal
                isOpen={reviewModal}
                onClose={() => { setReviewModal(false); setReviewExam(null); }}
                title={reviewExam ? `${selectedChild?.user?.name} — ${reviewExam.title}` : ''}
                width="700px"
            >
                {reviewExam && (() => {
                    const sub = reviewExam.my_submission;
                    const percentage = sub ? Math.round((sub.score / reviewExam.max_score) * 100) : 0;
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Score banner */}
                            <div style={{
                                padding: '24px', borderRadius: '16px',
                                background: percentage >= 50
                                    ? 'linear-gradient(135deg, #10B981, #059669)'
                                    : 'linear-gradient(135deg, #EF4444, #DC2626)',
                                color: 'white',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>Final Score</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                                        {Math.round(sub.score)} <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>/ {reviewExam.max_score}</span>
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', opacity: 0.9 }}>{percentage}%</div>
                                </div>
                                <Award size={64} style={{ opacity: 0.2 }} />
                            </div>

                            {/* Questions review */}
                            {reviewExam.questions && sub?.mcq_answers && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {reviewExam.questions.map((q, idx) => {
                                        const studentAnswer = sub.mcq_answers?.[q.id];
                                        const isCorrect = studentAnswer == q.correct_option;
                                        return (
                                            <div key={idx} style={{
                                                padding: '20px', borderRadius: '14px',
                                                border: `2px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
                                                background: isCorrect ? '#F0FDF4' : '#FEF2F2'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                    <div style={{ fontWeight: 700 }}>Q{idx + 1}. {q.question_text}</div>
                                                    <Badge
                                                        bg={isCorrect ? '#DCFCE7' : '#FEE2E2'}
                                                        color={isCorrect ? '#166534' : '#991B1B'}
                                                    >
                                                        {isCorrect ? '✓ Correct' : '✗ Wrong'}
                                                    </Badge>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                    {q.options.map((opt, oIdx) => {
                                                        const isStudentChoice = studentAnswer == oIdx;
                                                        const isCorrectAnswer = q.correct_option == oIdx;
                                                        return (
                                                            <div key={oIdx} style={{
                                                                padding: '10px 14px', borderRadius: '8px',
                                                                border: `2px solid ${isCorrectAnswer ? '#10B981' : isStudentChoice ? '#EF4444' : '#E5E7EB'}`,
                                                                background: isCorrectAnswer ? '#DCFCE7' : isStudentChoice ? '#FEE2E2' : '#F9FAFB',
                                                                fontWeight: (isStudentChoice || isCorrectAnswer) ? 700 : 400,
                                                                fontSize: '0.875rem',
                                                                display: 'flex', alignItems: 'center', gap: '8px'
                                                            }}>
                                                                <span style={{ fontWeight: 800, opacity: 0.6 }}>{String.fromCharCode(65 + oIdx)}.</span>
                                                                {opt}
                                                                {isCorrectAnswer && <CheckCircle2 size={14} color="#10B981" style={{ marginLeft: 'auto' }} />}
                                                                {isStudentChoice && !isCorrectAnswer && <XCircle size={14} color="#EF4444" style={{ marginLeft: 'auto' }} />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {!reviewExam.questions && (
                                <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Question details not available for this exam type.
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Modal>
        </motion.div>
    );
};

export default ParentExams;