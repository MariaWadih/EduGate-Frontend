import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Users, UserMinus, GraduationCap, Calendar,
    ChevronRight, ArrowUpRight, Search, FileText, Download,
    Filter, AlertCircle, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { analyticsService } from '../../services';
import { Button, Badge, Avatar, Card } from '../../components/atoms';
import { Table, SearchBar, Modal } from '../../components/molecules';

const HistoricalRecords = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await analyticsService.getHistoricalRecords();
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch historical records:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                    <History size={48} color="var(--primary)" />
                </motion.div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Retrieving Academic Archives...</div>
            </div>
        );
    }

    const students = data?.students || { active: [], unenrolled: [], alumni: [] };
    const teachers = data?.teachers || { active: [], inactive: [] };
    const promotions = data?.promotions || {};
    const years = data?.years || [];

    const stats = [
        { label: 'Total Alumni', value: data?.overview?.total_alumni || 0, icon: <GraduationCap size={20} />, color: '#3B82F6', bg: '#EFF6FF' },
        { label: 'Left Students', value: data?.overview?.total_left_students || 0, icon: <UserMinus size={20} />, color: '#EF4444', bg: '#FEF2F2' },
        { label: 'Left Teachers', value: data?.overview?.total_left_teachers || 0, icon: <Users size={20} />, color: '#F59E0B', bg: '#FFFBEB' },
        { label: 'Total Records', value: (students.active.length + students.unenrolled.length + students.alumni.length + teachers.active.length + teachers.inactive.length), icon: <FileText size={20} />, color: '#10B981', bg: '#ECFDF5' },
    ];

    const renderStudentsTab = () => {
        const allStudents = [
            ...students.active.map(s => ({ ...s, historical_status: 'Active' })),
            ...students.unenrolled.map(s => ({ ...s, historical_status: 'Left' })),
            ...students.alumni.map(s => ({ ...s, historical_status: 'Alumni' }))
        ];

        const filtered = allStudents.filter(s => {
            const matchesSearch = s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesYear = selectedYear === 'All' || s.current_academic_year === selectedYear;
            return matchesSearch && matchesYear;
        });

        return (
            <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                    <div style={{ flex: 1, maxWidth: '400px' }}>
                        <SearchBar value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search student name or email..." />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Filter size={18} color="var(--text-muted)" />
                        <select
                            style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontWeight: 600 }}
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                        >
                            <option value="All">All Academic Years</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <Card style={{ padding: '0', overflow: 'hidden' }}>
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Header>Student Profile</Table.Header>
                                <Table.Header>Parents</Table.Header>
                                <Table.Header>Final Class / Year</Table.Header>
                                <Table.Header>Historical Status</Table.Header>
                                <Table.Header align="right">Actions</Table.Header>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {filtered.map((student) => (
                                <Table.Row key={student.id}>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Avatar name={student.user?.name} size={40} />
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{student.user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.user?.email}</div>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {student.parents?.length > 0 ? student.parents.map(p => (
                                                <div key={p.id} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                    • {p.user?.name}
                                                </div>
                                            )) : (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No parents linked</span>
                                            )}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ fontWeight: 600 }}>{student.school_class?.name} / {student.school_class?.section}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class ID: #{student.class_id} • Year: {student.current_academic_year}</div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            bg={student.historical_status === 'Active' ? '#ECFDF5' : (student.historical_status === 'Alumni' ? '#EFF6FF' : '#FEF2F2')}
                                            color={student.historical_status === 'Active' ? '#059669' : (student.historical_status === 'Alumni' ? '#1D4ED8' : '#DC2626')}
                                        >
                                            {student.historical_status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <Button variant="outline" size="small" icon={<ArrowUpRight size={14} />}>View File</Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card>
            </div>
        );
    };

    const renderPromotionTab = () => {
        const logs = data?.promotion_logs || [];
        const filtered = logs.filter(log => {
            const matchesSearch = log.student?.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesYear = selectedYear === 'All' || log.from_academic_year === selectedYear || log.to_academic_year === selectedYear;
            return matchesSearch && matchesYear;
        });

        return (
            <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                    <div style={{ flex: 1, maxWidth: '400px' }}>
                        <SearchBar value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search student records..." />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar size={18} color="var(--text-muted)" />
                        <select
                            style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontWeight: 600 }}
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                        >
                            <option value="All">All Years</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <Card style={{ padding: '0', overflow: 'hidden' }}>
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Header>Student</Table.Header>
                                <Table.Header>Transition</Table.Header>
                                <Table.Header>Academic Path</Table.Header>
                                <Table.Header>Final Result</Table.Header>
                                <Table.Header>Recorded On</Table.Header>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {filtered.map((log) => (
                                <Table.Row key={log.id}>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Avatar name={log.student?.user?.name} size={36} />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{log.student?.user?.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: #{log.student_id}</div>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.from_class?.name}</span>
                                            <ArrowUpRight size={14} color="var(--text-muted)" />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{log.to_class?.name}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.from_academic_year}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to {log.to_academic_year}</div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            bg={log.status === 'promoted' ? '#ECFDF5' : '#FEF2F2'}
                                            color={log.status === 'promoted' ? '#059669' : '#DC2626'}
                                            size="sm"
                                        >
                                            {log.status.toUpperCase()}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(log.promotion_date).toLocaleDateString()}
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card>
            </div>
        );
    };

    const renderTeachersTab = () => {
        const allTeachers = [
            ...teachers.active.map(t => ({ ...t, historical_status: 'Active' })),
            ...teachers.inactive.map(t => ({ ...t, historical_status: 'Left' }))
        ];

        const filtered = allTeachers.filter(t => {
            const matchesSearch = t.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        return (
            <div style={{ marginTop: '24px' }}>
                <Card style={{ padding: '0', overflow: 'hidden' }}>
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <Table.Header>Teacher Profile</Table.Header>
                                <Table.Header>Joined At</Table.Header>
                                <Table.Header>Status</Table.Header>
                                <Table.Header align="right">Actions</Table.Header>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {filtered.map((teacher) => (
                                <Table.Row key={teacher.id}>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Avatar name={teacher.user?.name} size={40} />
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{teacher.user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{teacher.user?.email}</div>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                            {teacher.joined_at ? new Date(teacher.joined_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            bg={teacher.historical_status === 'Active' ? '#ECFDF5' : '#FEF2F2'}
                                            color={teacher.historical_status === 'Active' ? '#059669' : '#DC2626'}
                                        >
                                            {teacher.historical_status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <Button variant="outline" size="small">Details</Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card>
            </div>
        );
    };

    const renderOverviewTab = () => {
        return (
            <div style={{ marginTop: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                    {years.map(year => (
                        <Card key={year} style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                                    <Calendar size={24} />
                                </div>
                                <h3 style={{ margin: 0 }}>Academic Year {year}</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
                                        <span style={{ fontWeight: 600 }}>Promoted Students</span>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{(promotions[year] || []).find(p => p.status === 'promoted')?.count || 0}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
                                        <span style={{ fontWeight: 600 }}>Repeated / Failed</span>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{(promotions[year] || []).find(p => p.status === 'failed')?.count || 0}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
                                        <span style={{ fontWeight: 600 }}>Special Retentions</span>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{(promotions[year] || []).find(p => p.status === 'repeated')?.count || 0}</span>
                                </div>
                            </div>

                            <Button variant="outline" fullWidth style={{ marginTop: '24px' }} icon={<Download size={18} />}>
                                Export Yearly Report
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>History & Archives</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '1.1rem' }}>
                        Retrospective view of students, teachers, and academic performance across 2 years.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" icon={<RefreshCw size={18} className={loading ? 'spinning' : ''} />} onClick={fetchData}>Refresh Data</Button>
                    <Button variant="outline" icon={<Download size={18} />}>Full Archive Export</Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {stats.map(stat => (
                    <Card key={stat.label} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: stat.bg, color: stat.color, padding: '12px', borderRadius: '14px' }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px' }}>
                {[
                    { id: 'students', label: 'Student History', icon: <GraduationCap size={18} /> },
                    { id: 'promotions', label: 'Promotion Log', icon: <History size={18} /> },
                    { id: 'teachers', label: 'Teacher History', icon: <Users size={18} /> },
                    { id: 'overview', label: 'Academic Overview', icon: <Calendar size={18} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                        style={{
                            padding: '16px 8px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'students' && renderStudentsTab()}
                    {activeTab === 'promotions' && renderPromotionTab()}
                    {activeTab === 'teachers' && renderTeachersTab()}
                    {activeTab === 'overview' && renderOverviewTab()}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default HistoricalRecords;
