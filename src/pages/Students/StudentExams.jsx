import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Calendar, CheckCircle, AlertCircle, Play,
    BookOpen, Timer, Award, RefreshCcw, Eye, X,
    CheckCircle2, XCircle
} from 'lucide-react';
import client from '../../api/client';
import { Button, Card, Badge } from '../../components/atoms';
import { Modal } from '../../components/molecules';

const StudentExams = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Submission review modal
    const [reviewModal, setReviewModal] = useState(false);
    const [reviewExam, setReviewExam] = useState(null);

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

    useEffect(() => { fetchData(); }, []);

    const handleViewSubmission = (exam) => {
        setReviewExam(exam);
        setReviewModal(true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>Exams & Quizzes</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '4px' }}>Validate your knowledge and track your certification progress.</p>
                </div>
                <Button variant="outline" onClick={() => fetchData(true)} disabled={refreshing}>
                    <RefreshCcw size={16} style={{ marginRight: '8px' }} />
                    Refresh
                </Button>
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
                        const submission = exam.my_submission;
                        const isGraded = submission?.status === 'graded';
                        const isSubmitted = !!submission;
                        const isMCQ = exam.type === 'mcq';
                        const now = new Date();
                        const start = new Date(exam.start_time);
                        const end = new Date(exam.end_time);
                        const isPast = now > end;
                        const isOpen = now >= start && now <= end;

                        // MCQ: once submitted can never re-enter
                        // File: can re-upload until end date
                        const canEnter = isOpen && (!isSubmitted || (!isMCQ && !isPast));

                        return (
                            <motion.div key={exam.id} variants={itemVariants} whileHover={{ y: -5 }}>
                                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <div style={{ padding: '28px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontWeight: 800 }}>{exam.subject.name}</Badge>
                                            {isGraded ? (
                                                <Badge bg="#DCFCE7" color="#059669" style={{ fontWeight: 800 }}>Graded</Badge>
                                            ) : isSubmitted ? (
                                                <Badge bg="#EFF6FF" color="#2563EB" style={{ fontWeight: 800 }}>Submitted</Badge>
                                            ) : isOpen ? (
                                                <Badge bg="#FEE2E2" color="#E11D48" style={{ fontWeight: 800 }}>Active Now</Badge>
                                            ) : now < start ? (
                                                <Badge bg="#FEF3C7" color="#D97706" style={{ fontWeight: 800 }}>Scheduled</Badge>
                                            ) : (
                                                <Badge bg="#F1F5F9" color="#64748B" style={{ fontWeight: 800 }}>Closed</Badge>
                                            )}
                                        </div>

                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 800 }}>{exam.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                                            {exam.description || 'Join this assessment to test your understanding of the current modules.'}
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Due Date</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={14} color="var(--primary)" />
                                                    {end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Duration</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Timer size={14} color="var(--primary)" />
                                                    {exam.duration_minutes
                                                        ? `${exam.duration_minutes} mins`
                                                        : `${Math.round((end - start) / 60000)} mins`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '24px 28px', background: '#FAFAFA', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                        {/* Left side — score or status */}
                                        <div style={{ flex: 1 }}>
                                            {isGraded ? (
                                                <>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Your Score</div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>
                                                        {Math.round(submission.score)} <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>/ {exam.max_score}</span>
                                                    </div>
                                                </>
                                            ) : isSubmitted ? (
                                                <>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Status</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563EB' }}>
                                                        {isMCQ ? '⏳ Waiting for grading' : (isPast ? '⏳ Waiting for grading' : '✏️ Resubmission allowed')}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Status</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                                                        {isOpen ? 'Available' : (now < start ? 'Opens Soon' : 'Closed')}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Right side — action buttons */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {/* View submission button — shown when submitted */}
                                            {isSubmitted && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleViewSubmission(exam)}
                                                    style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem' }}
                                                >
                                                    <Eye size={14} style={{ marginRight: '6px' }} /> View
                                                </Button>
                                            )}

                                            {/* Enter exam button */}
                                            {canEnter ? (
                                                <Button
                                                    onClick={() => navigate(`/student/exams/${exam.id}/take`)}
                                                    style={{ borderRadius: '10px', padding: '10px 20px' }}
                                                >
                                                    <Play size={16} fill="white" style={{ marginRight: '8px' }} />
                                                    {isSubmitted ? 'Re-upload' : 'Enter Exam'}
                                                </Button>
                                            ) : isSubmitted ? (
                                                <Badge bg="transparent" color="var(--success)" style={{ border: '1px solid var(--success)' }}>
                                                    <CheckCircle size={14} style={{ marginRight: '4px' }} /> Done
                                                </Badge>
                                            ) : (
                                                <Badge bg="transparent" color="var(--text-muted)" style={{ border: '1px solid var(--border-color)' }}>
                                                    {now < start ? 'Opens Soon' : 'Closed'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Submission Review Modal */}
            <Modal
                isOpen={reviewModal}
                onClose={() => { setReviewModal(false); setReviewExam(null); }}
                title={reviewExam ? `Your Submission — ${reviewExam.title}` : ''}
                width="700px"
            >
                {reviewExam && (() => {
                    const submission = reviewExam.my_submission;
                    const isGraded = submission?.status === 'graded';
                    const isMCQ = reviewExam.type === 'mcq';

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Score banner */}
                            <div style={{
                                padding: '20px 24px',
                                borderRadius: '16px',
                                background: isGraded
                                    ? 'linear-gradient(135deg, #10B981, #059669)'
                                    : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>
                                        {isGraded ? 'Final Score' : 'Status'}
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>
                                        {isGraded
                                            ? `${Math.round(submission.score)} / ${reviewExam.max_score}`
                                            : '⏳ Waiting for grading'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', opacity: 0.85 }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Submitted</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                        {submission?.submitted_at
                                            ? new Date(submission.submitted_at).toLocaleString()
                                            : '—'}
                                    </div>
                                </div>
                            </div>

                            {/* MCQ answers review */}
                            {isMCQ && reviewExam.questions && submission?.mcq_answers && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {reviewExam.questions.map((q, idx) => {
                                        const studentAnswer = submission.mcq_answers?.[q.id];
                                        const isCorrect = isGraded && studentAnswer == q.correct_option;
                                        const showCorrect = isGraded;

                                        return (
                                            <div key={idx} style={{
                                                padding: '20px',
                                                borderRadius: '14px',
                                                border: `2px solid ${showCorrect ? (isCorrect ? '#10B981' : '#EF4444') : '#E5E7EB'}`,
                                                background: showCorrect ? (isCorrect ? '#F0FDF4' : '#FEF2F2') : '#F9FAFB'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                    <div style={{ fontWeight: 700 }}>Q{idx + 1}. {q.question_text}</div>
                                                    {showCorrect && (
                                                        <Badge
                                                            bg={isCorrect ? '#DCFCE7' : '#FEE2E2'}
                                                            color={isCorrect ? '#166534' : '#991B1B'}
                                                        >
                                                            {isCorrect ? '✓ Correct' : '✗ Wrong'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                    {q.options.map((opt, oIdx) => {
                                                        const isStudentChoice = studentAnswer == oIdx;
                                                        const isCorrectAnswer = showCorrect && q.correct_option == oIdx;
                                                        return (
                                                            <div key={oIdx} style={{
                                                                padding: '10px 14px',
                                                                borderRadius: '8px',
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

                            {/* File submission */}
                            {!isMCQ && (
                                <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <BookOpen size={20} color="var(--primary)" />
                                    <div>
                                        <div style={{ fontWeight: 700 }}>File submitted</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{submission?.file_name || 'No filename available'}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Modal>
        </motion.div>
    );
};

export default StudentExams;