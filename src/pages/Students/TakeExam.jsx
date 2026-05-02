import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Send, AlertCircle, Upload, FileText,
    CheckCircle2, ChevronRight, ChevronLeft,
    Timer, HelpCircle, Download, FileUp, Zap, BookOpen, Award
} from 'lucide-react';
import client from '../../api/client';
import { Button, Card, Badge } from '../../components/atoms';

const TakeExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentAnswers, setCurrentAnswers] = useState({});
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [result, setResult] = useState(null); // holds submission result after MCQ submit
    const timerRef = useRef(null);
    const [existingSubmission, setExistingSubmission] = useState(null);

    useEffect(() => {
const fetchExam = async () => {
    try {
        const res = await client.get(`/exams/${id}`);
        const examData = res.data;
        setExam(examData);

        // If already submitted a file, show it
        if (examData.my_submission?.file_name) {
            setExistingSubmission(examData.my_submission);
        }

                // Fix duration: use duration_minutes if set, else derive from end_time - now
                const now = new Date();
                const end = new Date(examData.end_time);
                const secondsUntilEnd = Math.max(0, Math.floor((end - now) / 1000));



                // Use the smaller of the two — don't give more time than end_time allows
                const effectiveDuration = examData.duration_minutes
                    ? Math.min(examData.duration_minutes * 60, secondsUntilEnd)
                    : secondsUntilEnd;

                setTimeLeft(effectiveDuration);

                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            handleAutoSubmit();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

            } catch (error) {
                console.error('Error loading exam:', error);
                navigate('/student/exams');
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [id]);

    // Auto-submit ref to avoid stale closure
    const currentAnswersRef = useRef(currentAnswers);
    const fileRef = useRef(file);
    const examRef = useRef(exam);
    useEffect(() => { currentAnswersRef.current = currentAnswers; }, [currentAnswers]);
    useEffect(() => { fileRef.current = file; }, [file]);
    useEffect(() => { examRef.current = exam; }, [exam]);

    const handleAutoSubmit = async () => {
        await submitExam(examRef.current, currentAnswersRef.current, fileRef.current);
    };

    const submitExam = async (examData, answers, uploadedFile) => {
        if (!examData) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            if (examData.type === 'mcq') {
                formData.append('mcq_answers', JSON.stringify(answers));
            }
            if (uploadedFile) {
                formData.append('file', uploadedFile);
            }

            const res = await client.post(`/exams/${examData.id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (timerRef.current) clearInterval(timerRef.current);

            if (examData.type === 'mcq') {
                // Show result immediately instead of navigating away
                setResult(res.data);
            } else {
                navigate('/student/exams');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert(error.response?.data?.message || 'Failed to submit exam');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        await submitExam(exam, currentAnswers, file);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', background: 'var(--bg-main)' }}>
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                <div style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '24px' }}>
                    <Zap size={48} color="var(--primary)" />
                </div>
            </motion.div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>Synchronizing secure assessment...</div>
        </div>
    );

    if (!exam) return null;

    // Show result screen after MCQ submission
    if (result) {
        const percentage = Math.round((result.score / exam.max_score) * 100);
        const passed = percentage >= 50;
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ maxWidth: '600px', width: '100%' }}
                >
                    <Card style={{ padding: '60px 40px', textAlign: 'center', borderRadius: '28px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: passed ? '#DCFCE7' : '#FEE2E2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <Award size={40} color={passed ? '#059669' : '#DC2626'} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                            {passed ? 'Well Done!' : 'Keep Practicing!'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
                            You have completed <strong>{exam.title}</strong>
                        </p>

                        <div style={{
                            padding: '32px',
                            background: passed ? '#F0FDF4' : '#FEF2F2',
                            borderRadius: '20px',
                            marginBottom: '32px'
                        }}>
                            <div style={{ fontSize: '4rem', fontWeight: 900, color: passed ? '#059669' : '#DC2626', lineHeight: 1 }}>
                                {result.score}
                            </div>
                            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                out of <strong>{exam.max_score}</strong> points ({percentage}%)
                            </div>
                        </div>

                        {/* Per-question breakdown */}
                        {exam.questions && (
                            <div style={{ textAlign: 'left', marginBottom: '32px', maxHeight: '300px', overflowY: 'auto' }}>
                                {exam.questions.map((q, idx) => {
                                    const studentAnswer = currentAnswers[q.id];
                                    const isCorrect = studentAnswer == q.correct_option;
                                    return (
                                        <div key={idx} style={{
                                            padding: '14px 16px',
                                            borderRadius: '12px',
                                            border: `1px solid ${isCorrect ? '#BBF7D0' : '#FECACA'}`,
                                            background: isCorrect ? '#F0FDF4' : '#FEF2F2',
                                            marginBottom: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Q{idx + 1}. {q.question_text}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                                                {isCorrect
                                                    ? <CheckCircle2 size={18} color="#059669" />
                                                    : <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700 }}>
                                                        Correct: {q.options[q.correct_option]}
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Button onClick={() => navigate('/student/exams')} style={{ width: '100%', padding: '14px' }}>
                            Back to All Exams
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const questions = exam.questions || [];
    const isMCQ = exam.type === 'mcq';
    const isLastStep = !isMCQ || currentStep === questions.length - 1;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
            {/* Top Navigation / Status Bar */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border-color)',
                padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '10px' }}>
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{exam.subject?.name}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{exam.title}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 20px', borderRadius: '12px',
                        background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-light)',
                        color: timeLeft < 300 ? 'var(--danger)' : 'var(--primary)',
                        fontWeight: 800, fontSize: '1.1rem'
                    }}>
                        <Timer size={20} />
                        {formatTime(timeLeft)}
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{ padding: '10px 24px', borderRadius: '10px', boxShadow: 'var(--shadow-md)' }}
                    >
                        {submitting ? 'Submitting...' : 'Finish Exam'}
                    </Button>
                </div>
            </div>

            {/* MCQ Progress Bar */}
            {isMCQ && (
                <div style={{ height: '4px', background: '#E5E7EB', width: '100%' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                        style={{ height: '100%', background: 'var(--primary)' }}
                    />
                </div>
            )}

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {currentStep === 0 && exam.description && (
                        <Card style={{ padding: '24px', background: 'var(--primary-light)', border: '1px solid rgba(79, 70, 229, 0.1)', display: 'flex', gap: '16px' }}>
                            <AlertCircle size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                            <div>
                                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '4px' }}>Instructions</div>
                                <div style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem', fontWeight: 500 }}>{exam.description}</div>
                            </div>
                        </Card>
                    )}

                    {/* File exam */}
                    {exam.type === 'file' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {exam.file_name && (
                                <Card style={{ padding: '32px', textAlign: 'center' }}>
                                    <FileText size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Question Paper Available</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Download the exam paper, solve the questions, and upload your answers.</p>
                                    <Button variant="outline" onClick={() => {
                                        client.get(`/homework/file/download?path=${exam.file_path}`, { responseType: 'blob' })
                                            .then(res => {
                                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', exam.file_name);
                                                document.body.appendChild(link);
                                                link.click();
                                            });
                                    }}>
                                        <Download size={18} style={{ marginRight: '8px' }} /> Download PDF Paper
                                    </Button>
                                </Card>
                            )}
                            <Card style={{ padding: '40px', textAlign: 'center', border: '2px dashed var(--border-color)', background: '#F9FAFB' }}>
                                <input type="file" id="exam-file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                                {existingSubmission && (
                                    <div style={{
                                        padding: '16px',
                                        background: '#F0FDF4',
                                        border: '1px solid #BBF7D0',
                                        borderRadius: '12px',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <CheckCircle2 size={20} color="#059669" />
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#166534' }}>Previously submitted</div>
                                            <div style={{ fontSize: '0.85rem', color: '#059669' }}>{existingSubmission.file_name}</div>
                                        </div>
                                    </div>
                                )}
                                <div onClick={() => document.getElementById('exam-file').click()} style={{ cursor: 'pointer' }}>
                                    <div style={{ background: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: 'var(--shadow-sm)' }}>
                                        <FileUp size={28} color="var(--primary)" />
                                    </div>
                                    <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>{file ? file.name : 'Click to Upload Answers'}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Supported formats: PDF, ZIP, DOCX (Max 20MB)</p>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* MCQ exam */}
                    {isMCQ && (
                        <motion.div key={currentStep} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <Card style={{ padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                    <div style={{ flex: 1 }}>
                                        <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '12px', fontWeight: 800 }}>
                                            Question {currentStep + 1} / {questions.length}
                                        </Badge>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: '1.4' }}>{questions[currentStep].question_text}</h2>
                                    </div>
                                    <Badge bg="#DCFCE7" color="#166534" style={{ fontWeight: 800 }}>{questions[currentStep].points} Points</Badge>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {questions[currentStep].options.map((opt, oIdx) => {
                                        const isSelected = currentAnswers[questions[currentStep].id] == oIdx;
                                        return (
                                            <div
                                                key={oIdx}
                                                onClick={() => setCurrentAnswers({ ...currentAnswers, [questions[currentStep].id]: oIdx })}
                                                style={{
                                                    padding: '20px 24px', borderRadius: '16px',
                                                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                                                    background: isSelected ? 'var(--primary-light)' : 'white',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isSelected ? 'var(--primary)' : '#F1F5F9',
                                                    color: isSelected ? 'white' : 'var(--text-muted)',
                                                    fontWeight: 800, fontSize: '0.85rem'
                                                }}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <div style={{ flex: 1, fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{opt}</div>
                                                {isSelected && <CheckCircle2 size={20} color="var(--primary)" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                                <Button variant="ghost" onClick={() => setCurrentStep(p => Math.max(0, p - 1))} disabled={currentStep === 0}>
                                    <ChevronLeft size={20} style={{ marginRight: '8px' }} /> Previous
                                </Button>
                                {!isLastStep ? (
                                    <Button variant="outline" onClick={() => setCurrentStep(p => p + 1)}
                                        style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                                        Next <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                                    </Button>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <HelpCircle size={16} /> Ready? Click "Finish Exam" above
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TakeExam;