import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Calendar, Clock, FileText,
    ChevronRight, MoreVertical, Trash2, Edit,
    AlertCircle, Users, Eye,
    PlusCircle, X, Trash
} from 'lucide-react';
import client from '../../api/client';
import { Button, Card, Badge, Input, Label, Avatar } from '../../components/atoms';
import { Modal, SelectField } from '../../components/molecules';

const TeacherExams = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    const [newExam, setNewExam] = useState({
        title: '',
        description: '',
        class_id: '',
        subject_id: '',
        type: 'file',
        start_time: '',
        end_time: '',
        duration_minutes: '',
        max_score: 100,
        questions: [{ question_text: '', options: ['', '', '', ''], correct_option: '0', points: 1 }]
    });
    const [file, setFile] = useState(null);

    const fetchData = async () => {
        try {
            const [examsRes, classesRes] = await Promise.all([
                client.get('/exams'),
                client.get('/teacher/classes')
            ]);
            setExams(examsRes.data);
            setClasses(classesRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateExam = async (e) => {
        e.preventDefault();
        // Validation
        if (newExam.type === 'mcq' && newExam.questions.some(q => !q.question_text || q.options.some(o => !o))) {
            alert('Please fill in all question fields');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newExam.title);
            formData.append('subject_id', newExam.subject_id);
            formData.append('class_id', newExam.class_id);
            formData.append('type', newExam.type);
            formData.append('start_time', newExam.start_time);
            formData.append('end_time', newExam.end_time);

            if (newExam.type === 'file') {
                if (!file) {
                    alert('Please upload a file');
                    return;
                }
                formData.append('file', file);
            } else {
                formData.append('questions', JSON.stringify(newExam.questions));
            }

            await client.post('/exams', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Exam created successfully');
            setIsModalOpen(false);
            setNewExam({
                title: '',
                subject_id: '',
                class_id: '',
                type: 'file',
                start_time: '',
                end_time: '',
                questions: [{ question_text: '', options: ['', '', '', ''], correct_option: '0', points: 1 }]
            });
            setFile(null);

            // Refresh list
            const res = await client.get('/exams');
            setExams(res.data);
        } catch (error) {
            console.error('Error creating exam:', error);
            alert('Failed to create exam');
        }
    };


    if (loading) return <div style={{ padding: '40px' }}>Loading Exams...</div>;

    const teacherSubjects = classes.flatMap(c => c.subjects.map(s => ({ ...s, classId: c.id, className: c.name, section: c.section })));

    return (
        <div style={{ padding: '0 0 40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Exams & Quizzes</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Create and manage assessments for your classes.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Create New Exam
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {exams.map(exam => {
                    const now = new Date();
                    const start = new Date(exam.start_time);
                    const end = new Date(exam.end_time);
                    const isUpcoming = start > now;
                    const isActive = now >= start && now <= end;
                    const isFinished = now > end;

                    return (
                        <Card key={exam.id} style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <Badge
                                    bg={exam.type === 'mcq' ? 'var(--primary-light)' : '#E0F2FE'}
                                    color={exam.type === 'mcq' ? 'var(--primary)' : '#0369A1'}
                                >
                                    {exam.type.toUpperCase()}
                                </Badge>
                                <Badge bg={isActive ? '#DCFCE7' : (isUpcoming ? '#FEF9C3' : '#F3F4F6')} color={isActive ? '#166534' : (isUpcoming ? '#854D0E' : '#4B5563')}>
                                    {isActive ? 'Active Now' : (isUpcoming ? 'Upcoming' : 'Closed')}
                                </Badge>
                            </div>

                            <h3 style={{ margin: '0 0 8px 0' }}>{exam.title}</h3>
                            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={14} /> {start.toLocaleDateString()}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} /> {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', marginTop: '16px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
                                    {exam.subject?.name} — Section {exam.school_class?.section}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button variant="ghost" size="small" onClick={() => navigate(`/teacher/exams/${exam.id}/view`)}>
                                        <Eye size={16} style={{ marginRight: '8px' }} />
                                        View
                                    </Button>
                                    <Button variant="ghost" size="small" onClick={() => navigate(`/teacher/exams/${exam.id}/submissions`)}>
                                        <Users size={16} style={{ marginRight: '8px' }} />
                                        Submissions
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Create Exam Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Assessment" width="800px">
                <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <Label>Exam Title</Label>
                            <Input placeholder="e.g. Midterm Physics" value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })} required />
                        </div>
                        <div>
                            <Label>Subject & Class</Label>
                            <select
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                onChange={e => {
                                    const [subjectId, classId] = e.target.value.split('|');
                                    setNewExam({ ...newExam, subject_id: subjectId, class_id: classId });
                                }}
                                required
                            >
                                <option value="">Select subject & class...</option>
                                {teacherSubjects.map((s, i) => (
                                    <option key={i} value={`${s.id}|${s.classId}`}>{s.name} ({s.className} - Section {s.section})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                            <Label>Type</Label>
                            <select
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                value={newExam.type}
                                onChange={e => setNewExam({ ...newExam, type: e.target.value })}
                            >
                                <option value="file">File Upload</option>
                                <option value="mcq">Multiple Choice</option>
                            </select>
                        </div>
                        <div>
                            <Label>Start Date & Time</Label>
                            <Input type="datetime-local" value={newExam.start_time} onChange={e => setNewExam({ ...newExam, start_time: e.target.value })} required />
                        </div>
                        <div>
                            <Label>End Date & Time</Label>
                            <Input type="datetime-local" value={newExam.end_time} onChange={e => setNewExam({ ...newExam, end_time: e.target.value })} required />
                        </div>
                    </div>

                    {newExam.type === 'file' ? (
                        <div style={{ border: '2px dashed var(--border-color)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                            <Label>Upload Exam Question File (PDF/DOCX)</Label>
                            <input type="file" onChange={e => setFile(e.target.files[0])} style={{ marginTop: '12px' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Label>Questions</Label>
                                <Button type="button" size="small" variant="ghost" onClick={() => setNewExam({ ...newExam, questions: [...newExam.questions, { question_text: '', options: ['', '', '', ''], correct_option: '0', points: 1 }] })}>
                                    <PlusCircle size={14} style={{ marginRight: '4px' }} /> Add Question
                                </Button>
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '4px' }}>
                                {newExam.questions.map((q, qIdx) => (
                                    <div key={qIdx} style={{ padding: '16px', border: '1px solid #F3F4F6', borderRadius: '12px', marginBottom: '16px', background: '#FAFAFA' }}>
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <Label>Question {qIdx + 1}</Label>
                                                <Input value={q.question_text} onChange={e => {
                                                    const qs = [...newExam.questions];
                                                    qs[qIdx].question_text = e.target.value;
                                                    setNewExam({ ...newExam, questions: qs });
                                                }} placeholder="Enter question..." />
                                            </div>
                                            <div style={{ width: '80px' }}>
                                                <Label>Points</Label>
                                                <Input type="number" value={q.points} onChange={e => {
                                                    const qs = [...newExam.questions];
                                                    qs[qIdx].points = e.target.value;
                                                    setNewExam({ ...newExam, questions: qs });
                                                }} />
                                            </div>
                                            {newExam.questions.length > 1 && (
                                                <Button type="button" variant="ghost" style={{ marginTop: '24px', color: 'var(--danger)' }} onClick={() => {
                                                    const qs = newExam.questions.filter((_, i) => i !== qIdx);
                                                    setNewExam({ ...newExam, questions: qs });
                                                }}>
                                                    <Trash size={16} />
                                                </Button>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input type="radio" checked={q.correct_option == oIdx} onChange={() => {
                                                        const qs = [...newExam.questions];
                                                        qs[qIdx].correct_option = oIdx.toString();
                                                        setNewExam({ ...newExam, questions: qs });
                                                    }} />
                                                    <Input size="small" placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => {
                                                        const qs = [...newExam.questions];
                                                        qs[qIdx].options[oIdx] = e.target.value;
                                                        setNewExam({ ...newExam, questions: qs });
                                                    }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Assessment</Button>
                    </div>
                </form>
            </Modal>


        </div>
    );
};

export default TeacherExams;
