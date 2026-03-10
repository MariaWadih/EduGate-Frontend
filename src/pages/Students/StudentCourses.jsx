import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, User, Clock,
    ArrowUpRight, Info, AlertCircle,
    GraduationCap, Download, Layers,
    ChevronRight, ExternalLink
} from 'lucide-react';
import { useStudentDashboard } from '../../hooks';
import { Card, Badge, Button, Avatar } from '../../components/atoms';
import { materialService } from '../../services';
import { AuthContext } from '../../context/AuthContext';

const StudentCourses = () => {
    const { data, loading, error } = useStudentDashboard();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [downloadingCourse, setDownloadingCourse] = useState(null);

    // Mock progress for visual demonstration if not present in data
    const getProgress = () => Math.floor(Math.random() * 30) + 10;

    if (loading) return (
        <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Layers size={48} color="var(--primary)" />
            </motion.div>
            <div style={{ marginTop: '24px', fontWeight: 700, color: 'var(--text-main)', fontSize: '1.25rem' }}>Syncing your curriculum...</div>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Organizing subjects and faculty details</p>
        </div>
    );

    if (error || !data) return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
            <AlertCircle size={64} color="var(--danger)" style={{ marginBottom: '24px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Sync Interrupted</h3>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>{error || "We couldn't retrieve your enrolled courses at this time."}</p>
            <Button variant="primary" onClick={() => window.location.reload()} style={{ marginTop: '24px', borderRadius: '12px' }}>Try Refreshing</Button>
        </div>
    );

    const { courses = [] } = data || {};

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 40, damping: 15 } }
    };

    const handleDownloadSyllabus = async (e, course) => {
        e.stopPropagation(); // Prevent card click
        if (!user?.student?.class_id || !course.id) {
            alert('Unable to download: Missing course or student information');
            return;
        }

        setDownloadingCourse(course.id);

        try {
            const response = await materialService.downloadAllByCourse(
                user.student.class_id,
                course.id
            );

            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${course.name.replace(/\s/g, '_')}_materials.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            if (err.response?.status === 404) {
                alert(`No materials found for ${course.name}`);
            } else {
                alert(`Failed to download syllabus for ${course.name}. Please try again.`);
            }
        } finally {
            setDownloadingCourse(null);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '80px' }}
        >
            <header style={{ marginBottom: '48px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                <div>
                    <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '16px', fontWeight: 800, padding: '8px 16px', letterSpacing: '0.05em', borderRadius: '100px' }}>
                        ACADEMIC CATALOGUE
                    </Badge>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-main)' }}>
                        My <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Active Courses</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', fontWeight: 500, maxWidth: '550px', lineHeight: 1.6, margin: 0 }}>
                        Manage your learning journey, access course materials, and track your progress across all subjects.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{courses.length}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enrolled</span>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '28px' }}>
                {courses && courses.map((course, i) => {
                    const progress = getProgress();
                    return (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Card style={{
                                padding: '0',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '28px',
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                background: 'white',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                                cursor: 'pointer'
                            }}
                                onClick={() => navigate(`/student/materials?subject_id=${course.id}`)}
                                className="group"
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: `linear-gradient(90deg, var(--primary) 0%, #818CF8 100%)`, opacity: 0.8 }}></div>

                                {/* Action Button - Top Right */}
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: '#F1F5F9' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => handleDownloadSyllabus(e, course)}
                                    disabled={downloadingCourse === course.id}
                                    style={{
                                        position: 'absolute',
                                        top: '20px',
                                        right: '20px',
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '14px',
                                        border: '1px solid #E2E8F0',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: downloadingCourse === course.id ? 'wait' : 'pointer',
                                        zIndex: 10,
                                        color: 'var(--text-muted)'
                                    }}
                                >
                                    {downloadingCourse === course.id ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Layers size={20} />
                                        </motion.div>
                                    ) : (
                                        <Download size={20} />
                                    )}
                                </motion.button>

                                <div style={{ padding: '32px 32px 24px' }}>
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: '18px',
                                            background: 'linear-gradient(135deg, var(--primary-light) 0%, #EEF2FF 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)',
                                            marginBottom: '20px',
                                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
                                        }}>
                                            {course.name?.charAt(0)}
                                        </div>
                                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                            {course.name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Badge bg="#F1F5F9" color="var(--text-muted)" style={{ fontWeight: 700, fontSize: '0.75rem', padding: '4px 10px' }}>
                                                {course.code || 'ID-2024'}
                                            </Badge>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Core Subject</span>
                                        </div>
                                    </div>

                                    {/* Instructor Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                        <Avatar name={course.teacher?.user?.name || 'T'} size={36} />
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Instructor</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                {course.teacher?.user?.name || 'Assigned Faculty'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', padding: '0 32px 28px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> 4.5h / week</span>
                                        <span>{progress}% Complete</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #818CF8 100%)', borderRadius: '10px' }}
                                        />
                                    </div>

                                    <Button
                                        variant="ghost"
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0',
                                            height: 'auto',
                                            color: 'var(--primary)',
                                            background: 'transparent',
                                            fontWeight: 800,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Enter Classroom
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'transform 0.2s'
                                        }}>
                                            <ArrowUpRight size={18} />
                                        </div>
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}

                {(!courses || courses.length === 0) && (
                    <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 40px', background: 'white', border: '2px dashed #E2E8F0', borderRadius: '40px' }}>
                        <div style={{ background: 'var(--bg-main)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid #E2E8F0' }}>
                            <Info size={48} color="#94A3B8" strokeWidth={1.5} />
                        </div>
                        <h2 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.02em' }}>No active enrolments</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '500px', margin: '12px auto 0', lineHeight: 1.6 }}>
                            You are not currently registered in any curriculum for this academic cycle. Please contact the registrar for assistance.
                        </p>
                    </Card>
                )}
            </div>
        </motion.div>
    );
};

export default StudentCourses;

