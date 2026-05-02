import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { Users, Mail, User, ArrowLeft, Calendar } from 'lucide-react';
import { Avatar, Badge, Card, Button } from '../../components/atoms';
import { Table, Modal } from '../../components/molecules';

const getStatusColor = (status) => {
    switch (status) {
        case 'present': return 'var(--success)';
        case 'absent': return 'var(--danger)';
        case 'late': return 'var(--warning)';
        default: return 'var(--text-muted)';
    }
};

const ClassRoster = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // Attendance modal state
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    useEffect(() => {
        client.get(`/classes/${id}`)
            .then(res => setData(res.data))
            .catch(err => {
                console.error("Failed to fetch class roster:", err);
                setError(err.response?.data?.message || err.message || "Failed to load data");
            });
    }, [id]);

    const handleViewAttendance = (student) => {
        setSelectedStudent(student);
        setShowAttendanceModal(true);
        setAttendanceLoading(true);
        client.get(`/attendance/student/${student.id}`)
            .then(res => setAttendanceRecords(res.data))
            .catch(err => console.error(err))
            .finally(() => setAttendanceLoading(false));
    };

    // Summary counts
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const attendanceRate = attendanceRecords.length > 0
        ? Math.round((presentCount / attendanceRecords.length) * 100)
        : 0;

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>
            <h3>Error loading class</h3>
            <p>{error}</p>
        </div>
    );

    if (!data) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Users size={48} color="var(--primary)" />
            </motion.div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: '32px' }}>
                <Link to="/classes" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost" style={{ paddingLeft: 0, marginBottom: '12px' }}>
                        <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                        Back to Classes
                    </Button>
                </Link>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>CLASS MANAGEMENT</div>
                <h1 style={{ margin: 0 }}>{data.name} - Students Roster</h1>
            </div>

            <Card style={{ padding: '0' }}>
                <Table>
                    <Table.Head>
                        <Table.Row>
                            <Table.Header align="center" style={{ width: '60px' }}>#</Table.Header>
                            <Table.Header>Student</Table.Header>
                            <Table.Header>Student Email</Table.Header>
                            <Table.Header>Parents</Table.Header>
                            <Table.Header>Parent Emails</Table.Header>
                            <Table.Header align="right">Status</Table.Header>
                            <Table.Header align="right">Attendance</Table.Header>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {data.students.map((s, i) => (
                            <Table.Row key={s.id}>
                                <Table.Cell align="center" style={{ color: 'var(--text-light)', fontWeight: 700 }}>{i + 1}</Table.Cell>
                                <Table.Cell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Avatar name={s.user.name} size={32} />
                                        <div style={{ fontWeight: 600 }}>{s.user.name}</div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell style={{ color: 'var(--text-muted)' }}>{s.user.email}</Table.Cell>
                                <Table.Cell>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {s.parents && s.parents.length > 0 ? s.parents.map(p => (
                                            <div key={p.id} style={{ fontSize: '0.9rem' }}>{p.user?.name || 'Unknown Parent'}</div>
                                        )) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {s.parents && s.parents.length > 0 ? s.parents.map(p => (
                                            <div key={p.id} style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.user?.email || 'No Email'}</div>
                                        )) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                    </div>
                                </Table.Cell>
                                <Table.Cell align="right">
                                    <Badge bg="var(--success-light)" color="var(--success)" style={{ fontWeight: 700 }}>
                                        Active
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell align="right">
                                    <Button
                                        variant="outline"
                                        size="small"
                                        icon={<Calendar size={14} />}
                                        onClick={() => handleViewAttendance(s)}
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        View
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
                {data.students.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No students enrolled in this class.
                    </div>
                )}
            </Card>

            {/* Attendance Modal */}
            <Modal
                isOpen={showAttendanceModal}
                onClose={() => { setShowAttendanceModal(false); setAttendanceRecords([]); }}
                title={`Attendance — ${selectedStudent?.user?.name}`}
                width="650px"
            >
                {attendanceLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Loading records...
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                            {[
                                { label: 'Rate', value: `${attendanceRate}%`, color: 'var(--primary)' },
                                { label: 'Present', value: presentCount, color: 'var(--success)' },
                                { label: 'Absent', value: absentCount, color: 'var(--danger)' },
                                { label: 'Late', value: lateCount, color: 'var(--warning)' },
                            ].map((s, i) => (
                                <div key={i} style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Records Table */}
                        {attendanceRecords.length > 0 ? (
                            <div style={{ maxHeight: '350px', overflowY: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#F9FAFB' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Date</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceRecords.map((rec, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.9rem' }}>
                                                    {new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <Badge
                                                        bg={`${getStatusColor(rec.status)}15`}
                                                        color={getStatusColor(rec.status)}
                                                        style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}
                                                    >
                                                        {rec.status}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    {rec.remarks || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '12px' }}>
                                No attendance records found for this student.
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </motion.div>
    );
};

export default ClassRoster;