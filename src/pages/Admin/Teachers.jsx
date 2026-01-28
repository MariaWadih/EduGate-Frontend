import React, { useEffect, useState } from 'react';
import { teacherService } from '../../services';
import { motion } from 'framer-motion';
import {
    Users, Plus, Mail,
    Trash2, Edit2
} from 'lucide-react';
import { Button, Badge, Avatar } from '../../components/atoms';
import { SearchBar, Modal, FormField, Table, SelectField } from '../../components/molecules';

import { useTeachers, useClasses, useSubjects } from '../../hooks';

const Teachers = () => {
    const { data: teachers, loading: teachersLoading, error: teachersError, refetch: refetchTeachers } = useTeachers();
    const { data: classes, loading: classesLoading, error: classesError } = useClasses();
    const { data: subjects, loading: subjectsLoading, error: subjectsError } = useSubjects();

    const teachersList = teachers || [];
    const classesList = classes || [];
    const subjectsList = subjects || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        assignments: [{ class_id: '', subject_id: '' }]
    });
    const [isSaving, setIsSaving] = useState(false);

    const loading = teachersLoading || classesLoading || subjectsLoading;
    const error = teachersError || classesError || subjectsError;

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
            assignments: [{ class_id: '', subject_id: '' }]
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
                : [{ class_id: '', subject_id: '' }]
        });
        setIsModalOpen(true);
    };

    const handleAddAssignment = () => {
        setFormData({
            ...formData,
            assignments: [...formData.assignments, { class_id: '', subject_id: '' }]
        });
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
            alert('Operation failed: ' + (err.response?.data?.message || err.message));
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

    const filteredTeachers = teachersList.filter(t =>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Teacher Management</h1>
                <Button onClick={handleOpenAdd}>
                    <Plus size={18} />
                    Add Teacher
                </Button>
            </div>

            <SearchBar
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
            />

            <Table>
                <Table.Head>
                    <Table.Row>
                        <Table.Header>Teacher</Table.Header>
                        <Table.Header>Subjects</Table.Header>
                        <Table.Header>Classes</Table.Header>
                        <Table.Header align="right">Actions</Table.Header>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {filteredTeachers.map((teacher) => (
                        <Table.Row key={teacher.id}>
                            <Table.Cell>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Avatar name={teacher.user?.name} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                                            {teacher.user?.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                            <Mail size={12} /> {teacher.user?.email}
                                        </div>
                                    </div>
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {teacher.assignments?.length > 0 ? (
                                        [...new Set(teacher.assignments.map(a => a.subject?.name))].filter(Boolean).map((subj, i) => (
                                            <Badge key={i} bg="var(--primary-light)" color="var(--primary)">
                                                {subj}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No subjects</span>
                                    )}
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {teacher.assignments?.length > 0 ? (
                                        [...new Set(teacher.assignments.map(a => a.school_class ? `${a.school_class.name} ${a.school_class.section}` : null))].filter(Boolean).map((cls, i) => (
                                            <Badge key={i} bg="#F3F4F6" color="var(--text-muted)">
                                                {cls}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No classes</span>
                                    )}
                                </div>
                            </Table.Cell>
                            <Table.Cell align="right">
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <Button
                                        variant="outline"
                                        style={{ padding: '8px', border: 'none' }}
                                        onClick={() => handleOpenEdit(teacher)}
                                    >
                                        <Edit2 size={18} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        style={{ padding: '8px', border: 'none', color: 'var(--danger)' }}
                                        onClick={() => handleDelete(teacher.id)}
                                    >
                                        <Trash2 size={18} />
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
