import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, FileText, Clock, ArrowLeft, Download, Upload, Trash2, File, ChevronDown, ChevronRight, Folder, FolderPlus, Layers, CheckCircle } from 'lucide-react';
import { Button, Card, Badge, Input, Label, Avatar } from '../../components/atoms';
import { Modal } from '../../components/molecules';
import { useAuth } from '../../hooks';
import { teacherService } from '../../services/teacherService';

const ClassMaterials = () => {
    const { user } = useAuth();
    const { id: classId } = useParams();
    const [searchParams] = useSearchParams();
    const filterSubjectId = searchParams.get('subject_id');
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newMaterial, setNewMaterial] = useState({ title: '', description: '', subject_id: '', section: '', sub_section: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [classData, setClassData] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Filter subjects to only those taught by the current teacher
    const teacherSubjects = React.useMemo(() => {
        try {
            if (!classData?.subjects) return [];
            return classData.subjects.filter(s => {
                const isAdmin = user?.role === 'admin';
                const teachesThis = user?.teacher?.id && s.pivot?.teacher_id === user?.teacher?.id;
                return isAdmin || teachesThis;
            });
        } catch (e) {
            console.error("Error filtering teacher subjects:", e);
            return [];
        }
    }, [classData, user]);

    const fetchMaterials = async () => {
        try {
            const res = await teacherService.getMaterials(classId, filterSubjectId);
            setMaterials(res.data);

            // Expand all by default
            const initialExpanded = {};
            res.data.forEach(m => {
                const sec = m.section || 'General';
                const sub = m.sub_section;
                initialExpanded[sec] = true;
                if (sub) initialExpanded[`${sec}-${sub}`] = true;
            });
            setExpandedSections(initialExpanded);
        } catch (error) {
            console.error("Error loading materials:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classRes = await client.get(`/classes/${classId}`);
                setClassData(classRes.data);
                await fetchMaterials();
            } catch (error) {
                console.error("Error loading classroom data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (classId) fetchData();
    }, [classId]);

    useEffect(() => {
        if (showCreateModal && teacherSubjects.length > 0 && !newMaterial.subject_id) {
            const defaultSubjectId = filterSubjectId || teacherSubjects[0].id;
            setNewMaterial(prev => ({ ...prev, subject_id: defaultSubjectId }));
        }
    }, [showCreateModal, teacherSubjects, newMaterial.subject_id, filterSubjectId]);

    const handleCreate = async (e) => {
        if (e) e.preventDefault();
        if (!selectedFile) { alert('Please select a file.'); return; }

        try {
            const subjectId = newMaterial.subject_id || (teacherSubjects[0]?.id);
            const formData = new FormData();
            formData.append('class_id', classId);
            formData.append('subject_id', subjectId);
            formData.append('section', newMaterial.section || '');
            formData.append('sub_section', newMaterial.sub_section || '');
            formData.append('title', newMaterial.title);
            formData.append('description', newMaterial.description || '');
            formData.append('file', selectedFile);

            await teacherService.uploadMaterial(formData);

            setShowCreateModal(false);
            setNewMaterial({ title: '', description: '', subject_id: '', section: '', sub_section: '' });
            setSelectedFile(null);
            await fetchMaterials();
        } catch (error) {
            console.error("Upload error:", error);
            alert('Failed to upload material.');
        }
    };

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

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this material?')) return;
        try {
            await teacherService.deleteMaterial(id);
            await fetchMaterials();
        } catch (error) { console.error(error); }
    };

    const toggleExpand = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Group materials: { [section]: { [subSection]: [items] } }
    const groupedMaterials = React.useMemo(() => {
        const groups = {};
        materials.forEach(m => {
            const sec = m.section || 'General Resources';
            const sub = m.sub_section || 'Default';
            if (!groups[sec]) groups[sec] = {};
            if (!groups[sec][sub]) groups[sec][sub] = [];
            groups[sec][sub].push(m);
        });
        return groups;
    }, [materials]);

    if (loading) return (
        <div style={{ padding: '120px 40px', textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Clock size={40} color="var(--primary)" />
            </motion.div>
            <h3 style={{ color: 'var(--text-main)', marginTop: '16px' }}>Loading Curriculum...</h3>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: '60px' }}>
            <div style={{ marginBottom: '40px' }}>
                <Link to="/classes" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
                    <Button variant="ghost" style={{ paddingLeft: 0 }}>
                        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                        Back to Classes
                    </Button>
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BookOpen size={24} />
                            </div>
                            <h1 style={{ margin: 0, fontSize: '2rem' }}>
                                {filterSubjectId && teacherSubjects.find(s => s.id == filterSubjectId)
                                    ? `${teacherSubjects.find(s => s.id == filterSubjectId).name} Curriculum`
                                    : "Curriculum Hub"}
                                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '12px' }}>
                                    — {classData?.name || 'Classroom'}
                                </span>
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, paddingLeft: '60px' }}>
                            Advanced curriculum management with nested modules and sections.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setNewMaterial({ title: '', description: '', subject_id: filterSubjectId || teacherSubjects[0]?.id || '', section: '', sub_section: '' });
                            setShowCreateModal(true);
                        }}
                        style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '1rem' }}
                    >
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        Create New Entry
                    </Button>
                </div>
            </div>

            {Object.keys(groupedMaterials).length === 0 ? (
                <Card style={{ padding: '80px 40px', textAlign: 'center', border: '2px dashed var(--border-color)', background: 'transparent' }}>
                    <div style={{ background: 'var(--bg-main)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <Layers size={32} color="var(--text-muted)" />
                    </div>
                    <h2 style={{ marginBottom: '8px', color: 'var(--text-main)', fontWeight: 800 }}>Start Building Your Curriculum</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500 }}>
                        Organize your course into Modules and Chapters to help students navigate easily.
                    </p>
                    <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                        Create First Module
                    </Button>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {Object.entries(groupedMaterials).map(([sectionName, subGroups]) => (
                        <div key={sectionName} style={{ borderLeft: '3px solid var(--primary-light)', paddingLeft: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div onClick={() => toggleExpand(sectionName)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'var(--bg-main)', padding: '10px 16px', borderRadius: '14px' }}>
                                    {expandedSections[sectionName] ? <ChevronDown size={22} color="var(--primary)" /> : <ChevronRight size={22} color="var(--primary)" />}
                                    <Folder size={22} color="var(--primary)" fill="var(--primary-light)" />
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{sectionName}</h2>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { setNewMaterial(p => ({ ...p, section: sectionName === 'General Resources' ? '' : sectionName, sub_section: '' })); setShowCreateModal(true); }} style={{ gap: '8px', color: 'var(--primary)', fontWeight: 700 }}>
                                    <FolderPlus size={18} /> Add Module Item
                                </Button>
                            </div>

                            <AnimatePresence>
                                {expandedSections[sectionName] && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                        {Object.entries(subGroups).map(([subSecName, items]) => (
                                            <div key={subSecName} style={{ marginBottom: '24px', marginLeft: '24px' }}>
                                                {subSecName !== 'Default' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '6px 12px', background: '#F8FAFC', borderRadius: '10px', width: 'fit-content', minWidth: '300px' }}>
                                                        <div onClick={() => toggleExpand(`${sectionName}-${subSecName}`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                            {expandedSections[`${sectionName}-${subSecName}`] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{subSecName}</span>
                                                            <Badge bg="white" color="var(--text-muted)" size="sm">{items.length}</Badge>
                                                        </div>
                                                        <Button variant="ghost" size="sm" onClick={() => { setNewMaterial(p => ({ ...p, section: sectionName === 'General Resources' ? '' : sectionName, sub_section: subSecName })); setShowCreateModal(true); }} style={{ padding: '4px' }}><Plus size={14} /></Button>
                                                    </div>
                                                ) : null}

                                                <AnimatePresence>
                                                    {(subSecName === 'Default' || expandedSections[`${sectionName}-${subSecName}`]) && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                                            {items.map(mat => (
                                                                <Card key={mat.id} style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}><File size={20} /></div>
                                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(mat.id)} style={{ color: 'var(--danger)', padding: '4px' }}><Trash2 size={14} /></Button>
                                                                            <Badge bg="var(--bg-main)" color="var(--text-muted)" size="sm">{mat.file_type?.toUpperCase()}</Badge>
                                                                        </div>
                                                                    </div>
                                                                    <h4 style={{ margin: 0, fontWeight: 800 }}>{mat.title}</h4>
                                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>{mat.description || 'No description.'}</p>
                                                                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #EEF2F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Avatar name={mat.teacher?.user?.name} size={24} /><span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{mat.teacher?.user?.name}</span></div>
                                                                        <Button size="sm" variant="outline" onClick={() => handleDownload(mat.file_path, mat.file_name)} style={{ borderRadius: '8px', height: '32px', fontSize: '0.8rem' }}><Download size={12} /> Get</Button>
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

            {showCreateModal && (
                <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Advanced Upload" width="550px">
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><Label>Main Module</Label><Input placeholder="e.g. Module 1" value={newMaterial.section} onChange={e => setNewMaterial({ ...newMaterial, section: e.target.value })} /></div>
                            <div><Label>Sub-section / Chapter</Label><Input placeholder="e.g. Chapter 1" value={newMaterial.sub_section} onChange={e => setNewMaterial({ ...newMaterial, sub_section: e.target.value })} /></div>
                        </div>
                        <div><Label>Resource Title (Optional)</Label><Input placeholder="e.g. Part 1: Fundamentals (Defaults to filename)" value={newMaterial.title} onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })} /></div>
                        <div><Label>Notes</Label><textarea placeholder="Add context..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', minHeight: '80px', outline: 'none' }} value={newMaterial.description} onChange={e => setNewMaterial({ ...newMaterial, description: e.target.value })} /></div>
                        <div>
                            <Label>File Selection</Label>
                            <div
                                style={{
                                    border: selectedFile ? '2px solid #10B981' : '2px dashed var(--border-color)',
                                    borderRadius: '16px',
                                    padding: '32px 24px',
                                    textAlign: 'center',
                                    background: selectedFile ? '#ECFDF5' : '#F8FAFC',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                                onClick={() => document.getElementById('mt-f').click()}
                            >
                                <input type="file" id="mt-f" style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0])} />

                                {selectedFile ? (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ background: '#10B981', color: 'white', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                                            <CheckCircle size={28} />
                                        </div>
                                        <div style={{ fontWeight: 800, color: '#065F46', fontSize: '1rem' }}>{selectedFile.name}</div>
                                        <div style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>File ready for upload</div>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--primary)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Upload size={24} />
                                        </div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Click or Drag to Upload</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF, Word, or Image (Max 20MB)</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}><Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button><Button type="submit">Publish Resource</Button></div>
                    </form>
                </Modal>
            )}
        </motion.div>
    );
};

export default ClassMaterials;
