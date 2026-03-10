import React, { useEffect, useState } from 'react';
import { parentService, studentService } from '../../services';
import { useClasses } from '../../hooks';
import { motion } from 'framer-motion';
import {
    Users, Plus, Mail,
    Trash2, Edit2, Baby
} from 'lucide-react';
import { Button, Badge, Avatar, Card } from '../../components/atoms';
import { SearchBar, Modal, FormField, Table, SelectField } from '../../components/molecules';

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

    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    const { data: classes } = useClasses();
    const classesList = classes || [];

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

    const years = ['All', ...new Set(classesList.map(c => c.academic_year))];

    const filteredParents = parents.filter(p => {
        const matchesSearch = p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const hasStudentsInYear = selectedYear === 'All' || (p.students && p.students.some(s => s.school_class?.academic_year === selectedYear));
        const hasActiveStudents = p.students && p.students.some(s => s.status === 'active');

        const matchesStatus = selectedStatus === 'All' ||
            (selectedStatus === 'active' && hasActiveStudents) ||
            (selectedStatus === 'inactive' && !hasActiveStudents);

        return matchesSearch && hasStudentsInYear && matchesStatus;
    });

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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Parent Management</h1>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage family accounts and student-guardian relationships</p>
                </div>
                <Button
                    onClick={handleOpenAdd}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 600 }}
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Add Guardian
                </Button>
            </div>

            <Card style={{ padding: '0', marginBottom: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <SearchBar
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search parents by name or email..."
                            style={{ maxWidth: '100%', marginBottom: 0 }}
                        />
                    </div>

                    <SelectField
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        style={{ width: '160px' }}
                    >
                        {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
                    </SelectField>

                    <SelectField
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                        style={{ width: '180px' }}
                    >
                        <option value="All">All Status</option>
                        <option value="active">Active Guardians</option>
                        <option value="inactive">Inactive Guardians</option>
                    </SelectField>
                </div>

                <Table>
                    <Table.Head>
                        <Table.Row>
                            <Table.Header style={{ paddingLeft: '24px' }}>Parent / Guardian</Table.Header>
                            <Table.Header>Linked Students</Table.Header>
                            <Table.Header align="right" style={{ paddingRight: '24px' }}>Actions</Table.Header>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {filteredParents.map((parent) => (
                            <Table.Row key={parent.id} style={{ transition: 'background 0.2s ease' }}>
                                <Table.Cell style={{ paddingLeft: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <Avatar
                                            name={parent.user?.name}
                                            size={42}
                                            style={{ borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '2px' }}>
                                                {parent.user?.name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Mail size={13} style={{ opacity: 0.6 }} /> {parent.user?.email}
                                            </div>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {parent.students?.length > 0 ? (
                                            parent.students.map((student, i) => (
                                                <Badge
                                                    key={i}
                                                    bg={student.status === 'active' ? "rgba(79, 70, 229, 0.08)" : "rgba(239, 68, 68, 0.08)"}
                                                    color={student.status === 'active' ? "var(--primary)" : "#DC2626"}
                                                    icon={Baby}
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        opacity: student.status === 'active' ? 1 : 0.6,
                                                        textDecoration: student.status === 'active' ? 'none' : 'line-through'
                                                    }}
                                                >
                                                    {student.user?.name} {student.status !== 'active' && `(${student.status})`}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontStyle: 'italic' }}>No linked students</span>
                                        )}
                                    </div>
                                </Table.Cell>
                                <Table.Cell align="right" style={{ paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                        <Button
                                            variant="outline"
                                            style={{
                                                padding: '8px',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                background: 'white',
                                                color: 'var(--text-main)'
                                            }}
                                            onClick={() => handleOpenEdit(parent)}
                                            title="Edit Profile"
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            style={{
                                                padding: '8px',
                                                border: '1px solid #FEE2E2',
                                                borderRadius: '8px',
                                                background: '#FFF5F5',
                                                color: '#DC2626'
                                            }}
                                            onClick={() => handleDelete(parent.id)}
                                            title="Delete Account"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Card>

            {filteredParents.length === 0 && (
                <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '20px', border: '2px dashed var(--border-color)' }}>
                    <Users size={48} style={{ color: 'var(--border-color)', marginBottom: '16px', opacity: 0.5 }} />
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>No guardians found</div>
                    <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>Try adjusting your search criteria or add a new parent account.</p>
                </div>
            )}

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
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: student.status === 'active' ? 'var(--text-main)' : 'var(--text-light)',
                                        opacity: student.status === 'active' ? 1 : 0.6,
                                        textDecoration: student.status === 'active' ? 'none' : 'line-through'
                                    }}>
                                        {student.user?.name}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        ({student.school_class?.name || 'No Class'}) • {student.status}
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
