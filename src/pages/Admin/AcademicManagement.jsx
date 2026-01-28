import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Search, Plus, ChevronDown, ChevronUp, Users,
    Edit2, Trash2, Copy, PlusCircle, User, Calendar as CalendarIcon,
    X, Check, LayoutGrid, List
} from 'lucide-react';
import { academicService } from '../../services';
import client from '../../api/client';
import { Button, Badge, Avatar, Card, Input, Select } from '../../components/atoms';
import { Modal, FormField, SelectField, Table, SearchBar } from '../../components/molecules';

// Note: Removed local ActionButton, IconButton, and Modal components in favor of Atomic Design components

const AcademicManagement = () => {
    const [academicData, setAcademicData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('hierarchy'); // hierarchy or calendar
    const [expandedGrades, setExpandedGrades] = useState({});
    const [expandedSections, setExpandedSections] = useState({});

    // Modal states
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeGrade, setActiveGrade] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [itemType, setItemType] = useState(null); // 'grade', 'section', 'subject'
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');

    const [newGradeName, setNewGradeName] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [editValue, setEditValue] = useState('');

    // Schedule states
    const [schedules, setSchedules] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showTimeslotModal, setShowTimeslotModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        subject_id: '',
        day_of_week: 'Monday',
        start_time: '08:00',
        end_time: '09:30',
        room: ''
    });

    const [copyMessage, setCopyMessage] = useState(null);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopyMessage(`${text} copied to clipboard!`);
        setTimeout(() => setCopyMessage(null), 2000);
    };


    useEffect(() => {
        fetchHierarchy();
    }, []);

    useEffect(() => {
        if (viewMode === 'calendar') {
            fetchSchedules();
        }
    }, [viewMode, selectedGrade, selectedSection]);

    const fetchHierarchy = async () => {
        try {
            setLoading(true);
            const response = await academicService.getHierarchy();
            // Critical safety check: Ensure data is an array
            const data = Array.isArray(response.data) ? response.data : [];
            if (!Array.isArray(response.data)) {
                console.error('Academic Data is not an array:', response.data);
            }
            setAcademicData(data);

            // Expand first grade by default
            if (data.length > 0) {
                setExpandedGrades({ [data[0].name]: true });
                if (data[0].sections && data[0].sections.length > 0) {
                    setExpandedSections({ [data[0].sections[0].id]: true });
                }

                // Initialize filters if empty
                if (!selectedGrade) setSelectedGrade(data[0].name);
                if (!selectedSection && (data[0].sections || []).length > 0) {
                    setSelectedSection(data[0].sections[0].name);
                }
            }
        } catch (err) {
            setError('Failed to load academic data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        try {
            const grade = academicData.find(g => g.name === selectedGrade);
            const section = grade?.sections.find(s => s.name === selectedSection);

            if (section) {
                const response = await academicService.getSchedules({ params: { class_id: section.id } });
                setSchedules(Array.isArray(response.data) ? response.data : []);
            }
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        }
    };

    const toggleGrade = (gradeName) => {
        setExpandedGrades(prev => ({
            ...prev,
            [gradeName]: !prev[gradeName]
        }));
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) return;
        try {
            setLoading(true);
            await academicService.createGradeSubject({
                grade_name: activeGrade,
                subject_name: newSubjectName,
                subject_code: newSubjectCode
            });
            setNewSubjectName('');
            setNewSubjectCode('');
            setShowSubjectModal(false);

            await fetchHierarchy();
        } catch (err) {
            console.error('Failed to add subject:', err);
            alert('Failed to add subject');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGrade = async () => {
        if (!newGradeName.trim()) return;
        try {
            setLoading(true);
            await academicService.createGrade({
                name: newGradeName
            });
            setNewGradeName('');
            setShowGradeModal(false);
            await fetchHierarchy();
        } catch (err) {
            console.error('Failed to add grade:', err);
            alert('Failed to add grade');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = async () => {
        if (!newSectionName.trim()) return;
        try {
            setLoading(true);
            await academicService.createSection({
                grade_name: activeGrade,
                section: newSectionName
            });
            setNewSectionName('');
            setShowSectionModal(false);
            await fetchHierarchy();
        } catch (err) {
            console.error('Failed to add section:', err);
            alert('Failed to add section');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!activeItem) return;
        try {
            setLoading(true);
            if (itemType === 'grade') {
                await academicService.deleteGrade({ name: activeItem.name });
            } else if (itemType === 'section') {
                await academicService.deleteSection(activeItem.id);
            } else if (itemType === 'subject') {
                await academicService.deleteGradeSubject({ grade_name: activeGrade, subject_id: activeItem.id });
            }
            setShowDeleteModal(false);
            await fetchHierarchy();
        } catch (err) {
            console.error('Failed to delete:', err);
            alert('Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!activeItem || !editValue.trim()) return;
        try {
            setLoading(true);
            if (itemType === 'grade') {
                await academicService.updateGrade({ old_name: activeItem.name, new_name: editValue });
            } else if (itemType === 'section') {
                await academicService.updateSection(activeItem.id, { name: editValue });
            } else if (itemType === 'subject') {
                await academicService.updateSubject(activeItem.id, { name: editValue });
            }
            setShowEditModal(false);
            await fetchHierarchy();
        } catch (err) {
            console.error('Failed to update:', err);
            alert('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedule = async () => {
        if (!newSchedule.subject_id) return alert('Please select a subject');
        try {
            const grade = academicData.find(g => g.name === selectedGrade);
            const section = grade?.sections.find(s => s.name === selectedSection);

            if (!section) return alert('Please select a grade and section');

            setActionLoading(true);
            await academicService.createSchedule({
                ...newSchedule,
                class_id: section.id
            });
            setShowScheduleModal(false);
            setNewSchedule({
                subject_id: '',
                day_of_week: 'Monday',
                start_time: '08:00',
                end_time: '09:30',
                room: ''
            });
            await fetchSchedules();
        } catch (err) {
            console.error('Failed to add schedule:', err);
            alert('Failed to add schedule entry');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm('Are you sure you want to delete this class entry?')) return;
        try {
            setActionLoading(true);
            await academicService.deleteSchedule(scheduleId);
            await fetchSchedules();
        } catch (err) {
            console.error('Failed to delete schedule:', err);
            alert('Failed to delete schedule entry');
        } finally {
            setActionLoading(false);
        }
    };


    const filteredData = (Array.isArray(academicData) ? academicData : []).filter(grade =>
        (grade.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grade.sections || []).some(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );



    if (loading && academicData.length === 0) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Loading Academic Data...</div>
        </div>
    );

    if (error && academicData.length === 0) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FCA5A5', margin: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Data Load Error</h3>
            <p style={{ margin: 0 }}>{error}</p>
            <Button variant="outline" onClick={fetchHierarchy} style={{ marginTop: '16px' }}>Try Refreshing</Button>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Academic Management</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* View Switcher */}
                    <div style={{ display: 'flex', background: '#F3F4F6', padding: '4px', borderRadius: '10px', marginRight: '12px' }}>
                        <Button
                            variant={viewMode === 'hierarchy' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('hierarchy')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: viewMode === 'hierarchy' ? 'white' : 'transparent',
                                boxShadow: viewMode === 'hierarchy' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                color: viewMode === 'hierarchy' ? 'var(--text-main)' : 'var(--text-muted)',
                                height: 'auto'
                            }}
                            icon={<List size={16} />}
                        >
                            List
                        </Button>
                        <Button
                            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('calendar')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: viewMode === 'calendar' ? 'white' : 'transparent',
                                boxShadow: viewMode === 'calendar' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                color: viewMode === 'calendar' ? 'var(--text-main)' : 'var(--text-muted)',
                                height: 'auto'
                            }}
                            icon={<CalendarIcon size={16} />}
                        >
                            Calendar
                        </Button>
                    </div>

                    <Select style={{ height: '42px', width: 'auto' }}>
                        <option>2024-2025</option>
                    </Select>

                    <SearchBar
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search grades or subjects..."
                        style={{ width: '300px' }}
                    />

                    <Button
                        onClick={() => setShowGradeModal(true)}
                        icon={<Plus size={18} />}
                    >
                        Add Grade
                    </Button>
                </div>
            </div>

            {viewMode === 'hierarchy' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {filteredData.length === 0 ? (
                        <Card style={{ textAlign: 'center', padding: '80px', borderStyle: 'dashed', border: '2px dashed var(--border-color)' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}><BookOpen size={48} style={{ margin: '0 auto' }} /></div>
                            <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0' }}>No Academic Data Found</h3>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>There are no grades or sections defined for the current academic year.</p>
                            <Button style={{ marginTop: '24px' }} onClick={() => setShowGradeModal(true)} icon={<Plus size={18} />}>
                                Create First Grade
                            </Button>
                        </Card>
                    ) : (
                        filteredData.map((grade) => (
                            <Card key={grade.name} style={{ padding: '0', overflow: 'hidden' }}>
                                {/* Grade Title Bar */}
                                <div
                                    onClick={() => toggleGrade(grade.name)}
                                    style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: expandedGrades[grade.name] ? '1px solid var(--border-color)' : 'none' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                            {grade.name} <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem', marginLeft: '8px' }}>({(grade.sections || []).length} Sections)</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                icon={<BookOpen size={14} />}
                                                onClick={() => { setActiveGrade(grade.name); setShowSubjectModal(true); }}
                                            >
                                                Add Subject
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                icon={<PlusCircle size={14} />}
                                                onClick={() => { setActiveGrade(grade.name); setShowSectionModal(true); }}
                                            >
                                                Add Section
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                style={{ padding: '8px', minWidth: 'auto', border: 'none' }}
                                                onClick={() => { setActiveItem(grade); setItemType('grade'); setEditValue(grade.name); setShowEditModal(true); }}
                                                icon={<Edit2 size={16} />}
                                            />
                                            <Button
                                                size="small"
                                                variant="outline"
                                                style={{ padding: '8px', minWidth: 'auto', border: 'none', color: 'var(--danger)' }}
                                                onClick={() => { setActiveItem(grade); setItemType('grade'); setShowDeleteModal(true); }}
                                                icon={<Trash2 size={16} />}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        {expandedGrades[grade.name] ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </div>
                                </div>

                                {/* Grade Content */}
                                <AnimatePresence>
                                    {expandedGrades[grade.name] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '32px' }}>
                                                {/* Sections */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                                                    {(grade.sections || []).map((section) => (
                                                        <div key={section.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                                                            <div
                                                                onClick={() => toggleSection(section.id)}
                                                                style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-main)' }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Section {section.name}</div>
                                                                    <Button
                                                                        size="small"
                                                                        variant="outline"
                                                                        style={{ padding: '6px', minWidth: 'auto', border: 'none' }}
                                                                        onClick={() => { setActiveItem(section); setItemType('section'); setEditValue(section.name); setShowEditModal(true); }}
                                                                        icon={<Edit2 size={14} />}
                                                                    />
                                                                    <Button
                                                                        size="small"
                                                                        variant="outline"
                                                                        style={{ padding: '6px', minWidth: 'auto', border: 'none', color: 'var(--danger)' }}
                                                                        onClick={() => { setActiveItem(section); setItemType('section'); setShowDeleteModal(true); }}
                                                                        icon={<Trash2 size={14} />}
                                                                    />
                                                                </div>
                                                                <div style={{ color: 'var(--text-muted)' }}>
                                                                    {expandedSections[section.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                                </div>
                                                            </div>

                                                            <AnimatePresence>
                                                                {expandedSections[section.id] && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        style={{ overflow: 'hidden', borderTop: '1px solid var(--border-color)' }}
                                                                    >
                                                                        <div style={{ padding: '24px' }}>
                                                                            {/* Students Info */}
                                                                            <div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                                                                    <h4 style={{ margin: 0 }}>Students in Section {section.name}</h4>
                                                                                    <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontWeight: 800 }}>{section.students_count} Total</Badge>
                                                                                </div>
                                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                                                                    {(section.students || []).length > 0 ? (
                                                                                        section.students.slice(0, 4).map((student, idx) => (
                                                                                            <div key={student.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', background: '#F9FAFB' }}>
                                                                                                <div style={{ position: 'relative' }}>
                                                                                                    <Avatar name={student.name} size={42} />
                                                                                                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: idx % 2 === 0 ? '#10B981' : '#F59E0B', border: '2px solid white' }} />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{student.name}</div>
                                                                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: S{student.id.toString().padStart(3, '0')}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))
                                                                                    ) : (
                                                                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', gridColumn: '1 / -1', padding: '12px', textAlign: 'center' }}>No students enrolled in this section.</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Grade Subjects Table */}
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Subjects for {grade.name}</h3>
                                                    <Table>
                                                        <Table.Head>
                                                            <Table.Row>
                                                                <Table.Header>Subject Name</Table.Header>
                                                                <Table.Header>Subject Code</Table.Header>
                                                                <Table.Header align="right">Actions</Table.Header>
                                                            </Table.Row>
                                                        </Table.Head>
                                                        <Table.Body>
                                                            {(grade.subjects || []).map((sub) => (
                                                                <Table.Row key={sub.id}>
                                                                    <Table.Cell style={{ fontWeight: 700 }}>{sub.name}</Table.Cell>
                                                                    <Table.Cell><code style={{ color: 'var(--primary)', fontWeight: 600 }}>{sub.code}</code></Table.Cell>
                                                                    <Table.Cell align="right">
                                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                            <Button
                                                                                size="small"
                                                                                variant="outline"
                                                                                style={{ padding: '6px', minWidth: 'auto', border: 'none' }}
                                                                                onClick={() => { setActiveItem(sub); setItemType('subject'); setEditValue(sub.name); setActiveGrade(grade.name); setShowEditModal(true); }}
                                                                                icon={<Edit2 size={16} />}
                                                                            />
                                                                            <Button
                                                                                size="small"
                                                                                variant="outline"
                                                                                style={{ padding: '6px', minWidth: 'auto', border: 'none', color: 'var(--danger)' }}
                                                                                onClick={() => { setActiveItem(sub); setItemType('subject'); setActiveGrade(grade.name); setShowDeleteModal(true); }}
                                                                                icon={<Trash2 size={16} />}
                                                                            />
                                                                            <Button
                                                                                size="small"
                                                                                variant="outline"
                                                                                style={{ padding: '6px', minWidth: 'auto', border: 'none' }}
                                                                                onClick={() => handleCopy(sub.code)}
                                                                                icon={<Copy size={16} />}
                                                                            />
                                                                        </div>
                                                                    </Table.Cell>
                                                                </Table.Row>
                                                            ))}
                                                        </Table.Body>
                                                    </Table>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))
                    )}
                </div>

            ) : (
                /* Calendar View Implementation */
                <Card style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <h2 style={{ margin: 0 }}>Weekly Class Schedule</h2>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Select
                                    style={{ width: '160px' }}
                                    value={selectedGrade}
                                    onChange={(e) => {
                                        setSelectedGrade(e.target.value);
                                        const grade = academicData.find(g => g.name === e.target.value);
                                        if (grade && grade.sections.length > 0) {
                                            setSelectedSection(grade.sections[0].name);
                                        }
                                    }}
                                >
                                    {academicData.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                                </Select>
                                <Select
                                    style={{ width: '180px' }}
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                >
                                    {academicData.find(g => g.name === selectedGrade)?.sections.map(s => (
                                        <option key={s.id} value={s.name}>Section {s.name}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="outline" onClick={() => setShowTimeslotModal(true)} icon={<Edit2 size={16} />}>Manage Timeslots</Button>
                            <Button onClick={() => setShowScheduleModal(true)} icon={<Plus size={16} />}>Add Entry</Button>
                        </div>
                    </div>

                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Header style={{ width: '120px' }}>Time</Table.Header>
                                <Table.Header>Monday</Table.Header>
                                <Table.Header>Tuesday</Table.Header>
                                <Table.Header>Wednesday</Table.Header>
                                <Table.Header>Thursday</Table.Header>
                                <Table.Header>Friday</Table.Header>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {[
                                { label: '08:00 - 09:30', start: '08:00' },
                                { label: '09:45 - 11:15', start: '09:45' },
                                { label: '11:30 - 13:00', start: '11:30' },
                                { label: '14:00 - 15:30', start: '14:00' },
                                { label: '15:45 - 17:15', start: '15:45' }
                            ].map((slot) => (
                                <Table.Row key={slot.label}>
                                    <Table.Cell style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{slot.label}</Table.Cell>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                                        const entry = schedules.find(s => s.day_of_week === day && s.start_time.startsWith(slot.start));
                                        const colors = ['#EEF2FF', '#ECFDF5', '#FFFBEB', '#FEF2F2', '#F5F3FF'];
                                        const textColors = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED'];
                                        const colorIdx = entry ? (entry.subject_id % colors.length) : 0;

                                        return (
                                            <Table.Cell key={day} style={{ padding: '8px', verticalAlign: 'top', height: '110px' }}>
                                                {entry && (
                                                    <div style={{
                                                        background: colors[colorIdx],
                                                        color: textColors[colorIdx],
                                                        padding: '12px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 800,
                                                        border: '1px solid rgba(0,0,0,0.05)',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <div style={{ marginBottom: '4px', fontSize: '0.9rem' }}>{entry.subject.name}</div>
                                                        <div style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 600 }}>
                                                            {entry.room || 'No Room'}
                                                        </div>
                                                    </div>
                                                )}
                                            </Table.Cell>
                                        );
                                    })}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card>
            )}


            {/* Modals for Management */}
            <Modal
                isOpen={showGradeModal}
                title="Add New Grade"
                onClose={() => { setShowGradeModal(false); setNewGradeName(''); }}
            >
                <form onSubmit={e => { e.preventDefault(); handleAddGrade(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <FormField
                        label="GRADE NAME"
                        placeholder="e.g. 10th Grade"
                        value={newGradeName}
                        onChange={(e) => setNewGradeName(e.target.value)}
                        required
                    />
                    <SelectField label="ACADEMIC YEAR">
                        <option>2024-2025</option>
                        <option>2023-2024</option>
                    </SelectField>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <Button type="submit" style={{ flex: 1 }}>Create Grade</Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={() => { setShowGradeModal(false); setNewGradeName(''); }}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showSectionModal}
                title={`Add Section to ${activeGrade}`}
                onClose={() => { setShowSectionModal(false); setNewSectionName(''); }}
            >
                <form onSubmit={e => { e.preventDefault(); handleAddSection(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <FormField
                        label="SECTION NAME"
                        placeholder="e.g. Section C"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        required
                    />
                    <FormField label="CAPACITY" type="number" placeholder="30" />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <Button type="submit" style={{ flex: 1 }}>Add Section</Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={() => { setShowSectionModal(false); setNewSectionName(''); }}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showSubjectModal}
                title={`Add Subject to ${activeGrade}`}
                onClose={() => { setShowSubjectModal(false); setNewSubjectName(''); setNewSubjectCode(''); }}
            >
                <form onSubmit={e => { e.preventDefault(); handleAddSubject(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <FormField
                        label="SUBJECT NAME"
                        placeholder="e.g. Advanced Physics"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        required
                    />
                    <FormField
                        label="SUBJECT CODE"
                        placeholder="e.g. PHY401"
                        value={newSubjectCode}
                        onChange={(e) => setNewSubjectCode(e.target.value)}
                        required
                    />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <Button type="submit" style={{ flex: 1 }}>Add Subject</Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={() => { setShowSubjectModal(false); setNewSubjectName(''); setNewSubjectCode(''); }}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showEditModal}
                title={`Edit ${itemType}`}
                onClose={() => setShowEditModal(false)}
            >
                <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <FormField
                        label="UPDATE NAME"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        required
                    />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <Button type="submit" style={{ flex: 1 }}>Save Changes</Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                title="Confirm Deletion"
                onClose={() => setShowDeleteModal(false)}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--danger)', marginBottom: '20px' }}><Trash2 size={56} style={{ margin: '0 auto' }} /></div>
                    <p style={{ marginBottom: '32px', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.5 }}>
                        Are you sure you want to delete this <strong>{itemType}</strong>?<br />
                        This action <span style={{ color: 'var(--danger)', fontWeight: 700 }}>cannot be undone</span>.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button style={{ flex: 1, backgroundColor: 'var(--danger)' }} onClick={handleDelete}>Delete Forever</Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showScheduleModal}
                title={`Schedule for ${selectedGrade} - ${selectedSection}`}
                onClose={() => setShowScheduleModal(false)}
            >
                <form onSubmit={e => { e.preventDefault(); handleAddSchedule(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <SelectField
                        label="SUBJECT"
                        value={newSchedule.subject_id}
                        onChange={(e) => setNewSchedule({ ...newSchedule, subject_id: e.target.value })}
                        required
                    >
                        <option value="">Select Subject</option>
                        {(academicData.find(g => g.name === selectedGrade)?.subjects || []).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </SelectField>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <SelectField
                            label="DAY"
                            value={newSchedule.day_of_week}
                            onChange={(e) => setNewSchedule({ ...newSchedule, day_of_week: e.target.value })}
                        >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </SelectField>
                        <FormField
                            label="ROOM"
                            placeholder="e.g. Room 102"
                            value={newSchedule.room}
                            onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <SelectField
                            label="START TIME"
                            value={newSchedule.start_time}
                            onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                        >
                            <option value="08:00">08:00</option>
                            <option value="09:45">09:45</option>
                            <option value="11:30">11:30</option>
                            <option value="14:00">14:00</option>
                            <option value="15:45">15:45</option>
                        </SelectField>
                        <SelectField
                            label="END TIME"
                            value={newSchedule.end_time}
                            onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                        >
                            <option value="09:30">09:30</option>
                            <option value="11:15">11:15</option>
                            <option value="13:00">13:00</option>
                            <option value="15:30">15:30</option>
                            <option value="17:15">17:15</option>
                        </SelectField>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <Button type="submit" style={{ flex: 1 }} disabled={actionLoading}>
                            {actionLoading ? 'Saving...' : 'Save Entry'}
                        </Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showTimeslotModal}
                title={`Manage Timeslots for ${selectedGrade} - ${selectedSection}`}
                onClose={() => setShowTimeslotModal(false)}
            >
                <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                    {schedules.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: 600 }}>No schedule entries found.</div>
                    ) : (
                        [...schedules].sort((a, b) => a.day_of_week.localeCompare(b.day_of_week)).map(s => (
                            <div key={s.id} style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
                                <div>
                                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{s.subject.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>{s.day_of_week} • {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</div>
                                    {s.room && <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>Room: {s.room}</div>}
                                </div>
                                <Button
                                    size="small"
                                    variant="outline"
                                    style={{ padding: '8px', minWidth: 'auto', border: 'none', color: 'var(--danger)' }}
                                    onClick={() => handleDeleteSchedule(s.id)}
                                    icon={<Trash2 size={18} />}
                                />
                            </div>
                        ))
                    )}
                </div>
                <div style={{ marginTop: '24px' }}>
                    <Button variant="outline" style={{ width: '100%' }} onClick={() => setShowTimeslotModal(false)}>Close</Button>
                </div>
            </Modal>

            {/* Copy Notification Toast */}
            <AnimatePresence>
                {copyMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{
                            position: 'fixed',
                            bottom: '32px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'var(--text-main)',
                            color: 'white',
                            padding: '14px 28px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: 'var(--shadow-xl)',
                            zIndex: 2000,
                            fontWeight: 700
                        }}
                    >
                        <Check size={20} style={{ color: '#10B981' }} />
                        {copyMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import ErrorBoundary from '../../components/ErrorBoundary';

const AcademicManagementWithBoundary = () => (
    <ErrorBoundary>
        <AcademicManagement />
    </ErrorBoundary>
);

export default AcademicManagementWithBoundary;
