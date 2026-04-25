import React, { useEffect, useState } from 'react';
import { teacherService } from '../../services';
import { motion } from 'framer-motion';
import {
    Users, Plus, Mail, Trash2, Edit2, Calendar, UserMinus,
    CheckCircle, BookOpen, GraduationCap, LogOut
} from 'lucide-react';
import { Button, Badge, Avatar } from '../../components/atoms';
import { SearchBar, Modal, FormField, Table, SelectField } from '../../components/molecules';

import { useTeachers, useClasses, useSubjects, usePastTeachers } from '../../hooks';
import { useAcademicYear } from '../../context/AcademicYearContext';

const Teachers = () => {
    const { activeYear, loading: yearLoading } = useAcademicYear();
    const { data: teachers, loading: teachersLoading, error: teachersError, refetch: refetchTeachers } = useTeachers(
        yearLoading ? null : { academic_year_id: activeYear?.id }
    );
    const { data: pastTeachers, loading: pastLoading, refetch: refetchPast } = usePastTeachers();
    const { data: classes, loading: classesLoading } = useClasses();
    const { data: subjects, loading: subjectsLoading } = useSubjects();

    const [activeTab, setActiveTab] = useState('current');
    const teachersList = teachers || [];
    const classesList = classes || [];
    const subjectsList = subjects || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('active');
    const [isReactivating, setIsReactivating] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        assignments: [{ class_id: '', subject_id: '' }],
        status: 'active'
    });
    const [isSaving, setIsSaving] = useState(false);

    const loading = yearLoading || teachersLoading || classesLoading || subjectsLoading;

    const fetchData = async () => {
        await refetchTeachers();
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData({
            name: '',
            email: '',
            password: 'password',
            assignments: [{ class_id: '', subject_id: '' }],
            status: 'active'
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (teacher) => {
        setIsEditMode(true);
        setEditingId(teacher.id);
        setFormData({
            name: teacher.user.name,
            email: teacher.user.email,
            password: '',
            assignments: teacher.assignments.length > 0
                ? teacher.assignments.map(a => ({ class_id: a.class_id, subject_id: a.subject_id }))
                : [{ class_id: '', subject_id: '' }],
            status: teacher.status
        });
        setIsModalOpen(true);
    };

    const handleAddAssignment = () => {
        setFormData({ ...formData, assignments: [...formData.assignments, { class_id: '', subject_id: '' }] });
    };

    const handleRemoveAssignment = (index) => {
        const updated = formData.assignments.filter((_, i) => i !== index);
        setFormData({ ...formData, assignments: updated });
    };

    const handleAssignmentChange = (index, field, value) => {
        const updated = [...formData.assignments];
        updated[index][field] = value;
        setFormData({ ...formData, assignments: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validAssignments = formData.assignments.filter(a => a.class_id && a.subject_id);
        setIsSaving(true);
        try {
            if (isEditMode) {
                await teacherService.update(editingId, { ...formData, assignments: validAssignments });
            } else {
                await teacherService.create({ ...formData, assignments: validAssignments });
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert('❌ Operation Failed\n\n' + errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this teacher account?')) return;
        try {
            await teacherService.delete(id);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        const teacher = teachersList.find(t => t.id === id);
        const hasAssignments = teacher?.assignments?.length > 0;

        let confirmMsg = `Are you sure you want to change teacher status to ${newStatus}?`;
        if (newStatus === 'inactive' && hasAssignments) {
            confirmMsg += '\n\n⚠️ WARNING: This will remove all current course assignments for this teacher.';
        }
        if (!window.confirm(confirmMsg)) return;

        try {
            await teacherService.updateStatus(id, newStatus);
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert('❌ Status Update Failed\n\n' + errorMsg);
        }
    };

    const handleReactivate = async (teacher) => {
        if (!window.confirm(`Reactivate ${teacher.user?.name} into the current year?`)) return;
        setIsReactivating(teacher.id);
        try {
            await teacherService.reactivate(teacher.id);
            await Promise.all([refetchTeachers(), refetchPast()]);
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsReactivating(null);
        }
    };

    const filteredTeachers = teachersList.filter(t => {
        const matchesSearch = t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const filteredPastTeachers = (pastTeachers || []).filter(t =>
        t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
            >
                <Users size={40} color="var(--primary)" />
            </motion.div>
            <div style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading Teachers...</div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ margin: '0', fontSize: '1.75rem', fontWeight: 700 }}>Teacher Management</h1>
                <Button onClick={handleOpenAdd}>
                    <Plus size={18} />
                    Add Teacher
                </Button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '2px solid var(--border-color)' }}>
                {[
                    { id: 'current', label: 'Current Year' },
                    { id: 'past', label: 'Past Teachers' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            marginBottom: '-2px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ flex: 1 }}>
                    <SearchBar
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder={activeTab === 'current' ? 'Search by name or email...' : 'Search past teachers...'}
                    />
                </div>
                {activeTab === 'current' && (
                    <SelectField value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{ width: '160px' }}>
                        <option value="All">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="former">Former</option>
                    </SelectField>
                )}
            </div>

            {/* Current Year Tab */}
            {activeTab === 'current' && (
                <>
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Header>Teacher</Table.Header>
                                <Table.Header>Joined Date</Table.Header>
                                <Table.Header>Teaching History</Table.Header>
                                <Table.Header>Status</Table.Header>
                                <Table.Header align="right">Actions</Table.Header>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {filteredTeachers.map((teacher) => (
                                <Table.Row key={teacher.id}>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <Avatar name={teacher.user?.name} size={44} />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.2 }}>
                                                    {teacher.user?.name}
                                                </span>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                    <Mail size={12} style={{ opacity: 0.7 }} />
                                                    <span>{teacher.user?.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                            {teacher.joined_at ? new Date(teacher.joined_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '400px' }}>
                                            {teacher.assignments?.length > 0 ? (
                                                teacher.assignments.map((a, i) => (
                                                    <div key={i} style={{
                                                        background: '#f8fafc',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        border: '1px solid #e2e8f0',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        color: '#475569'
                                                    }}>
                                                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{a.subject?.name}</span>
                                                        <span style={{ width: '1px', height: '10px', background: '#cbd5e1' }} />
                                                        <span style={{ fontWeight: 500 }}>{a.school_class?.name}-{a.school_class?.section} ({a.school_class?.academic_year})</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem', fontStyle: 'italic' }}>No active assignments</span>
                                            )}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            bg={teacher.status === 'active' ? '#ECFDF5' : '#FEF2F2'}
                                            color={teacher.status === 'active' ? '#047857' : '#B91C1C'}
                                        >
                                            {teacher.status.toUpperCase()}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {teacher.status === 'active' ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        style={{ width: '32px', height: '32px', padding: '0', borderRadius: '8px', color: '#f59e0b', borderColor: '#fef3c7' }}
                                                        onClick={() => handleUpdateStatus(teacher.id, 'inactive')}
                                                        title="Mark Inactive"
                                                    >
                                                        <UserMinus size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        style={{ width: '32px', height: '32px', padding: '0', borderRadius: '8px', color: '#EF4444', borderColor: '#FEE2E2' }}
                                                        onClick={() => handleUpdateStatus(teacher.id, 'former')}
                                                        title="Mark as Former (Resigned/Terminated)"
                                                    >
                                                        <LogOut size={16} />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    style={{ width: '32px', height: '32px', padding: '0', borderRadius: '8px', color: '#10b981', borderColor: '#d1fae5' }}
                                                    onClick={() => handleUpdateStatus(teacher.id, 'active')}
                                                    title="Reactivate"
                                                >
                                                    <CheckCircle size={16} />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                style={{ width: '32px', height: '32px', padding: '0', borderRadius: '8px', color: '#64748b' }}
                                                onClick={() => handleOpenEdit(teacher)}
                                                title="Edit Details"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                    {filteredTeachers.length === 0 && (
                        <div style={{ padding: '64px', textAlign: 'center' }}>
                            <Users size={64} style={{ color: 'var(--border-color)', marginBottom: '20px' }} />
                            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>
                                No teachers found matching your search.
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Past Teachers Tab */}
            {activeTab === 'past' && (
                <>
                    {pastLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Loading past teachers...
                        </div>
                    ) : (
                        <>
                            <Table>
                                <Table.Head>
                                    <Table.Row>
                                        <Table.Header>Teacher</Table.Header>
                                        <Table.Header>Joined Date</Table.Header>
                                        <Table.Header>Status</Table.Header>
                                        <Table.Header align="right">Actions</Table.Header>
                                    </Table.Row>
                                </Table.Head>
                                <Table.Body>
                                    {filteredPastTeachers.map((teacher) => (
                                        <Table.Row key={teacher.id}>
                                            <Table.Cell>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <Avatar name={teacher.user?.name} size={44} />
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.2 }}>
                                                            {teacher.user?.name}
                                                        </span>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                            <Mail size={12} style={{ opacity: 0.7 }} />
                                                            <span>{teacher.user?.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                                    {teacher.joined_at ? new Date(teacher.joined_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge
                                                    bg={teacher.status === 'active' ? '#ECFDF5' : '#FEF2F2'}
                                                    color={teacher.status === 'active' ? '#047857' : '#B91C1C'}
                                                >
                                                    {teacher.status.toUpperCase()}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell align="right">
                                                <Button
                                                    variant="outline"
                                                    style={{ width: '32px', height: '32px', padding: '0', borderRadius: '8px', color: '#10b981', borderColor: '#d1fae5' }}
                                                    onClick={() => handleReactivate(teacher)}
                                                    disabled={isReactivating === teacher.id}
                                                    title="Reactivate into current year"
                                                >
                                                    <CheckCircle size={16} />
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                            {filteredPastTeachers.length === 0 && (
                                <div style={{ padding: '64px', textAlign: 'center' }}>
                                    <Users size={64} style={{ color: 'var(--border-color)', marginBottom: '20px' }} />
                                    <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>
                                        No past teachers found.
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <FormField
                            label="Full Name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <FormField
                            label="Email Address"
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <FormField
                            label={isEditMode ? 'New Password (leave blank to keep current)' : 'Initial Password'}
                            type="password"
                            required={!isEditMode}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ margin: 0 }}>Course Assignments</h4>
                            <Button
                                variant="outline"
                                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                                onClick={handleAddAssignment}
                            >
                                + Add Row
                            </Button>
                        </div>
                        {formData.assignments.map((assignment, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <SelectField
                                        value={assignment.class_id}
                                        onChange={e => handleAssignmentChange(idx, 'class_id', e.target.value)}
                                    >
                                        <option value="">Select Class</option>
                                        {classesList.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                        ))}
                                    </SelectField>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <SelectField
                                        value={assignment.subject_id}
                                        onChange={e => handleAssignmentChange(idx, 'subject_id', e.target.value)}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjectsList.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </SelectField>
                                </div>
                                {formData.assignments.length > 1 && (
                                    <Button
                                        variant="outline"
                                        style={{ padding: '10px', color: 'var(--danger)', border: 'none' }}
                                        onClick={() => handleRemoveAssignment(idx)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    {isEditMode && (
                        <div style={{ marginBottom: '24px' }}>
                            <SelectField
                                label="Employment Status"
                                required
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="former">Former</option>
                            </SelectField>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Processing...' : (isEditMode ? 'Update Teacher' : 'Add Teacher')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Teachers;