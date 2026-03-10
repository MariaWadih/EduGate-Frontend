import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Send, AlertCircle, Upload, FileText,
    CheckCircle2, ChevronRight, ChevronLeft,
    Timer, HelpCircle, Download, FileUp, Zap
} from 'lucide-react';
import client from '../../api/client';
import { Button, Card, Badge, Label } from '../../components/atoms';

const TakeExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentAnswers, setCurrentAnswers] = useState({});
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentStep, setCurrentStep] = useState(0); // For paginated MCQ
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await client.get(`/exams/${id}`);
                setExam(res.data);

                if (res.data.duration_minutes) {
                    setTimeLeft(res.data.duration_minutes * 60);
                    timerRef.current = setInterval(() => {
                        setTimeLeft(prev => {
                            if (prev <= 1) {
                                clearInterval(timerRef.current);
                                handleSubmit();
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }
            } catch (error) {
                console.error('Error loading exam:', error);
                navigate('/student/exams');
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            if (exam.type === 'mcq') {
                formData.append('mcq_answers', JSON.stringify(currentAnswers));
            }
            if (file) {
                formData.append('file', file);
            }

            await client.post(`/exams/${exam.id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (timerRef.current) clearInterval(timerRef.current);
            navigate('/student/exams');
        } catch (error) {
            console.error('Submit error:', error);
            alert(error.response?.data?.message || 'Failed to submit exam');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', background: 'var(--bg-main)' }}>
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '24px' }}>
                    <Zap size={48} color="var(--primary)" />
                </div>
            </motion.div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>Synchronizing secure assessment...</div>
        </div>
    );

    if (!exam) return null;

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
                    {exam.duration_minutes && (
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
                    )}
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

                    {/* Instructions Card */}
                    {currentStep === 0 && exam.description && (
                        <Card style={{ padding: '24px', background: 'var(--primary-light)', border: '1px solid rgba(79, 70, 229, 0.1)', display: 'flex', gap: '16px' }}>
                            <AlertCircle size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                            <div>
                                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '4px' }}>Proctor Instructions</div>
                                <div style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem', fontWeight: 500 }}>{exam.description}</div>
                            </div>
                        </Card>
                    )}

                    {/* File-based Exam Layout */}
                    {exam.type === 'file' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {exam.file_name && (
                                <Card style={{ padding: '32px', textAlign: 'center' }}>
                                    <FileText size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Question Paper Available</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Download the exam paper, solve the questions, and upload your answers as a single PDF or ZIP file.</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            client.get(`/homework/file/download?path=${exam.file_path}`, { responseType: 'blob' })
                                                .then(res => {
                                                    const url = window.URL.createObjectURL(new Blob([res.data]));
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.setAttribute('download', exam.file_name);
                                                    document.body.appendChild(link);
                                                    link.click();
                                                });
                                        }}
                                        style={{ borderRadius: '12px' }}
                                    >
                                        <Download size={18} style={{ marginRight: '8px' }} /> Download PDF Paper
                                    </Button>
                                </Card>
                            )}

                            <Card style={{ padding: '40px', textAlign: 'center', border: '2px dashed var(--border-color)', background: '#F9FAFB' }}>
                                <input type="file" id="exam-file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
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

                    {/* MCQ Exam Layout */}
                    {isMCQ && (
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                        >
                            <Card style={{ padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                    <div style={{ flex: 1 }}>
                                        <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '12px', fontWeight: 800 }}>Question {currentStep + 1} / {questions.length}</Badge>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: '1.4', color: 'var(--text-main)' }}>{questions[currentStep].question_text}</h2>
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
                                                    padding: '20px 24px',
                                                    borderRadius: '16px',
                                                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                                                    background: isSelected ? 'var(--primary-light)' : 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.1)' : 'none'
                                                }}
                                                onMouseEnter={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--primary)')}
                                                onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-color)')}
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
                                                <div style={{ flex: 1, fontWeight: 600, fontSize: '1rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{opt}</div>
                                                {isSelected && <CheckCircle2 size={20} color="var(--primary)" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                    disabled={currentStep === 0}
                                    style={{ padding: '12px 24px' }}
                                >
                                    <ChevronLeft size={20} style={{ marginRight: '8px' }} /> Previous
                                </Button>

                                {!isLastStep ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(prev => prev + 1)}
                                        style={{ padding: '12px 32px', borderRadius: '12px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                    >
                                        Next Question <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                                    </Button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        <HelpCircle size={16} /> All questions answered?
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

