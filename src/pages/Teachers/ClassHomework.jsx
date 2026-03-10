import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Calendar, FileText, CheckCircle, Clock, ArrowLeft, Download, Upload } from 'lucide-react';
import { Button, Card, Badge, Input, Label } from '../../components/atoms';
import { Modal } from '../../components/molecules';
import { useAuth } from '../../hooks';

const ClassHomework = () => {
    const { user } = useAuth();
    const { id: classId } = useParams();
    const [searchParams] = useSearchParams();
    const filterSubjectId = searchParams.get('subject_id');
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newHomework, setNewHomework] = useState({ title: '', description: '', due_date: '', subject_id: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [classData, setClassData] = useState(null);

    // Filter subjects to only those taught by the current teacher
    const teacherSubjects = React.useMemo(() => {
        try {
            if (!classData?.subjects) return [];
            return classData.subjects.filter(s => {
                const isAdmin = user?.role === 'admin';
                const teachesThis = user?.teacher?.id && s.pivot?.teacher_id === user?.teacher?.id;
                return isAdmin || teachesThis;
            });
        } catch (e) {
            console.error("Error filtering teacher subjects:", e);
            return [];
        }
    }, [classData, user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching classroom data...");
                const [classRes, homeworkRes] = await Promise.all([
                    client.get(`/classes/${classId}`),
                    client.get(`/homework?class_id=${classId}${filterSubjectId ? `&subject_id=${filterSubjectId}` : ''}`)
                ]);
                setClassData(classRes.data);
                setHomeworks(homeworkRes.data);
                console.log("Classroom data loaded:", classRes.data);
            } catch (error) {
                console.error("Error loading classroom data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (classId) fetchData();
    }, [classId]);

    // Set default subject if teacher has only one or none selected
    useEffect(() => {
        if (showCreateModal && teacherSubjects.length > 0 && !newHomework.subject_id) {
            const defaultSubjectId = filterSubjectId || teacherSubjects[0].id;
            console.log("Setting default subject ID:", defaultSubjectId);
            setNewHomework(prev => ({ ...prev, subject_id: defaultSubjectId }));
        }
    }, [showCreateModal, teacherSubjects, newHomework.subject_id, filterSubjectId]);

    const handleCreate = async (e) => {
        if (e) e.preventDefault();
        console.log("Submitting new homework:", newHomework);

        try {
            const subjectId = newHomework.subject_id || (teacherSubjects[0]?.id);
            if (!subjectId) {
                alert('Please select a subject');
                return;
            }

            const formData = new FormData();
            formData.append('class_id', classId);
            formData.append('subject_id', subjectId);
            formData.append('title', newHomework.title);
            formData.append('description', newHomework.description);
            formData.append('due_date', newHomework.due_date);
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            await client.post('/homework', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("Homework created successfully!");
            setShowCreateModal(false);
            setNewHomework({ title: '', description: '', due_date: '', subject_id: '' });
            setSelectedFile(null);

            const res = await client.get(`/homework?class_id=${classId}${filterSubjectId ? `&subject_id=${filterSubjectId}` : ''}`);
            setHomeworks(res.data);
        } catch (error) {
            console.error("Error creating homework:", error);
            alert('Failed to create homework. Check your permissions.');
        }
    };

    const handleDownload = (path, filename) => {
        client.get(`/homework/file/download?path=${path}`, { responseType: 'blob' })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
            }).catch(e => console.error("Download failed:", e));
    };

    if (loading) return (
        <div style={{ padding: '120px 40px', textAlign: 'center' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', marginBottom: '16px' }}
            >
                <Clock size={40} color="var(--primary)" />
            </motion.div>
            <h3 style={{ color: 'var(--text-main)', margin: 0 }}>Loading Classroom...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Preparing assignments and student records.</p>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 0 40px 0' }}>
            <div style={{ marginBottom: '40px' }}>
                <Link to="/assignments" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
                    <Button variant="ghost" style={{ paddingLeft: 0 }}>
                        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                        Back to Assignments
                    </Button>
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={24} />
                            </div>
                            <h1 style={{ margin: 0, fontSize: '2rem' }}>
                                {classData?.name || 'Classroom'} {classData?.section && `— Section ${classData.section}`}
                                {filterSubjectId && classData?.subjects?.find(s => s.id.toString() === filterSubjectId) && (
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                        {' '}— {classData.subjects.find(s => s.id.toString() === filterSubjectId).name}
                                    </span>
                                )}
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, paddingLeft: '60px' }}>
                            {filterSubjectId
                                ? `Manage assignments for ${classData?.subjects?.find(s => s.id.toString() === filterSubjectId)?.name} in this class.`
                                : 'Manage homework assignments and grading for this class.'}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            console.log("Triggering modal open...");
                            setShowCreateModal(true);
                        }}
                        style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)' }}
                    >
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        Create New Assignment
                    </Button>
                </div>
            </div>

            {(!homeworks || homeworks.length === 0) ? (
                <Card style={{ padding: '80px 40px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--border-color)', background: 'transparent' }}>
                    <div style={{ background: '#F3F4F6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <BookOpen size={32} color="var(--text-muted)" />
                    </div>
                    <h2 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>No Assignments Yet</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500, maxWidth: '400px', margin: '0 auto 24px auto' }}>
                        Create your first homework assignment to get started. Students will be notified immediately.
                    </p>
                    <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                        Create First Assignment
                    </Button>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                    {homeworks.map(hw => {
                        const isOverdue = new Date(hw.due_date) < new Date();
                        return (
                            <Card key={hw.id} style={{
                                padding: '0',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                overflow: 'hidden',
                                border: '1px solid rgba(0,0,0,0.05)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease',
                                cursor: 'default'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ padding: '24px', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <Badge bg={isOverdue ? '#FEF2F2' : '#ECFDF5'} color={isOverdue ? '#DC2626' : '#059669'}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {isOverdue ? <Clock size={12} /> : <CheckCircle size={12} />}
                                                {isOverdue ? 'Overdue/Closed' : 'Active'}
                                            </div>
                                        </Badge>
                                        <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontWeight: 600 }}>
                                            Section {hw.school_class?.section || 'A'}
                                        </Badge>
                                    </div>

                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>{hw.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 20px 0', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {hw.description || 'No description provided.'}
                                    </p>

                                    {hw.file_path && (
                                        <div
                                            onClick={() => handleDownload(hw.file_path, hw.file_name)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 14px', background: '#F9FAFB', borderRadius: '10px',
                                                fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer',
                                                border: '1px solid var(--border-color)', width: 'fit-content',
                                                fontWeight: 600, transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                        >
                                            <Download size={14} />
                                            {hw.file_name}
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '20px 24px', background: '#FAFAFA', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOverdue ? '#DC2626' : 'var(--text-main)', fontSize: '0.9rem', fontWeight: 650 }}>
                                            <Calendar size={14} />
                                            {new Date(hw.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <Link to={`/homework/${hw.id}/submissions`} style={{ textDecoration: 'none' }}>
                                        <Button size="sm" variant="outline" style={{ background: 'white', borderRadius: '8px', padding: '8px 16px' }}>
                                            Submissions
                                            <ArrowLeft size={14} style={{ marginLeft: '8px', transform: 'rotate(180deg)' }} />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {showCreateModal && (
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Create New Assignment"
                    width="550px"
                >
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <Label>Assignment Title</Label>
                                <Input
                                    placeholder="e.g. Weekly Quiz #1"
                                    value={newHomework.title}
                                    onChange={e => setNewHomework({ ...newHomework, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Section</Label>
                                <select
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'white',
                                        fontSize: '0.95rem',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        height: '46px'
                                    }}
                                    value={newHomework.subject_id}
                                    onChange={e => setNewHomework({ ...newHomework, subject_id: e.target.value })}
                                    required
                                    disabled={!!filterSubjectId} // Disable if subject is fixed
                                >
                                    <option value="">Select Section</option>
                                    {filterSubjectId ? (
                                        <option value={filterSubjectId}>Section {classData?.section || 'A'}</option>
                                    ) : (
                                        teacherSubjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label>Description & Instructions</Label>
                            <textarea
                                placeholder="Provide details about the assignment..."
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    minHeight: '120px',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    lineHeight: '1.5',
                                    resize: 'vertical'
                                }}
                                value={newHomework.description}
                                onChange={e => setNewHomework({ ...newHomework, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Reference Material (Optional)</Label>
                            <div style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: '12px',
                                padding: '24px',
                                textAlign: 'center',
                                background: '#F9FAFB',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                                onClick={() => {
                                    const el = document.getElementById('teacher-hw-file');
                                    if (el) el.click();
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                            >
                                <input
                                    type="file"
                                    id="teacher-hw-file"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        console.log("File selected:", e.target.files[0]);
                                        setSelectedFile(e.target.files[0]);
                                    }}
                                />
                                <div style={{ background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    <Upload size={18} color="var(--primary)" />
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    {selectedFile ? selectedFile.name : 'Click to upload a reference file'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    PDF, DOCX, ZIP or Images (Max 10MB)
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                value={newHomework.due_date}
                                onChange={e => setNewHomework({ ...newHomework, due_date: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-muted)' }}>
                                Cancel
                            </Button>
                            <Button type="submit" style={{ padding: '10px 28px' }}>
                                Create Assignment
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </motion.div>
    );
};

export default ClassHomework;
