import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Eye, Download } from 'lucide-react';
import client from '../../api/client';
import { Button, Badge, Input, Label, Avatar } from '../../components/atoms';
import { Modal } from '../../components/molecules';

const ExamSubmissions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // For specific submission details (MCQ answers)
    const [viewSubmissionDetails, setViewSubmissionDetails] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch exam details to get title and questions
                const examRes = await client.get(`/exams/${id}`);
                setExam(examRes.data);

                // Fetch submissions
                const subRes = await client.get(`/exams/${id}/submissions`);
                setSubmissions(subRes.data);
            } catch (error) {
                console.error('Error loading data:', error);
                alert('Failed to load submissions');
                navigate('/exams');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const calculateScore = (sub, ex) => {
        if (sub.status === 'graded') {
            return sub.score !== null && sub.score !== undefined ? sub.score : 0;
        }
        if (!ex || !ex.questions || !sub.mcq_answers) return 0;

        try {
            return ex.questions.reduce((acc, q) => {
                const studentAnswer = sub.mcq_answers[q.id] || sub.mcq_answers[String(q.id)];
                return acc + (studentAnswer == q.correct_option ? (parseFloat(q.points) || 1) : 0);
            }, 0);
        } catch (e) {
            console.error(e);
            return 0;
        }
    };

    const handleGrade = async (submissionId, score) => {
        try {
            await client.post('/exams/grade', {
                submission_id: submissionId,
                score: score
            });
            // Update local state
            setSubmissions(submissions.map(sub =>
                sub.id === submissionId ? { ...sub, score: score, status: 'graded' } : sub
            ));
            // Update selected submission if open
            if (selectedSubmission && selectedSubmission.id === submissionId) {
                setSelectedSubmission({ ...selectedSubmission, score: score, status: 'graded' });
            }
        } catch (error) {
            console.error('Error grading:', error);
            alert('Failed to update grade');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading submissions...</div>
            </div>
        );
    }

    if (!exam) return null;



    return (
        <div style={{ padding: '0 0 40px 0' }}>
            {/* Header / Navigation */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button variant="ghost" onClick={() => navigate('/exams')} style={{ paddingLeft: 0 }}>
                    <ArrowLeft size={20} style={{ marginRight: '8px' }} />
                    Back to All Exams
                </Button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Submissions - {exam.title}</h1>

                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', padding: '16px', borderBottom: '2px solid #F3F4F6', fontWeight: 700, fontSize: '0.9rem', background: '#F9FAFB' }}>
                        <div>Student Name</div>
                        <div>Status</div>
                        <div>Submitted At</div>
                        <div>Score</div>
                        <div>Actions</div>
                    </div>
                    {submissions.map((sub, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', padding: '16px', borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Avatar name={sub.student.user.name} size="sm" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{sub.student.user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {sub.student.id}</div>
                                </div>
                            </div>
                            <div>
                                <Badge
                                    bg={sub.status === 'graded' ? '#DCFCE7' : (sub.status === 'pending' ? '#F3F4F6' : '#EFF6FF')}
                                    color={sub.status === 'graded' ? '#166534' : (sub.status === 'pending' ? '#4B5563' : '#1D4ED8')}
                                >
                                    {sub.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '-'}
                            </div>
                            <div>
                                {sub.status !== 'pending' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Input
                                            key={`${sub.id}-${calculateScore(sub, exam)}`}
                                            type="number"
                                            size="small"
                                            style={{ width: '70px' }}
                                            defaultValue={calculateScore(sub, exam)}
                                            onBlur={(e) => handleGrade(sub.id, e.target.value)}
                                        />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7280' }}>/ {exam.max_score}</span>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>-</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {sub.status !== 'pending' ? (
                                    <>
                                        {/* Show Answers button if it's an MCQ exam */}
                                        {exam.type === 'mcq' && (
                                            <Button size="small" variant="outline" onClick={() => {
                                                setSelectedSubmission(sub);
                                                setViewSubmissionDetails(true);
                                            }}>
                                                <Eye size={14} style={{ marginRight: '6px' }} />
                                                Answers
                                            </Button>
                                        )}

                                        {/* Show Download button if file exists */}
                                        {sub.file_path && (
                                            <Button size="small" variant="outline" onClick={() => {
                                                client.get(`/homework/file/download?path=${sub.file_path}`, { responseType: 'blob' })
                                                    .then(res => {
                                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', sub.file_name);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                    });
                                            }}>
                                                <Download size={14} />
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Waiting for submission</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {submissions.length === 0 && <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>No submissions found.</div>}
                </div>
            </div>

            {/* Submission Details Modal for Single Student Answers */}
            <Modal
                isOpen={viewSubmissionDetails}
                onClose={() => {
                    setViewSubmissionDetails(false);
                    setSelectedSubmission(null);
                }}
                title={`${selectedSubmission?.student.user.name}'s Answers`}
                width="900px"
            >
                {selectedSubmission && exam && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Score Summary */}
                        <div style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Current Score</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                                    {calculateScore(selectedSubmission, exam)} / {exam.max_score}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Submitted</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Questions and Answers */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '500px', overflowY: 'auto' }}>
                            {exam.questions.map((q, idx) => {
                                const studentAnswer = selectedSubmission.mcq_answers?.[q.id];
                                const isCorrect = studentAnswer == q.correct_option;

                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '20px',
                                            border: `2px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
                                            borderRadius: '12px',
                                            background: isCorrect ? '#F0FDF4' : '#FEF2F2'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                                                Q{idx + 1}. {q.question_text}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Badge bg={isCorrect ? '#DCFCE7' : '#FEE2E2'} color={isCorrect ? '#166534' : '#991B1B'}>
                                                    {isCorrect ? '✓ Correct' : '✗ Wrong'}
                                                </Badge>
                                                <Badge bg="#DCFCE7" color="#166534">{q.points} pts</Badge>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            {q.options.map((opt, oIdx) => {
                                                const isStudentChoice = studentAnswer == oIdx;
                                                const isCorrectAnswer = q.correct_option == oIdx;

                                                return (
                                                    <div
                                                        key={oIdx}
                                                        style={{
                                                            padding: '12px 14px',
                                                            borderRadius: '8px',
                                                            border: `2px solid ${isCorrectAnswer ? '#10B981' :
                                                                isStudentChoice ? '#EF4444' :
                                                                    '#E5E7EB'
                                                                }`,
                                                            background:
                                                                isCorrectAnswer ? '#DCFCE7' :
                                                                    isStudentChoice ? '#FEE2E2' :
                                                                        '#F9FAFB',
                                                            fontSize: '0.9rem',
                                                            fontWeight: (isStudentChoice || isCorrectAnswer) ? 600 : 400,
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        {String.fromCharCode(65 + oIdx)}. {opt}
                                                        {isCorrectAnswer && (
                                                            <CheckCircle2
                                                                size={16}
                                                                style={{
                                                                    position: 'absolute',
                                                                    right: '10px',
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    color: '#10B981'
                                                                }}
                                                            />
                                                        )}
                                                        {isStudentChoice && !isCorrectAnswer && (
                                                            <XCircle
                                                                size={16}
                                                                style={{
                                                                    position: 'absolute',
                                                                    right: '10px',
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    color: '#EF4444'
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ExamSubmissions;
