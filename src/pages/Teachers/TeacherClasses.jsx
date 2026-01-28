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
                <Card style={{ padding: '80px 40px', textAlign: 'center' }}>
                    <div style={{ background: '#F3F4F6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <BookOpen size={32} color="var(--text-muted)" />
                    </div>
                    <h2 style={{ marginBottom: '8px' }}>No Classes Found</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Try adjusting your filters to find what you're looking for.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                    {filteredCards.map(card => (
                        <Card
                            key={card.id}
                            style={{
                                padding: '32px',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.75rem',
                                    fontWeight: 800,
                                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                                }}>
                                    {card.gradeNumber}
                                </div>
                                <Badge bg="#F3F4F6" color="var(--text-muted)" style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700 }}>
                                    SECTION {card.section}
                                </Badge>
                            </div>

                            <div style={{ marginBottom: '28px', flex: 1 }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                                    {card.className}
                                </h3>
                                <Badge bg="var(--primary-light)" color="var(--primary)" style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {card.subjectName}
                                </Badge>
                            </div>

                            <div style={{
                                borderTop: '1px solid var(--border-color)',
                                paddingTop: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600 }}>
                                        <Clock size={16} color="var(--primary)" />
                                        <span>{card.schedule}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600 }}>
                                        <Users size={16} color="var(--primary)" />
                                        <span>{card.studentCount} Students Enrolled</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Link
                                        to={`/assignments?class=${card.classId}`}
                                        style={{ flex: 1, textDecoration: 'none' }}
                                    >
                                        <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }}>
                                            Assignments
                                        </Button>
                                    </Link>
                                    <Link
                                        to={`/classes/${card.classId}`}
                                        style={{ flex: 1, textDecoration: 'none' }}
                                    >
                                        <Button style={{ width: '100%', justifyContent: 'center' }}>
                                            Students
                                        </Button>
                                    </Link>
                                </div>
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
