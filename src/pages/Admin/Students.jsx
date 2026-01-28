import React, { useEffect, useState } from 'react';
import { studentService } from '../../services';
import { motion } from 'framer-motion';
import {
    Users, Plus, Mail,
    Trash2, Edit2, GraduationCap, Star
} from 'lucide-react';
import { Button, Badge, Avatar, Card, ProgressBar } from '../../components/atoms';
import { SearchBar, Modal, FormField, Table, SelectField } from '../../components/molecules';

import { useStudents, useClasses } from '../../hooks';

const Students = () => {
    const { data: students, loading: studentsLoading, error: studentsError, refetch: refetchStudents } = useStudents();
    const { data: classes, loading: classesLoading, error: classesError } = useClasses();

    const studentsList = students || [];
    const classesList = classes || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState('All');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        class_id: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const loading = studentsLoading || classesLoading;
    const error = studentsError || classesError;

    const fetchData = async () => {
        await refetchStudents();
    };


    const handleOpenAdd = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', email: '', password: 'password', class_id: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (student) => {
        setIsEditMode(true);
        setEditingId(student.id);
        setFormData({
            name: student.user.name,
            email: student.user.email,
            password: '',
            class_id: student.class_id
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditMode) {
                await studentService.update(editingId, formData);
            } else {
                await studentService.create(formData);
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
        if (!window.confirm('Are you sure you want to delete this student account?')) return;
        try {
            await studentService.delete(id);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredStudents = studentsList.filter(s => {
        const matchesSearch = s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = selectedGrade === 'All' || s.school_class?.name === selectedGrade;
        return matchesSearch && matchesGrade;
    });

    const topStudents = [...studentsList]
        .sort((a, b) => (b.grades_avg_score || 0) - (a.grades_avg_score || 0))
        .slice(0, 5);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <GraduationCap size={48} color="var(--primary)" />
            </motion.div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>Student Management</h1>
                <Button onClick={handleOpenAdd}>
                    <Plus size={18} />
                    Enroll Student
                </Button>
            </header>

            <SearchBar
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Find a student..."
            />

            {/* Academic Leaders Section */}
            <section style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ background: '#FEF3C7', color: '#D97706', padding: '8px', borderRadius: '10px' }}>
                        <Star size={20} />
                    </div>
                    <h3 style={{ margin: 0 }}>Academic Leaders</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                    {topStudents.map((student, i) => (
                        <motion.div whileHover={{ y: -5 }} key={i}>
                            <Card style={{ textAlign: 'center', padding: '32px 24px', position: 'relative' }}>
                                {i === 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: '#D97706',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.65rem',
                                        fontWeight: 800
                                    }}>
                                        RANK #1
                                    </div>
                                )}
                                <Avatar
                                    name={student.user?.name}
                                    size={64}
                                    style={{
                                        margin: '0 auto 16px auto',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                                    {student.user?.name}
                                </div>
                                <div className="text-muted text-small" style={{ fontWeight: 600, marginBottom: '16px' }}>
                                    {student.school_class?.name} • {student.school_class?.section}
                                </div>
                                <div style={{
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    padding: '8px',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '1.25rem',
                                    letterSpacing: '-0.02em'
                                }}>
                                    {Number(student.grades_avg_score || 0).toFixed(1)}%
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Students Table */}
            <Table>
                <Table.Head>
                    <Table.Row>
                        <Table.Header>Student</Table.Header>
                        <Table.Header>Grade Level</Table.Header>
                        <Table.Header>Section</Table.Header>
                        <Table.Header>Guardians</Table.Header>
                        <Table.Header>Academic Score</Table.Header>
                        <Table.Header align="right">Actions</Table.Header>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {filteredStudents.map((student) => (
                        <Table.Row key={student.id}>
                            <Table.Cell>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Avatar name={student.user?.name} size={40} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{student.user?.name}</div>
                                        <div className="text-muted text-small" style={{ fontWeight: 500 }}>{student.user?.email}</div>
                                    </div>
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge>{student.school_class?.name}</Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{student.school_class?.section}</span>
                            </Table.Cell>
                            <Table.Cell>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {student.parents?.length > 0 ? student.parents.map((p, j) => (
                                        <Badge key={j} bg="#F1F5F9" style={{ fontSize: '0.7rem' }}>
                                            {p.user?.name}
                                        </Badge>
                                    )) : <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Unlinked</span>}
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <ProgressBar value={student.grades_avg_score || 0} />
                            </Table.Cell>
                            <Table.Cell align="right">
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <Button
                                        variant="outline"
                                        style={{ padding: '8px', border: 'none' }}
                                        onClick={() => handleOpenEdit(student)}
                                    >
                                        <Edit2 size={18} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        style={{ padding: '8px', border: 'none', color: 'var(--danger)' }}
                                        onClick={() => handleDelete(student.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? 'Edit Student' : 'Add New Student'}
                width="500px"
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <FormField
                            label="Full Name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <FormField
                            label="Email Address"
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <SelectField
                            label="Class"
                            required
                            value={formData.class_id}
                            onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                        >
                            <option value="">Select Class</option>
                            {classesList.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                            ))}
                        </SelectField>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <FormField
                            label={isEditMode ? 'New Password (optional)' : 'Initial Password'}
                            type="password"
                            required={!isEditMode}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Processing...' : (isEditMode ? 'Update Student' : 'Add Student')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Students;
