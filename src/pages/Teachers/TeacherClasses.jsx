import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ChevronRight, Clock } from 'lucide-react';
import { Button, Badge, Card, Select } from '../../components/atoms';
import { useAuth, useTeacherClasses } from '../../hooks';


const TeacherClasses = () => {
    const { user } = useAuth();
    const { data: classes = [], loading, error } = useTeacherClasses();
    const [selectedCourse, setSelectedCourse] = useState('All');
    const [selectedGrade, setSelectedGrade] = useState('All');

    const classCards = React.useMemo(() => {
        const cards = [];
        if (!Array.isArray(classes)) return cards;

        classes.forEach(cls => {
            if (!cls || !cls.subjects) return;
            cls.subjects.forEach(subject => {
                const subjectSchedule = (cls.schedules || []).filter(s => s.subject_id === subject.id);
                let scheduleString = "TBA";

                if (subjectSchedule.length > 0) {
                    const days = subjectSchedule.map(s => s.day_of_week.substring(0, 3)).join(', ');
                    const time = `${subjectSchedule[0].start_time.substring(0, 5)}`;
                    scheduleString = `${days} ${time}`;
                }

                cards.push({
                    id: `${cls.id}-${subject.id}`,
                    classId: cls.id,
                    subjectId: subject.id,
                    className: cls.name,
                    gradeNumber: cls.name.replace(/\D/g, ''),
                    section: cls.section,
                    subjectName: subject.name,
                    studentCount: cls.students_count,
                    schedule: scheduleString
                });
            });
        });
        return cards;
    }, [classes]);


    // Extract unique options
    const uniqueCourses = ['All', ...new Set(classCards.map(c => c.subjectName))].sort();
    const uniqueGrades = ['All', ...new Set(classCards.map(c => c.gradeNumber))].sort((a, b) => a - b);

    // Filter Logic
    const filteredCards = classCards.filter(card => {
        const courseMatch = selectedCourse === 'All' || card.subjectName === selectedCourse;
        const gradeMatch = selectedGrade === 'All' || card.gradeNumber === selectedGrade;
        return courseMatch && gradeMatch;
    });

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <BookOpen size={48} color="var(--primary)" />
            </motion.div>
        </div>
    );

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--danger)' }}>{error}</h3>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                    <h1 style={{ marginBottom: '8px' }}>My Classes</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Manage your assigned classes and view student rosters.</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <Select
                        style={{ width: 'auto', minWidth: '160px' }}
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                    >
                        {uniqueGrades.map(g => (
                            <option key={g} value={g}>{g === 'All' ? 'All Grades' : `Grade ${g}`}</option>
                        ))}
                    </Select>

                    <Select
                        style={{ width: 'auto', minWidth: '160px' }}
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        {uniqueCourses.map(c => (
                            <option key={c} value={c}>{c === 'All' ? 'All Subjects' : c}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {filteredCards.length === 0 ? (
                <Card style={{ padding: '80px 40px', textAlign: 'center', border: '2px dashed var(--border-color)', background: 'transparent' }}>
                    <div style={{ background: 'var(--bg-main)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <BookOpen size={32} color="var(--text-muted)" />
                    </div>
                    <h2 style={{ marginBottom: '8px', fontWeight: 800 }}>No Classes Found</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Try adjusting your filters to find what you're looking for.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                    {filteredCards.map(card => (
                        <Card
                            key={card.id}
                            style={{
                                padding: '0',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                borderRadius: '28px',
                                overflow: 'hidden',
                                border: '1px solid rgba(0,0,0,0.05)',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
                                position: 'relative'
                            }}
                        >
                            {/* Card Header Background */}
                            <div style={{ height: '80px', background: 'linear-gradient(135deg, var(--primary) 0%, #4338CA 100%)', opacity: 0.03, position: 'absolute', top: 0, left: 0, right: 0 }} />

                            <div style={{ padding: '32px', flex: 1, position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)',
                                        color: 'white',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        fontWeight: 900,
                                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)'
                                    }}>
                                        {card.gradeNumber}
                                    </div>
                                    <Badge bg="var(--bg-main)" color="var(--text-muted)" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em', border: '1px solid var(--border-color)' }}>
                                        SECTION {card.section}
                                    </Badge>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Active Session</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 12px 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                                        Grade {card.gradeNumber} — {card.subjectName}
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px' }}>Academic Term 2024</Badge>
                                        <Badge bg="rgba(16, 185, 129, 0.1)" color="var(--success)" style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px' }}>In Progress</Badge>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    padding: '20px',
                                    background: 'var(--bg-main)',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 750 }}>
                                        <div style={{ background: 'white', padding: '6px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                                            <Clock size={16} color="var(--primary)" />
                                        </div>
                                        <span>{card.schedule}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 750 }}>
                                        <div style={{ background: 'white', padding: '6px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                                            <Users size={16} color="var(--primary)" />
                                        </div>
                                        <span>{card.studentCount} Students Enrolled</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '24px 32px 32px 32px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px'
                            }}>
                                <Link to={`/classes/${card.classId}/assignments?subject_id=${card.subjectId}`} style={{ textDecoration: 'none' }}>
                                    <Button variant="outline" style={{ width: '100%', borderRadius: '14px', height: '48px', fontWeight: 700 }}>
                                        Assignments
                                    </Button>
                                </Link>
                                <Link to={`/classes/${card.classId}/materials?subject_id=${card.subjectId}`} style={{ textDecoration: 'none' }}>
                                    <Button variant="outline" style={{ width: '100%', borderRadius: '14px', height: '48px', fontWeight: 700 }}>
                                        Materials
                                    </Button>
                                </Link>
                                <Link to={`/classes/${card.classId}`} style={{ gridColumn: 'span 2', textDecoration: 'none' }}>
                                    <Button style={{ width: '100%', borderRadius: '14px', height: '52px', fontWeight: 800, background: 'var(--text-main)', border: 'none' }}>
                                        Launch Classroom <ChevronRight size={18} style={{ marginLeft: '4px' }} />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

import ErrorBoundary from '../../components/ErrorBoundary';

const TeacherClassesWithBoundary = () => (
    <ErrorBoundary>
        <TeacherClasses />
    </ErrorBoundary>
);

export default TeacherClassesWithBoundary;
