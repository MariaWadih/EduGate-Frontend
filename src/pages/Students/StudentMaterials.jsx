import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Download, Clock, Info, Search, Filter, ChevronDown, ChevronRight, Folder, Layers, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import { Card, Badge, Button, Avatar, Input } from '../../components/atoms';

const StudentMaterials = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const classId = user?.student?.class_id;
                if (classId) {
                    const subjectId = searchParams.get('subject_id');
                    const res = await studentService.getMaterials(classId, subjectId);
                    setMaterials(res.data);

                    const initialExpanded = {};
                    res.data.forEach(m => {
                        const sec = m.section || 'General Resources';
                        initialExpanded[sec] = true;
                        if (m.sub_section) initialExpanded[`${sec}-${m.sub_section}`] = true;
                    });
                    setExpandedSections(initialExpanded);
                }
            } catch (error) {
                console.error("Error loading materials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, [user, searchParams]);

    const handleDownload = (path, filename) => {
        teacherService.downloadMaterial(path).then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
        }).catch(e => console.error(e));
    };

    const toggleExpand = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const subjects = ['All', ...new Set(materials.map(m => m.subject?.name).filter(Boolean))];

    const filteredMaterials = materials.filter(m => {
        const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSubject = selectedSubject === 'All' || m.subject?.name === selectedSubject;
        return matchSearch && matchSubject;
    });

    const groupedMaterials = React.useMemo(() => {
        const groups = {};
        filteredMaterials.forEach(m => {
            const sec = m.section || 'General Resources';
            const sub = m.sub_section || 'Default';
            if (!groups[sec]) groups[sec] = {};
            if (!groups[sec][sub]) groups[sec][sub] = [];
            groups[sec][sub].push(m);
        });
        return groups;
    }, [filteredMaterials]);

    if (loading) return (
        <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <BookOpen size={48} color="var(--primary)" />
            </motion.div>
            <div style={{ marginTop: '20px', fontWeight: 600, color: 'var(--text-muted)' }}>Loading curriculum...</div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '60px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/student/courses')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 600 }}
                >
                    <ArrowLeft size={20} />
                    Back to Classes
                </Button>
            </div>

            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px 0' }}>Course <span style={{ color: 'var(--primary)' }}>Curriculum</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Navigate through structured modules, chapters, and study materials.</p>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <Input placeholder="Search materials..." style={{ paddingLeft: '44px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <select style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontWeight: 600 }} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {Object.keys(groupedMaterials).length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--bg-main)', border: '2px dashed var(--border-color)' }}>
                    <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-sm)' }}>
                        <Info size={36} color="#CBD5E1" />
                    </div>
                    <h3 style={{ fontWeight: 800 }}>No materials found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters.</p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {Object.entries(groupedMaterials).map(([sectionName, subGroups]) => (
                        <div key={sectionName} style={{ borderLeft: '3px solid var(--primary-light)', paddingLeft: '20px' }}>
                            <div onClick={() => toggleExpand(sectionName)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'var(--bg-main)', padding: '10px 16px', borderRadius: '14px', width: 'fit-content', marginBottom: '20px' }}>
                                {expandedSections[sectionName] ? <ChevronDown size={22} color="var(--primary)" /> : <ChevronRight size={22} color="var(--primary)" />}
                                <Folder size={22} color="var(--primary)" fill="var(--primary-light)" />
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{sectionName}</h2>
                            </div>

                            <AnimatePresence>
                                {expandedSections[sectionName] && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                        {Object.entries(subGroups).map(([subSecName, items]) => (
                                            <div key={subSecName} style={{ marginBottom: '24px', marginLeft: '24px' }}>
                                                {subSecName !== 'Default' ? (
                                                    <div onClick={() => toggleExpand(`${sectionName}-${subSecName}`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '16px', padding: '6px 12px', background: '#F8FAFC', borderRadius: '10px', width: 'fit-content' }}>
                                                        {expandedSections[`${sectionName}-${subSecName}`] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{subSecName}</span>
                                                        <Badge bg="white" color="var(--text-muted)" size="sm">{items.length}</Badge>
                                                    </div>
                                                ) : null}

                                                <AnimatePresence>
                                                    {(subSecName === 'Default' || expandedSections[`${sectionName}-${subSecName}`]) && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                                            {items.map(mat => (
                                                                <Card key={mat.id} style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}><FileText size={20} /></div>
                                                                        <Badge bg="var(--bg-main)" color="var(--text-muted)" size="sm">{mat.file_type?.toUpperCase()}</Badge>
                                                                    </div>
                                                                    <h4 style={{ margin: 0, fontWeight: 800 }}>{mat.title}</h4>
                                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>{mat.description}</p>
                                                                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #EEF2F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Avatar name={mat.teacher?.user?.name} size={24} /><span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{mat.teacher?.user?.name}</span></div>
                                                                        <Button size="sm" variant="primary" onClick={() => handleDownload(mat.file_path, mat.file_name)} style={{ borderRadius: '8px' }}>Download</Button>
                                                                    </div>
                                                                </Card>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default StudentMaterials;
