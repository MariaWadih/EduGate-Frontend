import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Download, Calendar, Clock } from 'lucide-react';
import { Button, Card, Badge, Input, Avatar } from '../../components/atoms';
import { Table } from '../../components/molecules';

const HomeworkSubmissions = () => {
    const { id: homeworkId } = useParams();
    const [homework, setHomework] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState({}); // Stores local grade changes { submissionId: score }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch homework details
                const hwRes = await client.get(`/homework/${homeworkId}`);
                const homeworkData = hwRes.data;
                setHomework(homeworkData);

                // Fetch class roster and submissions in parallel
                const [classRes, subRes] = await Promise.all([
                    client.get(`/classes/${homeworkData.class_id}`),
                    client.get(`/homework/${homeworkId}/submissions`)
                ]);

                setStudents(classRes.data.students || []);
                setSubmissions(subRes.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [homeworkId]);

    const handleGradeChange = (submissionId, value) => {
        setGrading(prev => ({ ...prev, [submissionId]: value }));
    };

    const saveGrade = async (submissionId) => {
        const score = grading[submissionId];
        if (score === undefined) return;

        try {
            const response = await client.post('/homework/grade', {
                submission_id: submissionId,
                score: parseFloat(score)
            });
            // Update local state with the returned submission (including graded_at)
            setSubmissions(prev => prev.map(s =>
                s.id === submissionId ? response.data : s
            ));
            alert('Grade saved!');
        } catch (error) {
            alert('Failed to save grade');
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
            });
    };

    // Merge students with their submissions
    const submissionMap = React.useMemo(() => {
        const map = {};
        submissions.forEach(s => {
            map[s.student_id] = s;
        });
        return map;
    }, [submissions]);

    const gradedCount = submissions.filter(s => s.status === 'graded' || s.score !== null).length;
    const averageScore = gradedCount > 0
        ? (submissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedCount).toFixed(1)
        : '-';

    if (loading) return (
        <div style={{ padding: '120px 40px', textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '16px' }}>
                <Save size={40} color="var(--primary)" />
            </motion.div>
            <h3 style={{ color: 'var(--text-main)', margin: 0 }}>Syncing Classroom Roster...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Fetching student submissions and class status.</p>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 0 40px 0' }}>
            <div style={{ marginBottom: '32px' }}>
                <Link to={`/classes/${homework?.class_id}/assignments${homework?.subject_id ? `?subject_id=${homework.subject_id}` : ''}`} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
                    <Button variant="ghost" style={{ paddingLeft: 0 }}>
                        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                        Back to Assignments
                    </Button>
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                        <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '12px', display: 'inline-block' }}>
                            {homework?.subject?.name || 'Subject'}
                        </Badge>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{homework?.title}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', lineHeight: '1.6' }}>{homework?.description}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Card style={{ padding: '16px 24px', minWidth: '140px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{submissions.length} / {students.length}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Submissions</div>
                        </Card>
                        <Card style={{ padding: '16px 24px', minWidth: '140px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>{averageScore}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Avg. Score</div>
                        </Card>
                    </div>
                </div>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <Table.Head>
                        <Table.Row style={{ background: '#F9FAFB' }}>
                            <Table.Header>Student</Table.Header>
                            <Table.Header>Submitted Date</Table.Header>
                            <Table.Header>Content & Files</Table.Header>
                            <Table.Header>Status</Table.Header>
                            <Table.Header>Grade (0-100)</Table.Header>
                            <Table.Header align="right">Actions</Table.Header>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {students.map(student => {
                            const sub = submissionMap[student.id];
                            return (
                                <Table.Row key={student.id} style={{ transition: 'background 0.2s' }}>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Avatar name={student.user?.name} size={40} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.user?.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {student.id} | {student.user?.email}</div>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {sub ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                                                    <Calendar size={14} className="text-muted" />
                                                    {new Date(sub.submitted_at || sub.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    <Clock size={14} />
                                                    {new Date(sub.submitted_at || sub.created_at).toLocaleTimeString(undefined, {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <Badge bg="#FEE2E2" color="#EF4444" style={{ fontWeight: 600, padding: '4px 10px' }}>
                                                No Submission
                                            </Badge>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {sub ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {sub.content && (
                                                    <div style={{ maxWidth: '300px', background: '#F3F4F6', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                                        {sub.content}
                                                    </div>
                                                )}
                                                {sub.file_path && (
                                                    <div
                                                        onClick={() => handleDownload(sub.file_path, sub.file_name)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                            padding: '6px 10px', background: 'var(--primary-light)', borderRadius: '6px',
                                                            fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer',
                                                            width: 'fit-content', border: '1px solid rgba(79, 70, 229, 0.2)'
                                                        }}
                                                    >
                                                        <Download size={14} />
                                                        {sub.file_name}
                                                    </div>
                                                )}
                                                {!sub.content && !sub.file_path && <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No attachments</span>}
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No work provided</span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {sub ? (
                                            sub.status === 'graded' || sub.score !== null ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <Badge bg="#ECFDF5" color="#059669">Graded</Badge>
                                                    {sub.graded_at && (
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={10} />
                                                            {new Date(sub.graded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge bg="#FFFBEB" color="#D97706">Pending</Badge>
                                            )
                                        ) : (
                                            <Badge bg="#FEF2F2" color="#DC2626">Missing</Badge>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {sub && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="-"
                                                    value={grading[sub.id] !== undefined ? grading[sub.id] : (sub.score || '')}
                                                    onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                                                    style={{ width: '80px', textAlign: 'center', fontWeight: 600 }}
                                                />
                                            </div>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        {sub && (
                                            <Button
                                                size="sm"
                                                onClick={() => saveGrade(sub.id)}
                                                disabled={grading[sub.id] === undefined}
                                                variant={grading[sub.id] !== undefined ? 'primary' : 'outline'}
                                            >
                                                <Save size={14} style={{ marginRight: '6px' }} />
                                                Save
                                            </Button>
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
                {students.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ background: '#F3F4F6', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                            <Save size={24} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>No students found</h3>
                        <p style={{ margin: 0 }}>This class appears to be empty.</p>
                    </div>
                )}
            </Card>
        </motion.div>
    );
};

export default HomeworkSubmissions;
