import React, { useEffect, useState } from 'react';
import { parentService, studentService } from '../../services';
import { motion } from 'framer-motion';
import {
    Users, Plus, Mail,
    Trash2, Edit2, Baby
} from 'lucide-react';
import { Button, Badge, Avatar } from '../../components/atoms';
import { SearchBar, Modal, FormField, Table } from '../../components/molecules';

const Parents = () => {
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        student_ids: []
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pRes, sRes] = await Promise.all([
                parentService.getAll(),
                studentService.getAll()
            ]);
            setParents(pRes.data);
            setStudents(sRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData({
            name: '',
            email: '',
            password: 'password',
            student_ids: []
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (parent) => {
        setIsEditMode(true);
        setEditingId(parent.id);
        setFormData({
            name: parent.user.name,
            email: parent.user.email,
            password: '',
            student_ids: parent.students.map(s => s.id)
        });
        setIsModalOpen(true);
    };

    const handleStudentToggle = (studentId) => {
        setFormData(prev => ({
            ...prev,
            student_ids: prev.student_ids.includes(studentId)
                ? prev.student_ids.filter(id => id !== studentId)
                : [...prev.student_ids, studentId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditMode) {
                await parentService.update(editingId, formData);
            } else {
                await parentService.create(formData);
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
        if (!window.confirm('Are you sure you want to delete this parent account?')) return;
        try {
            await parentService.delete(id);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredParents = parents.filter(p =>
        p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading Parents...</div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Parent Management</h1>
                <Button
                    onClick={handleOpenAdd}
                >
                    <Plus size={18} />
                    Add Parent
                </Button>
            </div>

            <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
            />

            <Table>
                <Table.Head>
                    <Table.Row>
                        <Table.Header>Parent</Table.Header>
                        <Table.Header>Linked Students</Table.Header>
                        <Table.Header align="right">Actions</Table.Header>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {filteredParents.map((parent) => (
                        <Table.Row key={parent.id}>
                            <Table.Cell>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Avatar name={parent.user?.name} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                                            {parent.user?.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                            <Mail size={12} /> {parent.user?.email}
                                        </div>
                                    </div>
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {parent.students?.length > 0 ? (
                                        parent.students.map((student, i) => (
                                            <Badge key={i} bg="#F0FDF4" color="#166534" icon={Baby}>
                                                {student.user?.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No linked students</span>
                                    )}
                                </div>
                            </Table.Cell>
                            <Table.Cell align="right">
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <Button
                                        variant="outline"
                                        style={{ padding: '8px', border: 'none' }}
                                        onClick={() => handleOpenEdit(parent)}
                                    >
                                        <Edit2 size={18} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        style={{ padding: '8px', border: 'none', color: 'var(--danger)' }}
                                        onClick={() => handleDelete(parent.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? 'Edit Parent' : 'Add New Parent'}
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
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>Link Students</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '12px'
                        }}>
                            {students.map(student => (
                                <label key={student.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.student_ids.includes(student.id)}
                                        onChange={() => handleStudentToggle(student.id)}
                                    />
                                    {student.user?.name}
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        ({student.school_class?.name || 'No Class'})
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Processing...' : (isEditMode ? 'Update Parent' : 'Add Parent')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Parents;
