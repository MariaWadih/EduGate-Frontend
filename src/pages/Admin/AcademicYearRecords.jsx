import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Users, BookOpen, UserCheck, Search,
    Filter, Layers, GraduationCap, Download,
    Briefcase, ArrowRight, CheckCircle2, MoreHorizontal
} from 'lucide-react';
import { academicYearService } from '../../services';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { Button, Badge, Avatar, Card } from '../../components/atoms';
import { Table, SearchBar } from '../../components/molecules';

const AcademicYearRecords = () => {
    const { academicYears, activeYear, selectedYear, setSelectedYear } = useAcademicYear();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('teachers');
    const [searchTerm, setSearchTerm] = useState('');

    const selectedYearId = selectedYear?.id || '';



    useEffect(() => {
        if (selectedYearId) {
            fetchRecords();
        }
    }, [selectedYearId]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await academicYearService.getRecords(selectedYearId);
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch academic year records:', err);
        } finally {
            setLoading(false);
        }
    };

    const teachersAndCourses = data?.class_subject_teachers || [];
    const studentsAndClasses = data?.enrollments || [];
    
    // Group teachers by name to see all their subjects
    const teacherMap = {};
    teachersAndCourses.forEach(item => {
        const tid = item.teacher_id;
        if (!teacherMap[tid]) {
            teacherMap[tid] = {
                teacher: item.teacher,
                assignments: []
            };
        }
        teacherMap[tid].assignments.push(item);
    });
    const teacherList = Object.values(teacherMap);

    // Group subjects by class
    const classMap = {};
    teachersAndCourses.forEach(item => {
        const classKey = `${item.school_class?.name} - ${item.school_class?.section}`;
        if (!classMap[classKey]) {
            classMap[classKey] = {
                className: item.school_class?.name,
                section: item.school_class?.section,
                subjects: []
            };
        }
        if (!classMap[classKey].subjects.includes(item.subject?.name)) {
            classMap[classKey].subjects.push(item.subject?.name);
        }
    });
    const classesList = Object.values(classMap);

    const subjects = [...new Set(teachersAndCourses.map(item => item.subject?.name))].filter(Boolean);

    const filteredTeachers = teacherList.filter(t => 
        t.teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStudents = studentsAndClasses.filter(s => 
        s.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.school_class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderTeachersTab = () => (
        <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {filteredTeachers.map(({ teacher, assignments }) => (
                    <Card key={teacher.id} style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <Avatar name={teacher.user.name} size={48} />
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{teacher.user.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{teacher.user.email}</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                                Courses Assigned
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {assignments.map(a => (
                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-light)', padding: '10px 14px', borderRadius: '10px' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{a.subject?.name}</div>
                                        <Badge bg="var(--primary-light)" color="var(--primary)" size="sm">
                                            {a.school_class?.name} / {a.school_class?.section}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {filteredTeachers.length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No teacher assignments found for this academic year.
                </div>
            )}
        </div>
    );

    const renderStudentsTab = () => (
        <div style={{ marginTop: '24px' }}>
            <Card style={{ padding: '0', overflow: 'hidden' }}>
                <Table>
                    <Table.Head>
                        <Table.Row>
                            <Table.Header>Student Profile</Table.Header>
                            <Table.Header>Current Class</Table.Header>
                            <Table.Header>Enrollment</Table.Header>
                            <Table.Header>Status</Table.Header>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {filteredStudents.map((enrollment) => (
                            <Table.Row key={enrollment.id}>
                                <Table.Cell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Avatar name={enrollment.student.user?.name} size={40} />
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{enrollment.student.user?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{enrollment.student.user?.email}</div>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                        {enrollment.school_class?.name} / {enrollment.school_class?.section}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <div style={{ fontSize: '0.85rem' }}>{new Date(enrollment.enrollment_date).toLocaleDateString()}</div>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge 
                                        bg={enrollment.status === 'active' ? '#ECFDF5' : '#FEF2F2'} 
                                        color={enrollment.status === 'active' ? '#059669' : '#DC2626'}
                                    >
                                        {enrollment.status}
                                    </Badge>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Card>
            {filteredStudents.length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students currently enrolled in this academic year.
                </div>
            )}
        </div>
    );

    const renderSubjectsTab = () => (
        <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {classesList.map(cls => (
                    <Card key={`${cls.className}-${cls.section}`} style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', background: 'var(--primary-light)', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '10px' }}>
                                    <Layers size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{cls.className}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Section {cls.section}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {cls.subjects.map(sub => (
                                    <Badge key={sub} bg="#F3E8FF" color="#9333EA" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                        {sub}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {classesList.length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No subjects have been assigned to classes for this year.
                </div>
            )}
        </div>
    );

    const stats = [
        { label: 'Active Teachers', value: teacherList.length, icon: <Briefcase size={20} />, color: '#6366F1', bg: '#EEF2FF' },
        { label: 'Enrolled Students', value: studentsAndClasses.length, icon: <GraduationCap size={20} />, color: '#10B981', bg: '#ECFDF5' },
        { label: 'Total Subjects', value: subjects.length, icon: <BookOpen size={20} />, color: '#8B5CF6', bg: '#F5F3FF' },
        { label: 'Classes', value: [...new Set(studentsAndClasses.map(s => s.school_class?.id))].filter(Boolean).length, icon: <Layers size={20} />, color: '#F59E0B', bg: '#FFFBEB' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: '0', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                        Academic Year Records
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '1.1rem' }}>
                        Directory of teachers, students, and courses for {selectedYear?.name || 'Academic Year'}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar size={20} color="var(--primary)" />
                        <select 
                            style={{ 
                                padding: '12px 20px', 
                                borderRadius: '15px', 
                                border: '2px solid var(--border-color)', 
                                background: 'white', 
                                fontWeight: 700,
                                fontSize: '1rem',
                                color: 'var(--text-main)',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                            value={selectedYear?.id || ''}
                            onChange={(e) => {
                                const yr = academicYears.find(y => String(y.id) === String(e.target.value));
                                if (yr) setSelectedYear(yr);
                            }}
                        >
                            {academicYears.map(year => (
                                <option key={year.id} value={year.id}>{year.name} {year.is_active ? '(Active)' : ''}</option>
                            ))}
                        </select>
                    </div>
                    <Button variant="outline" icon={<Download size={18} />}>Export Report</Button>
                </div>
            </div>

            {/* Stats Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {stats.map(stat => (
                    <Card key={stat.label} style={{ padding: '24px', borderBottom: `4px solid ${stat.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: stat.bg, color: stat.color, padding: '12px', borderRadius: '14px' }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '32px' }}>
                    {[
                        { id: 'teachers', label: 'Teachers & Courses', icon: <Users size={18} /> },
                        { id: 'students', label: 'Students & Classes', icon: <GraduationCap size={18} /> },
                        { id: 'subjects', label: 'Subjects Summary', icon: <BookOpen size={18} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                            style={{
                                padding: '14px 4px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '4px solid var(--primary)' : '4px solid transparent',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 800,
                                fontSize: '1.05rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: activeTab === tab.id ? 1 : 0.7
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div style={{ width: '350px' }}>
                    <SearchBar 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder={activeTab === 'teachers' ? "Search teachers..." : "Search students or classes..."} 
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                    </motion.div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading records...</div>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'teachers' && renderTeachersTab()}
                        {activeTab === 'students' && renderStudentsTab()}
                        {activeTab === 'subjects' && renderSubjectsTab()}
                    </motion.div>
                </AnimatePresence>
            )}
        </motion.div>
    );
};

export default AcademicYearRecords;
