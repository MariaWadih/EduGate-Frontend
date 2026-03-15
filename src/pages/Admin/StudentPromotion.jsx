import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, TrendingUp, UserCheck, UserX, AlertCircle, CheckCircle2,
    ArrowRight, Calendar, Award, RefreshCw
} from 'lucide-react';
import { Button, Badge, Avatar, Card } from '../../components/atoms';
import { SearchBar, Modal, FormField, Table, SelectField } from '../../components/molecules';
import { promotionService, studentService } from '../../services';
import client from '../../api/client';
import { useAcademicYear } from '../../context/AcademicYearContext';

const StudentPromotion = () => {
    const { activeYear, academicYears } = useAcademicYear();

    const [loading, setLoading] = useState(false);
    const [fromYear, setFromYear] = useState('');
    const [toYear, setToYear] = useState('');
    const [fromClassId, setFromClassId] = useState('');
    const [toClassId, setToClassId] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState({});
    const [failedStudents, setFailedStudents] = useState(new Set());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [statistics, setStatistics] = useState(null);
    // Year-specific class lists fetched from the dedicated endpoint
    const [fromYearClasses, setFromYearClasses] = useState([]);
    const [toYearClasses, setToYearClasses] = useState([]);

    // Derive year list from DB
    const availableYears = (academicYears || []).map(y => y.name).sort();

    // Set defaults once active year loads
    useEffect(() => {
        if (activeYear && !fromYear) {
            setFromYear(activeYear.name);
            // Default toYear to next sequential year if it exists
            const idx = availableYears.indexOf(activeYear.name);
            if (idx !== -1 && idx < availableYears.length - 1) {
                setToYear(availableYears[idx + 1]);
            }
        }
    }, [activeYear, academicYears]);

    const fetchCandidates = async () => {
        if (!fromYear) return;

        setLoading(true);
        try {
            const response = await promotionService.getCandidates({
                from_academic_year: fromYear,
                to_academic_year: toYear,
                from_class_id: fromClassId || undefined
            });
            const students = response.data.students;
            setCandidates(students);

            // Initialize selection state based on automated status
            const initialSelection = {};
            const initialFailed = new Set();

            students.forEach(student => {
                initialSelection[student.id] = {
                    to_class_id: student.automated_target_class_id || '',
                    status: student.automated_status || 'promoted',
                    remarks: student.fail_reason || '',
                    is_manual: false // Track if admin changed it
                };
            });

            setSelectedStudents(initialSelection);
            setFailedStudents(initialFailed);
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        if (!fromYear) return;
        try {
            const response = await promotionService.getYearStatistics(fromYear);
            setStatistics(response.data);
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    };

    // Fetch classes for a specific year string from the dedicated endpoint
    const fetchClassesForYear = async (year, setter) => {
        if (!year) { setter([]); return; }
        try {
            const res = await client.get('/promotions/classes-for-year', { params: { academic_year: year } });
            setter(res.data || []);
        } catch {
            setter([]);
        }
    };

    useEffect(() => { fetchClassesForYear(fromYear, setFromYearClasses); }, [fromYear]);
    useEffect(() => { fetchClassesForYear(toYear, setToYearClasses); }, [toYear]);

    useEffect(() => {
        fetchCandidates();
        fetchStatistics();
    }, [fromYear, fromClassId]);

    const handleStatusChange = (studentId, status) => {
        setSelectedStudents(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
                is_manual: true
            }
        }));
    };

    const handleClassChange = (studentId, classId) => {
        setSelectedStudents(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], to_class_id: classId, is_manual: true }
        }));
    };

    const handleBulkPromote = async () => {
        if (!fromClassId || !toClassId) {
            alert('Please select both source and destination classes');
            return;
        }

        if (!window.confirm(`Promote entire class to next grade?\n\nPromoted: ${candidates.length - failedStudents.size}\nFailed: ${failedStudents.size}`)) {
            return;
        }

        setLoading(true);
        try {
            await promotionService.bulkPromoteClass({
                from_class_id: fromClassId,
                to_class_id: toClassId,
                from_academic_year: fromYear,
                to_academic_year: toYear,
                retained_student_ids: candidates.filter(s => selectedStudents[s.id]?.status === 'retained').map(s => s.id)
            });

            alert('✅ Bulk promotion completed successfully!');
            fetchCandidates();
            fetchStatistics();
            setFailedStudents(new Set());
        } catch (err) {
            alert('❌ Promotion failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleIndividualPromote = async () => {
        const promotions = candidates
            .filter(student => (selectedStudents[student.id]?.status === 'graduated' || selectedStudents[student.id]?.status === 'transferred') || !!selectedStudents[student.id]?.to_class_id)
            .map(student => ({
                student_id: student.id,
                to_class_id: selectedStudents[student.id].to_class_id || null,
                status: selectedStudents[student.id].status,
                remarks: selectedStudents[student.id].remarks
            }));

        if (promotions.length === 0) {
            alert('❌ Please select a valid action for at least one student.');
            return;
        }

        if (!window.confirm(`Finalize academic transitions for ${promotions.length} students?`)) return;

        setLoading(true);
        try {
            const response = await promotionService.promoteStudents({
                from_academic_year: fromYear,
                to_academic_year: toYear,
                promotions
            });

            alert(`✅ Promotion completed successfully!\n\nCheck the promotion history or academic records for details.`);
            fetchCandidates();
            fetchStatistics();
            setShowConfirmModal(false);
        } catch (err) {
            alert('❌ Promotion failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleInitializeClasses = async () => {
        setLoading(true);
        try {
            await promotionService.initializeNextYearClasses({
                from_academic_year: fromYear,
                to_academic_year: toYear
            });
            // Refresh the toYear class list after initialization
            await fetchClassesForYear(toYear, setToYearClasses);
            alert('✅ Class structure initialized for ' + toYear);
            fetchCandidates();
        } catch (err) {
            alert('❌ Failed to initialize classes: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleResetToRecommended = () => {
        const resetSelection = {};
        candidates.forEach(student => {
            resetSelection[student.id] = {
                to_class_id: student.automated_target_class_id || '',
                status: student.automated_status || 'promoted',
                remarks: student.fail_reason || '',
                is_manual: false
            };
        });
        setSelectedStudents(resetSelection);
    };

    // toYearClasses and fromYearClasses are now managed by fetchClassesForYear above

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    Student Promotion
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
                    Manage academic transitions: Promote successful students or assign repeat programs
                </p>
            </div>

            {/* Statistics Dashboard */}
            {statistics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {[
                        {
                            label: 'Promoted',
                            value: statistics.promoted,
                            icon: <UserCheck size={28} />,
                            color: '#10B981',
                            bg: 'rgba(16, 185, 129, 0.08)',
                            gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        },
                        {
                            label: 'Retained',
                            value: statistics.retained ?? statistics.failed ?? 0,
                            icon: <RefreshCw size={28} />,
                            color: '#F59E0B',
                            bg: 'rgba(245, 158, 11, 0.08)',
                            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                        },
                        {
                            label: 'Total Candidates',
                            value: statistics.total,
                            icon: <Users size={28} />,
                            color: 'var(--primary)',
                            bg: 'rgba(79, 70, 229, 0.08)',
                            gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
                        }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <Card style={{
                                padding: '24px',
                                border: '1px solid var(--border-color)',
                                background: 'white',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    width: '100px',
                                    height: '100px',
                                    background: stat.bg,
                                    borderRadius: '50%',
                                    filter: 'blur(30px)',
                                    zIndex: 0
                                }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: stat.gradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: `0 8px 16px -4px ${stat.color}40`
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                                            {stat.label}
                                        </div>
                                        <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                                            {stat.value}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Transition Controls */}
            <Card style={{
                padding: '32px',
                marginBottom: '40px',
                border: '1px solid var(--border-color)',
                background: 'white',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
                borderRadius: '24px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flex: 1, gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: '180px', flex: 1 }}>
                            <SelectField label="From Academic Year" value={fromYear} onChange={e => setFromYear(e.target.value)}>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </SelectField>
                        </div>
                        <div style={{ minWidth: '180px', flex: 1 }}>
                            <SelectField label="To Academic Year" value={toYear} onChange={e => setToYear(e.target.value)}>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </SelectField>
                        </div>
                        <div style={{ minWidth: '180px', flex: 1 }}>
                            <SelectField label="Filter Class" value={fromClassId} onChange={e => setFromClassId(e.target.value)}>
                                <option value="">All Current Classes</option>
                                {fromYearClasses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                ))}
                            </SelectField>
                        </div>
                    </div>

                    <div style={{ width: '2px', height: '40px', background: 'var(--border-color)', margin: '0 12px', display: 'none' }} className="d-lg-block" />

                    <div style={{ minWidth: '220px', flex: 1 }}>
                        <SelectField label="Bulk Destination" value={toClassId} onChange={e => setToClassId(e.target.value)}>
                            <option value="">{toYearClasses.length > 0 ? 'Select Target Class...' : 'No classes found in ' + toYear}</option>
                            {toYearClasses.map(c => (
                                <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                            ))}
                        </SelectField>
                        {toYearClasses.length === 0 && (
                            <div
                                onClick={handleInitializeClasses}
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--primary)',
                                    fontWeight: 700,
                                    marginTop: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <RefreshCw size={12} className={loading ? 'spinning' : ''} />
                                Initialize structure from {fromYear}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '32px', pt: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {toYearClasses.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 600 }}>
                                <AlertCircle size={18} />
                                Infrastructure missing for {toYear}. Initialize classes to enable promotion.
                            </div>
                        ) : (
                            <>
                                <Award size={16} color="var(--primary)" />
                                System has automatically analyzed performance and suggested transitions.
                            </>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button
                            variant="outline"
                            onClick={handleResetToRecommended}
                            disabled={loading || candidates.length === 0}
                            style={{ padding: '10px 24px', fontWeight: 600, borderRadius: '12px', borderColor: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary)' }}
                        >
                            <RefreshCw size={18} />
                            Reset to Recommended
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchCandidates}
                            disabled={loading}
                            style={{ padding: '10px 24px', fontWeight: 600, borderRadius: '12px' }}
                        >
                            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                            Refresh Candidates
                        </Button>
                        {fromClassId && toClassId && (
                            <Button
                                onClick={handleBulkPromote}
                                disabled={loading || candidates.length === 0}
                                style={{
                                    padding: '10px 28px',
                                    fontWeight: 700,
                                    boxShadow: '0 10px 20px -5px var(--primary-glow)',
                                    borderRadius: '12px',
                                    background: 'var(--primary)',
                                    color: 'white'
                                }}
                            >
                                <TrendingUp size={18} />
                                Apply Bulk Promotion
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Candidates Selection Table */}
            {candidates.length > 0 ? (
                <Card style={{
                    padding: '0',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 15px 35px -10px rgba(0,0,0,0.05)',
                    borderRadius: '24px',
                    background: 'white'
                }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Eligible Candidates</h3>
                        </div>
                        <Badge bg="var(--bg-main)" color="var(--text-main)" style={{ fontWeight: 700 }}>
                            {candidates.length} Students Detected
                        </Badge>
                    </div>
                    <Table>
                        <Table.Head>
                            <Table.Row style={{ background: '#F9FAFB' }}>
                                <Table.Header style={{ paddingLeft: '32px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Student</Table.Header>
                                <Table.Header style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Current Standing</Table.Header>
                                <Table.Header style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Target Action</Table.Header>
                                <Table.Header align="right" style={{ paddingRight: '32px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Intelligence</Table.Header>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {candidates.map((student, idx) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    style={{ borderBottom: '1px solid var(--border-color)' }}
                                >
                                    <Table.Cell style={{ paddingLeft: '32px', paddingVertical: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <Avatar
                                                name={student.user?.name}
                                                size={42}
                                                style={{ borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{student.user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                    {student.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <Badge bg="rgba(79, 70, 229, 0.06)" color="var(--primary)" style={{ fontWeight: 700, width: 'fit-content', borderRadius: '6px' }}>
                                                {student.schoolClass?.name} {student.schoolClass?.section}
                                            </Badge>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{fromYear} Track</div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <select
                                                value={selectedStudents[student.id]?.status || 'promoted'}
                                                onChange={e => handleStatusChange(student.id, e.target.value)}
                                                style={{
                                                    padding: '10px 14px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    color: selectedStudents[student.id]?.status === 'promoted' ? '#059669' :
                                                        selectedStudents[student.id]?.status === 'retained' ? '#D97706' :
                                                            selectedStudents[student.id]?.status === 'graduated' ? '#4F46E5' : '#6B7280',
                                                    background: selectedStudents[student.id]?.status === 'promoted' ? 'rgba(16, 185, 129, 0.1)' :
                                                        selectedStudents[student.id]?.status === 'retained' ? 'rgba(245, 158, 11, 0.1)' :
                                                            selectedStudents[student.id]?.status === 'graduated' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="promoted">Promote To</option>
                                                <option value="retained">Repeat</option>
                                                <option value="graduated">Graduate</option>
                                                <option value="transferred">Transfer</option>
                                            </select>

                                            {!(selectedStudents[student.id]?.status === 'graduated' || selectedStudents[student.id]?.status === 'transferred') && (
                                                <select
                                                    value={selectedStudents[student.id]?.to_class_id || ''}
                                                    onChange={e => handleClassChange(student.id, e.target.value)}
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--border-color)',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        color: 'var(--text-main)',
                                                        background: 'white',
                                                        outline: 'none'
                                                    }}
                                                >
                                                    <option value="">Select Destination...</option>
                                                    {toYearClasses.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell align="right" style={{ paddingRight: '32px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                color: selectedStudents[student.id]?.is_manual ? 'var(--primary)' : 'var(--text-muted)'
                                            }}>
                                                {selectedStudents[student.id]?.is_manual ? 'Manual Override' : 'Recommended'}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, opacity: 0.7 }}>
                                                {selectedStudents[student.id]?.status === 'promoted' ? 'Ready for Advance' : 'Cycle Repeated'}
                                            </div>
                                        </div>
                                    </Table.Cell>
                                </motion.tr>
                            ))}
                        </Table.Body>
                    </Table>

                    <div style={{
                        padding: '32px',
                        borderTop: '1px solid var(--border-color)',
                        background: 'linear-gradient(to right, #F9FAFB, white)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <AlertCircle size={20} />
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                <strong style={{ color: 'var(--text-main)' }}>Transaction Safe:</strong> Processing {candidates.filter(s => selectedStudents[s.id]?.to_class_id).length} of {candidates.length} candidates. <br />Records will be archived and new enrollments initialized.
                            </div>
                        </div>
                        <Button
                            onClick={handleIndividualPromote}
                            disabled={loading}
                            style={{
                                padding: '14px 40px',
                                borderRadius: '16px',
                                fontWeight: 800,
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                                color: 'white',
                                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
                                border: 'none'
                            }}
                        >
                            <CheckCircle2 size={20} />
                            Execute Promotions
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card style={{
                    padding: '120px 20px',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '32px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div style={{
                            background: 'rgba(79, 70, 229, 0.05)',
                            width: '100px',
                            height: '100px',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 32px auto',
                            color: 'var(--primary)',
                            transform: 'rotate(-10deg)'
                        }}>
                            <Users size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                            Ready for the Next Cycle?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '450px', margin: '0 auto', lineHeight: 1.6 }}>
                            Initialize the academic promotion process by selecting the <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Source Year</span> and <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Target Year</span> from the dashboard above.
                        </p>
                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--primary)' }} />
                            <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: 'var(--border-color)' }} />
                            <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: 'var(--border-color)' }} />
                        </div>
                    </motion.div>
                </Card>
            )}
        </motion.div>
    );
};

export default StudentPromotion;
