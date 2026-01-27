import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, Save } from 'lucide-react';
import { Button, Card } from '../components/atoms';
import { FormField, SelectField, Table } from '../components/molecules';

const MarkAttendance = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: status }
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        client.get('/teacher/classes').then(res => setClasses(res.data));
    }, []);

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClassId(classId);
        if (classId) {
            client.get(`/classes/${classId}`).then(res => {
                setStudents(res.data.students);
                const initial = {};
                res.data.students.forEach(s => initial[s.id] = 'present');
                setAttendance(initial);
            });
        } else {
            setStudents([]);
        }
    };

    const submitAttendance = () => {
        setLoading(true);
        const records = Object.keys(attendance).map(id => ({
            student_id: id,
            status: attendance[id]
        }));

        client.post('/attendance', {
            class_id: selectedClassId,
            date,
            records
        }).then(() => {
            alert('Attendance submitted successfully!');
        }).catch(err => {
            console.error(err);
            alert('Failed to submit attendance');
        }).finally(() => setLoading(false));
    };

    const statusColors = {
        present: { bg: 'var(--success)', text: 'white' },
        absent: { bg: 'var(--danger)', text: 'white' },
        late: { bg: 'var(--warning)', text: 'white' },
        excused: { bg: 'var(--secondary)', text: 'white' }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '32px' }}>Mark Attendance</h1>

            <Card style={{ marginBottom: '32px', display: 'flex', gap: '24px', padding: '32px' }}>
                <div style={{ flex: 1 }}>
                    <SelectField
                        label="SELECT CLASS"
                        value={selectedClassId}
                        onChange={handleClassChange}
                    >
                        <option value="">Choose a class...</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                        ))}
                    </SelectField>
                </div>
                <div style={{ flex: 1 }}>
                    <FormField
                        label="DATE"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>
            </Card>

            {students.length > 0 && (
                <Card style={{ padding: '0' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0 }}>Student Roster</h3>
                    </div>
                    <div style={{ padding: '32px' }}>
                        <Table style={{ marginBottom: '32px' }}>
                            <Table.Head>
                                <Table.Row>
                                    <Table.Header>Student Name</Table.Header>
                                    <Table.Header align="right">Status</Table.Header>
                                </Table.Row>
                            </Table.Head>
                            <Table.Body>
                                {students.map(s => (
                                    <Table.Row key={s.id}>
                                        <Table.Cell style={{ fontWeight: 600 }}>{s.user.name}</Table.Cell>
                                        <Table.Cell align="right">
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                {['present', 'absent', 'late', 'excused'].map(status => {
                                                    const isActive = attendance[s.id] === status;
                                                    return (
                                                        <Button
                                                            key={status}
                                                            size="small"
                                                            variant={isActive ? 'primary' : 'outline'}
                                                            onClick={() => setAttendance({ ...attendance, [s.id]: status })}
                                                            style={{
                                                                textTransform: 'capitalize',
                                                                minWidth: '80px',
                                                                background: isActive ? statusColors[status].bg : 'transparent',
                                                                borderColor: isActive ? statusColors[status].bg : 'var(--border-color)',
                                                                color: isActive ? statusColors[status].text : 'var(--text-muted)'
                                                            }}
                                                        >
                                                            {status}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>

                        <Button
                            style={{ width: '100%', padding: '16px', height: 'auto', fontSize: '1rem', fontWeight: 700 }}
                            disabled={loading}
                            onClick={submitAttendance}
                            icon={<Save size={20} />}
                        >
                            {loading ? 'Submitting...' : 'Save Attendance Records'}
                        </Button>
                    </div>
                </Card>
            )}

            {selectedClassId && students.length === 0 && (
                <Card style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                        <AlertCircle size={48} style={{ margin: '0 auto' }} />
                    </div>
                    <h3>No Students Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>This class doesn't seem to have any enrolled students.</p>
                </Card>
            )}
        </motion.div>
    );
};

export default MarkAttendance;
