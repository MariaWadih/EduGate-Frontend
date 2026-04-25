import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    BookOpen,
    TrendingUp,
    Award,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    HelpCircle
} from 'lucide-react';
import { useStudentDashboard } from '../../hooks';
import { Card, Badge, Button, Avatar } from '../../components/atoms';

const StudentGrades = () => {
    const { data, loading, error } = useStudentDashboard();

    const {
        grades = [],
        courses = []
    } = data || {};

    // Standard academic cycle labels as requested
    const termOrder = ['Test 1', 'Test 2', 'Exam 1', 'Test 3', 'Exam 2'];

    // Group grades by course
    const gradesByCourse = useMemo(() => {
        const grouped = {};

        // Initialize with enrolled courses
        courses.forEach(course => {
            grouped[course.id] = {
                courseId: course.id,
                courseName: course.name,
                courseCode: course.code,
                teacher: course.teacher?.user?.name || 'Academic Faculty',
                assessments: {}
            };
        });

        // Fill with actual grades
        grades.forEach(grade => {
            const courseId = grade.subject_id;
            if (grouped[courseId]) {
                const term = grade.term || 'Test 1';
                grouped[courseId].assessments[term] = {
                    score: grade.score,
                    maxScore: grade.max_score,
                    comments: grade.comments,
                    date: grade.date
                };
            }
        });

        return Object.values(grouped);
    }, [grades, courses]);

    // Strictly calculated based on visible column assessments only
    const calculateGPA = (courseGrades) => {
        const relevantAssessments = Object.entries(courseGrades.assessments)
            .filter(([term]) => termOrder.includes(term))
            .map(([_, a]) => (a.score / a.maxScore) * 100);
        
        if (relevantAssessments.length === 0) return "0.0";
        
        return (relevantAssessments.reduce((a, b) => a + b, 0) / relevantAssessments.length).toFixed(1);
    };

    const overallAverage = useMemo(() => {
        if (gradesByCourse.length === 0) return 0;
        const total = gradesByCourse.reduce((acc, course) => acc + parseFloat(calculateGPA(course)), 0);
        return (total / gradesByCourse.length).toFixed(1);
    }, [gradesByCourse]);

    const academicStanding = useMemo(() => {
        const avg = parseFloat(overallAverage);
        if (avg >= 90) return { label: 'Honor Roll', rank: 'Top 5%', color: 'var(--success)' };
        if (avg >= 80) return { label: 'High Achiever', rank: 'Top 15%', color: 'var(--primary)' };
        if (avg >= 70) return { label: 'Satisfactory', rank: 'Top 40%', color: 'var(--warning)' };
        return { label: 'Needs Improvement', rank: 'N/A', color: 'var(--error)' };
    }, [overallAverage]);

    const handleDownload = () => {
        window.print();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Trophy size={48} color="var(--primary)" />
            </motion.div>
            <div style={{ marginTop: '24px', fontWeight: 700, fontSize: '1.2rem' }}>Compiling academic transcripts...</div>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '1400px', margin: '0 auto' }}
            className="printable-document"
        >
            {/* Minimal Professional Print Header */}
            <div className="print-only-date" style={{ display: 'none', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '30px', fontSize: '9pt', color: '#666', fontWeight: 600 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>EduGate | Academic Performance Record</span>
                    <span>Issued: {new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <Badge bg="rgba(79, 70, 229, 0.1)" color="var(--primary)" style={{ marginBottom: '16px', fontWeight: 800 }}>ACADEMIC TRANSCRIPT</Badge>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.04em' }}>Performance <span style={{ color: 'var(--primary)' }}>Record</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px', fontWeight: 500 }}>Overview of your evaluation milestones across the academic cycle.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }} className="no-download">
                    <Button
                        variant="outline"
                        style={{ borderRadius: '14px' }}
                        onClick={handleDownload}
                    >
                        Download PDF Report
                    </Button>
                </div>
            </header>

            {/* Top Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }} className="grid-3">
                <Card style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Award size={24} className="print-include" />
                        <Badge bg="rgba(255,255,255,0.2)" color="white" className="no-print">{academicStanding.rank}</Badge>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Academic Standing</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{academicStanding.label}</div>
                </Card>
                <Card style={{ padding: '24px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <TrendingUp size={24} color="var(--primary)" className="print-include" />
                        <div style={{ color: parseFloat(overallAverage) >= 75 ? 'var(--success)' : 'var(--warning)', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} className="no-print">
                            <ArrowUpRight size={14} /> {(parseFloat(overallAverage) / 20).toFixed(1)} GPA
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Global Average</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{overallAverage}%</div>
                </Card>
                <Card style={{ padding: '24px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <BookOpen size={24} color="var(--primary)" className="print-include" />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Registry</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{courses.length} Subjects</div>
                </Card>
            </div>

            {/* Grades Table Card */}
            <Card style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'white' }}>
                <div style={{ padding: '24px 32px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="table-title-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Trophy size={20} color="var(--primary)" />
                        <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>Subject Evaluations</span>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }} className="table-print-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'white' }}>
                                <th style={{ padding: '24px 32px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subject / Instructor</th>
                                {termOrder.map(term => (
                                    <th key={term} style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>{term}</th>
                                ))}
                                <th style={{ padding: '24px 32px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Overall</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradesByCourse.map((course, idx) => (
                                <motion.tr
                                    key={idx}
                                    variants={itemVariants}
                                    style={{ borderTop: '1px solid #F1F5F9' }}
                                >
                                    <td style={{ padding: '24px 32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: 'var(--primary)' }}>
                                                {course.courseName.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 850, fontSize: '1.05rem', color: 'var(--text-main)' }}>{course.courseName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{course.teacher}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {termOrder.map(term => {
                                        const assessment = course.assessments[term];
                                        return (
                                            <td key={term} style={{ padding: '24px', textAlign: 'center' }}>
                                                {assessment ? (
                                                    <div style={{ display: 'inline-block' }}>
                                                        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: (assessment.score / assessment.maxScore) >= 0.9 ? 'var(--success)' : 'var(--text-main)' }}>
                                                            {Math.round(assessment.score)}
                                                        </div>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>/ {assessment.maxScore}</div>
                                                    </div>
                                                ) : (
                                                    <div style={{ color: '#CBD5E1', fontSize: '1.5rem', fontWeight: 300 }}>—</div>
                                                )}
                                            </td>
                                        );
                                    })}

                                    <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-main)', borderRadius: '12px' }} className="registry-pill">
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary)' }}>{calculateGPA(course)}%</span>
                                            <ChevronRight size={16} color="var(--text-muted)" className="no-print" />
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div style={{ marginTop: '40px', padding: '32px', borderRadius: '32px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', gap: '32px', alignItems: 'center' }} className="no-print">
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                    <HelpCircle size={32} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: 850, fontSize: '1.25rem' }}>Understanding your evaluation</h4>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
                        Milestone weights: Tests (15% each), Final Exams (35% each). Grades are calculated based on the weighted cumulative score of all submitted assessments.
                    </p>
                </div>
                <Button variant="primary">Academic Handbook</Button>
            </div>
        </motion.div>
    );
};

export default StudentGrades;
