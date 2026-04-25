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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>Assessment <span style={{ color: 'var(--primary)' }}>Record</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>Enter and manage student grades for tests and exams.</p>
                </div>

                <div style={{ display: 'flex', background: 'white', padding: '12px 24px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', gap: '40px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Class Average</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--danger)', lineHeight: 1 }}>{classAverage}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Term</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--primary)', lineHeight: 1 }}>{selectedTerm}</div>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <Card style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Class & Subject</div>
                    <select
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 750, fontSize: '0.95rem', background: '#F8FAFC', outline: 'none' }}
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
                <div style={{ width: '220px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Assessment Term</div>
                    <select
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 750, fontSize: '0.95rem', outline: 'none' }}
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                    >
                        {terms.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div style={{ width: '280px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--text-muted)' }} />
                    <Input
                        placeholder="Find student..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '44px', paddingRight: '16px', height: '52px', borderRadius: '12px' }}
                    />
                </div>
                <div style={{ paddingBottom: '16px', minWidth: '100px', textAlign: 'center' }}>
                    <AnimatePresence>
                        {saveStatus === 'saving' && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800 }}>
                                <Loader size={14} className="animate-spin" /> Saving...
                            </motion.span>
                        )}
                        {saveStatus === 'saved' && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 800 }}>
                                <Check size={14} /> Saved
                            </motion.span>
                        )}
                        {saveStatus === 'error' && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 800 }}>
                                <AlertCircle size={14} /> Error
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleDownloadPDF}
                    style={{ 
                        height: '52px', 
                        borderRadius: '12px', 
                        fontWeight: 850, 
                        border: '2px solid var(--text-main)', 
                        color: 'var(--text-main)', 
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <Download size={20} /> Download PDF
                </Button>
            </Card>

            {/* Error Banner matching screenshot */}
            <AnimatePresence>
                {saveStatus === 'error' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{
                            background: '#FFF1F2',
                            border: '1px solid #FECACA',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px',
                            color: '#BE123C',
                            fontWeight: 700,
                            overflow: 'hidden'
                        }}
                    >
                        <AlertCircle size={20} />
                        Failed to auto-save grades.
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader size={48} color="var(--primary)" />
                    </motion.div>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                                <th style={{ padding: '20px 32px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', width: '150px' }}>
                                    <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '6px' }}>Score</span>
                                </th>
                                <th style={{ padding: '20px 32px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', width: '160px' }}>Max Score</th>
                                <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, idx) => {
                                const currentGrade = grades[student.id] || { score: '', max_score: '100', comments: '' };
                                const isPassed = currentGrade.score && (Number(currentGrade.score) / Number(currentGrade.max_score || 100)) >= 0.5;

                                return (
                                    <tr key={student.id} style={{ borderBottom: idx < filteredStudents.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <Avatar name={student.user?.name} size={42} />
                                                <div>
                                                    <div style={{ fontWeight: 850, fontSize: '1rem', color: 'var(--text-main)' }}>{student.user?.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>ID: {String(student.id).padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <Input
                                                type="number"
                                                value={currentGrade.score}
                                                onChange={e => handleGradeChange(student.id, 'score', e.target.value)}
                                                style={{ textAlign: 'center', height: '48px', fontSize: '1.25rem', fontWeight: 900, color: Number(currentGrade.score) < 50 ? 'var(--danger)' : 'var(--text-main)', border: '1px solid #F1F5F9' }}
                                            />
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <Input
                                                type="number"
                                                value={currentGrade.max_score}
                                                onChange={e => handleGradeChange(student.id, 'max_score', e.target.value)}
                                                style={{ textAlign: 'center', height: '48px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', background: '#F8FAFC', border: 'none' }}
                                            />
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <Input
                                                value={currentGrade.comments}
                                                onChange={e => handleGradeChange(student.id, 'comments', e.target.value)}
                                                placeholder="Add remarks..."
                                                style={{ height: '48px', borderRadius: '12px', border: '1px solid #F1F5F9', fontWeight: 600 }}
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
