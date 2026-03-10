import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Clock, Calendar, CheckCircle2,
    FileText, Download, AlertCircle, Edit, Trash2
} from 'lucide-react';
import client from '../../api/client';
import { Button, Badge, Card } from '../../components/atoms';

const ExamDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await client.get(`/exams/${id}`);
                setExam(res.data);
            } catch (error) {
                console.error('Error loading exam:', error);
                alert('Failed to load exam details');
                navigate('/exams');
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [id, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading exam details...</div>
            </div>
        );
    }

    if (!exam) return null;

    return (
        <div style={{ padding: '0 0 40px 0' }}>
            {/* Header / Navigation */}
            <div style={{ marginBottom: '24px' }}>
                <Button variant="ghost" onClick={() => navigate('/exams')} style={{ paddingLeft: 0 }}>
                    <ArrowLeft size={20} style={{ marginRight: '8px' }} />
                    Back to All Exams
                </Button>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>

                {/* Exam Title & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{exam.title}</h1>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Badge
                                bg={exam.type === 'mcq' ? 'var(--primary-light)' : '#E0F2FE'}
                                color={exam.type === 'mcq' ? 'var(--primary)' : '#0369A1'}
                            >
                                {exam.type.toUpperCase()}
                            </Badge>
                            <span style={{ color: 'var(--text-muted)' }}>
                                {exam.subject?.name} • Section {exam.school_class?.section}
                            </span>
                        </div>
                    </div>
                    {/* Placeholder for future actions like Edit/Delete if needed here */}
                </div>

                {/* Exam Info Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Start Time</div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} color="var(--primary)" />
                            {new Date(exam.start_time).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>End Time</div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} color="var(--primary)" />
                            {new Date(exam.end_time).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Duration</div>
                        <div style={{ fontWeight: 600 }}>{exam.duration_minutes || 'Flexible'} minutes</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Max Score</div>
                        <div style={{ fontWeight: 600, color: 'var(--success)' }}>{exam.max_score} points</div>
                    </div>
                </div>

                {/* Description */}
                {exam.description && (
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Description</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {exam.description}
                        </p>
                    </div>
                )}

                {/* Questions (MCQ) */}
                {exam.type === 'mcq' && exam.questions && exam.questions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ margin: '8px 0 0 0', fontSize: '1.2rem' }}>
                            Questions ({exam.questions.length})
                        </h3>

                        {exam.questions.map((q, idx) => (
                            <div key={idx} style={{ padding: '24px', border: '1px solid #E5E7EB', borderRadius: '16px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Q{idx + 1}. {q.question_text}</div>
                                    <Badge bg="#DCFCE7" color="#166534">{q.points} pts</Badge>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {q.options.map((opt, oIdx) => (
                                        <div
                                            key={oIdx}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: `2px solid ${q.correct_option == oIdx ? '#10B981' : '#F3F4F6'}`,
                                                background: q.correct_option == oIdx ? '#F0FDF4' : 'white',
                                                fontSize: '1rem',
                                                fontWeight: q.correct_option == oIdx ? 600 : 400,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span>
                                                <span style={{ fontWeight: 600, marginRight: '8px' }}>{String.fromCharCode(65 + oIdx)}.</span>
                                                {opt}
                                            </span>
                                            {q.correct_option == oIdx && (
                                                <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* File Info (File Based) */}
                {exam.type === 'file' && exam.file_name && (
                    <div style={{ padding: '32px', background: '#F0F9FF', border: '1px solid #B9E6FE', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <FileText size={32} color="#0284C7" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Question Paper File</div>
                            <div style={{ fontSize: '0.9rem', color: '#0369A1' }}>{exam.file_name}</div>
                        </div>
                        <Button
                            variant="primary"
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
                        >
                            <Download size={18} style={{ marginRight: '8px' }} />
                            Download
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ExamDetails;
