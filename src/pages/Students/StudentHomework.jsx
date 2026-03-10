import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Calendar, CheckCircle, Clock, Download,
    Upload, Send, AlertCircle, RefreshCcw, BookOpen,
    Search, Filter, ChevronRight, FileUp
} from 'lucide-react';
import client from '../../api/client';
import { Button, Card, Badge, Input, Label, Avatar } from '../../components/atoms';
import { Modal } from '../../components/molecules';

const StudentHomework = () => {
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedHw, setSelectedHw] = useState(null);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchHomework = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await client.get('/homework/my');
            setHomeworks(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error fetching homework", error);
            setHomeworks([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHomework();
    }, []);

    const handleDownload = (path, filename) => {
        client.get(`/homework/file/download?path=${path}`, { responseType: 'blob' })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('homework_id', selectedHw.id);
            formData.append('content', content);
            if (file) {
                formData.append('file', file);
            }

            await client.post('/homework/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsSubmissionModalOpen(false);
            setContent('');
            setFile(null);
            fetchHomework(true);
        } catch (error) {
            alert('Failed to submit homework');
        } finally {
            setSubmitting(false);
        }
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
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Retrieving your assignments...</div>
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
                    <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>Assignments</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '4px' }}>Submit your work and track feedback from your instructors.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" onClick={() => fetchHomework(true)} disabled={refreshing}>
                        <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} style={{ marginRight: '8px' }} />
                        Refresh
                    </Button>
                </div>
            </div>

            {homeworks.length === 0 ? (
                <Card style={{ padding: '80px 20px', textAlign: 'center', borderStyle: 'dashed' }}>
                    <div style={{ background: 'var(--primary-light)', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <BookOpen size={32} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>No Homework Assigned</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>You're all caught up! Keep checking back for new tasks from your teachers.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '28px' }}>
                    {homeworks.map(hw => {
                        const submission = hw.submissions && hw.submissions[0];
                        const isSubmitted = !!submission;
                        const isGraded = submission?.status === 'graded';
                        const isOverdue = new Date(hw.due_date) < new Date() && !isSubmitted;

                        return (
                            <motion.div key={hw.id} variants={itemVariants} whileHover={{ y: -5 }}>
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
                                            <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontWeight: 800 }}>{hw.subject?.name || 'General'}</Badge>
                                            {isGraded ? (
                                                <Badge bg="#DCFCE7" color="#059669" style={{ fontWeight: 800 }}>Graded</Badge>
                                            ) : (isSubmitted ? (
                                                <Badge bg="#EFF6FF" color="#2563EB" style={{ fontWeight: 800 }}>Submitted</Badge>
                                            ) : (isOverdue ? (
                                                <Badge bg="#FEE2E2" color="#E11D48" style={{ fontWeight: 800 }}>Overdue</Badge>
                                            ) : (
                                                <Badge bg="#FFFBEB" color="#D97706" style={{ fontWeight: 800 }}>Pending</Badge>
                                            )))}
                                        </div>

                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 800 }}>{hw.title}</h3>
                                        <p style={{
                                            color: 'var(--text-muted)',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.6',
                                            marginBottom: '24px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {hw.description || 'No specific instructions provided. Follow the general guidelines for this subject.'}
                                        </p>

                                        {hw.file_path && (
                                            <div
                                                onClick={() => handleDownload(hw.file_path, hw.file_name)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '12px',
                                                    fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer',
                                                    border: '1px solid var(--border-color)', width: 'fit-content',
                                                    fontWeight: 700, transition: 'all 0.2s', marginBottom: '16px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                            >
                                                <FileText size={16} />
                                                Resources: {hw.file_name}
                                            </div>
                                        )}

                                        {isSubmitted && (
                                            <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Your Submission</div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                    {submission.content || 'Submission with attachment'}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '24px 28px', background: '#FAFAFA', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Due Date</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isOverdue ? '#E11D48' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} /> {new Date(hw.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>

                                        {isGraded ? (
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Result</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>
                                                    {Math.round(submission.score)} <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>/ 100</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    setSelectedHw(hw);
                                                    setIsSubmissionModalOpen(true);
                                                    setContent(submission?.content || '');
                                                }}
                                                variant={isSubmitted ? 'outline' : 'primary'}
                                                style={{ borderRadius: '10px', padding: '10px 20px' }}
                                            >
                                                {isSubmitted ? 'Update' : 'Submit'}
                                                <Upload size={14} style={{ marginLeft: '8px' }} />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {isSubmissionModalOpen && (
                    <Modal
                        isOpen={isSubmissionModalOpen}
                        onClose={() => setIsSubmissionModalOpen(false)}
                        title={selectedHw?.submissions?.[0] ? 'Modify Submission' : 'Submit Work'}
                        width="600px"
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Subject</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>{selectedHw?.title}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Label style={{ fontWeight: 800 }}>Work Content</Label>
                                <textarea
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        minHeight: '160px',
                                        fontSize: '1rem',
                                        lineHeight: '1.6',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        background: '#F9FAFB'
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px var(--primary-light)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = '#F9FAFB'; e.target.style.boxShadow = 'none'; }}
                                    placeholder="Add notes or your response here..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Label style={{ fontWeight: 800 }}>Attachments</Label>
                                <div style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    textAlign: 'center',
                                    background: '#F9FAFB',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                    onClick={() => document.getElementById('hw-file').click()}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                >
                                    <input
                                        type="file"
                                        id="hw-file"
                                        style={{ display: 'none' }}
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                    <FileUp size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                        {file ? file.name : (selectedHw?.submissions?.[0]?.file_name ? `Replace: ${selectedHw.submissions[0].file_name}` : 'Click to upload files')}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>PDF, ZIP, DOCX or Images up to 10MB</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <Button type="button" variant="ghost" onClick={() => setIsSubmissionModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={submitting} style={{ padding: '12px 32px' }}>
                                    {submitting ? 'Processing...' : 'Submit Assignment'}
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudentHomework;

