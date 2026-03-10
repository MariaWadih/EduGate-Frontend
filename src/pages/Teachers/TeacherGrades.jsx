import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Search, Filter, ChevronDown,
    CheckCircle, AlertCircle, BookOpen,
    Users, TrendingUp, Info, Download, Check, Loader
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import client from '../../api/client';
import { teacherService } from '../../services/teacherService';
import { Button, Card, Badge, Input, Avatar } from '../../components/atoms';

const TeacherGrades = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState({}); // { studentId: { score, max, comments } }
    const [selectedTerm, setSelectedTerm] = useState('Test 1');
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    const [isDirty, setIsDirty] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);

    const terms = ['Test 1', 'Test 2', 'Exam 1', 'Test 3', 'Exam 2'];

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await teacherService.getMyClasses();
                setClasses(res.data);
                if (res.data.length > 0) {
                    const firstClass = res.data[0];
                    setSelectedClassId(firstClass.id);
                    if (firstClass.subjects && firstClass.subjects.length > 0) {
                        setSelectedSubjectId(firstClass.subjects[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching classes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedSubjectId) {
            fetchStudentsAndGrades();
        }
    }, [selectedClassId, selectedSubjectId, selectedTerm]);

    const fetchStudentsAndGrades = async () => {
        setLoading(true);
        try {
            // 1. Fetch Students
            const classRes = await client.get(`/classes/${selectedClassId}`);
            setStudents(classRes.data.students || []);

            // 2. Fetch Existing Grades
            const gradesRes = await teacherService.getGrades(selectedClassId, selectedSubjectId);
            const fetchedGrades = gradesRes.data;

            // Map to local state
            const gradeMap = {};
            fetchedGrades.forEach(g => {
                if (g.term === selectedTerm) {
                    gradeMap[g.student_id] = {
                        score: g.score,
                        max_score: g.max_score,
                        comments: g.comments || ''
                    };
                }
            });
            setGrades(gradeMap);

        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-save effect
    useEffect(() => {
        if (!isDirty) return;

        const timeoutId = setTimeout(() => {
            saveGrades();
        }, 1500);

        return () => clearTimeout(timeoutId);
    }, [grades, isDirty]);

    const handleGradeChange = (studentId, field, value) => {
        setIsDirty(true);
        setSaveStatus('saving');
        setGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
                // Ensure max_score has a default if only score is typed
                max_score: field === 'score' && !prev[studentId]?.max_score ? 100 : (prev[studentId]?.max_score || 100)
            }
        }));
    };

    const saveGrades = async () => {
        setSaveStatus('saving');
        const gradesToSave = Object.entries(grades).map(([studentId, data]) => ({
            student_id: studentId,
            subject_id: selectedSubjectId,
            term: selectedTerm,
            score: data.score,
            max_score: data.max_score || 100,
            comments: data.comments
        })).filter(g => g.score !== undefined && g.score !== '');

        if (gradesToSave.length === 0) {
            setSaveStatus('saved');
            setIsDirty(false);
            return;
        }

        try {
            await teacherService.saveGrades(gradesToSave);
            setSaveStatus('saved');
            setIsDirty(false);
        } catch (error) {
            console.error("Error saving grades:", error);
            setSaveStatus('error');
            setNotification({ type: 'error', message: 'Failed to auto-save grades.' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // Calculate class average for current term
    const classAverage = React.useMemo(() => {
        const scores = Object.values(grades)
            .filter(g => g.score !== undefined && g.score !== '')
            .map(g => (Number(g.score) / Number(g.max_score || 100)) * 100);
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }, [grades]);

    const handleDownloadPDF = () => {
        try {
            const doc = new jsPDF();

            // Add Title
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text("Assessment Record", 14, 22);

            // Add Metadata
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);

            const selectedClass = classes.find(c => c.id == selectedClassId);
            const selectedSubject = selectedClass?.subjects?.find(s => s.id == selectedSubjectId);

            const className = selectedClass?.name || 'Unknown Class';
            const subjectName = selectedSubject?.name || 'Unknown Subject';

            doc.text(`Class: ${className}`, 14, 32);
            doc.text(`Subject: ${subjectName}`, 14, 38);
            doc.text(`Term: ${selectedTerm}`, 14, 44);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 50);

            // Prepare Table Data
            const tableColumn = ["ID", "Student Name", "Score", "Max Score", "Comments"];
            const tableRows = [];

            filteredStudents.forEach(student => {
                const currentGrade = grades[student.id] || { score: '-', max_score: '-', comments: '' };
                const studentData = [
                    String(student.id).padStart(4, '0'),
                    student.user?.name || 'N/A',
                    currentGrade.score || '-',
                    currentGrade.max_score || '-',
                    currentGrade.comments || '-'
                ];
                tableRows.push(studentData);
            });

            // Generate Table
            autoTable(doc, {
                startY: 60,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', halign: 'center' },
                styles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
                columnStyles: {
                    0: { halign: 'center' },
                    1: { fontStyle: 'bold' },
                    2: { halign: 'center' },
                    3: { halign: 'center' }
                },
                alternateRowStyles: { fillColor: [249, 250, 251] }
            });

            // Save PDF
            doc.save(`Grades_${className}_${subjectName}_${selectedTerm}.pdf`);
            setNotification({ type: 'success', message: 'PDF downloaded successfully!' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            // Log specific error details
            if (error instanceof Error) {
                console.error("Error message:", error.message);
                console.error("Error stack:", error.stack);
            }
            setNotification({ type: 'error', message: 'Failed to generate PDF. Please try again.' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const filteredStudents = students.filter(s =>
        s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.id).includes(searchTerm)
    );

    const getOptions = () => {
        let options = [];
        classes.forEach(c => {
            if (c.subjects) {
                c.subjects.forEach(s => {
                    options.push({
                        label: `${c.name} - ${s.name}`,
                        classId: c.id,
                        subjectId: s.id
                    });
                });
            }
        });
        return options;
    };

    const currentSelection = getOptions().find(o => o.classId == selectedClassId && o.subjectId == selectedSubjectId);

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', itemsAlign: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 12px 0' }}>Assessment <span style={{ color: 'var(--primary)' }}>Record</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Enter and manage student grades for tests and exams.</p>
                </div>

                <Card style={{ padding: '16px 24px', display: 'flex', gap: '24px', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class Average</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: classAverage >= 70 ? 'var(--success)' : (classAverage >= 50 ? 'var(--warning)' : 'var(--danger)') }}>
                            {classAverage}%
                        </div>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: '#E2E8F0' }}></div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Term</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {selectedTerm}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Controls Bar */}
            <Card style={{ padding: '20px', borderRadius: '16px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', marginLeft: '4px' }}>CLASS & SUBJECT</div>
                        <select
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: 600, outline: 'none' }}
                            value={currentSelection ? `${currentSelection.classId}|${currentSelection.subjectId}` : ''}
                            onChange={(e) => {
                                const [cId, sId] = e.target.value.split('|');
                                setSelectedClassId(cId);
                                setSelectedSubjectId(sId);
                            }}
                        >
                            {getOptions().map((opt, i) => (
                                <option key={i} value={`${opt.classId}|${opt.subjectId}`}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ width: '200px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', marginLeft: '4px' }}>ASSESSMENT TERM</div>
                        <select
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: 600, outline: 'none' }}
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                        >
                            {terms.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                        <Input
                            placeholder="Find student..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '36px', width: '220px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px', justifyContent: 'flex-end', marginRight: '8px' }}>
                        {saveStatus === 'saved' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                                <Check size={16} /> Saved
                            </span>
                        )}
                        {saveStatus === 'saving' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                                <Loader size={16} className="animate-spin" /> Saving...
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>
                                <AlertCircle size={16} /> Error
                            </span>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            minWidth: '150px',
                            justifyContent: 'center',
                            borderColor: 'var(--text-main)',
                            color: 'var(--text-main)',
                            fontWeight: 600
                        }}
                    >
                        <Download size={18} />
                        Download PDF
                    </Button>
                </div>
            </Card>

            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        background: notification.type === 'success' ? '#ECFDF5' : (notification.type === 'error' ? '#FEF2F2' : '#EFF6FF'),
                        color: notification.type === 'success' ? '#047857' : (notification.type === 'error' ? '#B91C1C' : '#1D4ED8'),
                        border: `1px solid ${notification.type === 'success' ? '#A7F3D0' : (notification.type === 'error' ? '#FECACA' : '#BFDBFE')}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontWeight: 600
                    }}
                >
                    {notification.type === 'success' ? <CheckCircle size={20} /> : (notification.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />)}
                    {notification.message}
                </motion.div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '16px' }}>
                        <Users size={40} color="var(--primary-light)" />
                    </motion.div>
                    <div style={{ color: 'var(--text-muted)' }}>Loading student roster...</div>
                </div>
            ) : filteredStudents.length === 0 ? (
                <Card style={{ padding: '60px', textAlign: 'center', border: '2px dashed var(--border-color)' }}>
                    <h3 style={{ margin: 0 }}>No students found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try changing the search filter or select a different class.</p>
                </Card>
            ) : (
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', width: '150px' }}>Score</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', width: '160px' }}>Max Score</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, idx) => {
                                const currentGrade = grades[student.id] || { score: '', max_score: '100', comments: '' };
                                const isPassed = currentGrade.score && (Number(currentGrade.score) / Number(currentGrade.max_score || 100)) >= 0.5;

                                return (
                                    <tr key={student.id} style={{ borderBottom: idx !== filteredStudents.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Avatar name={student.user?.name} size={36} />
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{student.user?.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {String(student.id).padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <Input
                                                type="number"
                                                value={currentGrade.score}
                                                onChange={e => handleGradeChange(student.id, 'score', e.target.value)}
                                                placeholder="-"
                                                style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: isPassed ? 'var(--success)' : 'var(--danger)' }}
                                            />
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <Input
                                                type="number"
                                                value={currentGrade.max_score}
                                                onChange={e => handleGradeChange(student.id, 'max_score', e.target.value)}
                                                style={{ textAlign: 'center', background: '#F8FAFC', color: 'var(--text-muted)', width: '100%', fontWeight: 600 }}
                                            />
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <Input
                                                value={currentGrade.comments}
                                                onChange={e => handleGradeChange(student.id, 'comments', e.target.value)}
                                                placeholder="Add remarks..."
                                                style={{ fontSize: '0.9rem' }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherGrades;
