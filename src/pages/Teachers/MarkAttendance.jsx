import React, { useEffect, useState } from 'react';
import { teacherService, academicService } from '../../services';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, Save } from 'lucide-react';
import { Button, Card, Input, Avatar } from '../../components/atoms';
import { FormField, SelectField, Table } from '../../components/molecules';

const MarkAttendance = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: status }
    const [remarks, setRemarks] = useState({}); // { studentId: remark }
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        teacherService.getMyClasses().then(res => setClasses(res.data));
    }, []);


    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClassId(classId);
        if (classId) {
            academicService.getClass(classId).then(res => {
                setStudents(res.data.students);
            });
        } else {
            setStudents([]);
            setAttendance({});
            setRemarks({});
        }
    };

    useEffect(() => {
        if (selectedClassId && date && students.length > 0) {
            setLoading(true);
            teacherService.checkAttendance(selectedClassId, date)
                .then(res => {
                    const records = res.data;
                    const newAttendance = {};
                    const newRemarks = {};

                    students.forEach(s => {
                        const rec = records.find(r => r.student_id === s.id);
                        newAttendance[s.id] = rec ? rec.status : 'present';
                        newRemarks[s.id] = rec ? (rec.remarks || '') : '';
                    });

                    setAttendance(newAttendance);
                    setRemarks(newRemarks);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [selectedClassId, date, students]);

    const submitAttendance = () => {
        setLoading(true);
        const records = Object.keys(attendance).map(id => ({
            student_id: id,
            status: attendance[id],
            remarks: remarks[id] || ''
        }));

        teacherService.storeAttendance({
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
        late: { bg: 'var(--warning)', text: 'white' }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '32px' }}>Mark Attendance</h1>

            <Card className="flex-responsive" style={{ marginBottom: '32px', padding: '32px' }}>
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
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', tableLayout: 'fixed' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB', width: '25%' }}>Student Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB', width: '35%' }}>Attendance Status</th>
                                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB', width: '40%' }}>Notes / Excuse</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, index) => (
                                    <tr key={s.id} style={{ background: index % 2 === 0 ? 'transparent' : '#F9FAFB' }}>
                                        <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Avatar size="sm" style={{ background: 'var(--primary)', color: 'white', fontWeight: 600 }}>
                                                    {s.user.name.charAt(0)}
                                                </Avatar>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{s.user.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>ID: {s.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                gap: '4px',
                                                background: '#F3F4F6',
                                                padding: '4px',
                                                borderRadius: '10px'
                                            }}>
                                                {['present', 'absent', 'late'].map(status => {
                                                    const isActive = attendance[s.id] === status;
                                                    return (
                                                        <button
                                                            key={status}
                                                            onClick={() => setAttendance({ ...attendance, [s.id]: status })}
                                                            style={{
                                                                padding: '6px 16px',
                                                                borderRadius: '8px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600,
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                textTransform: 'capitalize',
                                                                transition: 'all 0.2s',
                                                                background: isActive ? statusColors[status].bg : 'transparent',
                                                                color: isActive ? 'white' : '#6B7280',
                                                                boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                                            }}
                                                        >
                                                            {status}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                                            <Input
                                                placeholder={attendance[s.id] === 'present' ? "No remarks required" : "Add student note..."}
                                                value={remarks[s.id] || ''}
                                                onChange={e => setRemarks({ ...remarks, [s.id]: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    height: '38px',
                                                    fontSize: '0.85rem',
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '8px',
                                                    background: attendance[s.id] === 'present' ? '#F9FAFB' : 'white',
                                                    opacity: attendance[s.id] === 'present' ? 0.5 : 1
                                                }}
                                                disabled={attendance[s.id] === 'present'}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
