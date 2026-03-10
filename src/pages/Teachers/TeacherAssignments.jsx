import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button, Card, Badge } from '../../components/atoms';
import client from '../../api/client';

const TeacherAssignments = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get('/teacher/classes')
            .then(res => setClasses(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    const classCards = [];
    if (classes && Array.isArray(classes)) {
        classes.forEach(cls => {
            if (cls.subjects) {
                cls.subjects.forEach(subject => {
                    classCards.push({
                        id: cls.id, // Class ID
                        subjectId: subject.id,
                        name: cls.name,
                        section: cls.section,
                        subjectName: subject.name,
                        studentCount: cls.students_count
                    });
                });
            }
        });
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0 0 40px 0' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ marginBottom: '8px' }}>Assignments</h1>
                <p style={{ color: 'var(--text-muted)' }}>Select a class to manage assignments and grades.</p>
            </div>

            {classCards.length === 0 ? (
                <Card style={{ padding: '40px', textAlign: 'center' }}>
                    <p>No classes assigned yet.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {classCards.map((card, idx) => (
                        <Card key={`${card.id}-${card.subjectId}-${idx}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Badge bg="var(--primary-light)" color="var(--primary)">{card.subjectName}</Badge>
                                <Badge bg="#F3F4F6" color="var(--text-muted)">Section {card.section}</Badge>
                            </div>

                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{card.name}</h3>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {card.studentCount} Students
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                                <Link to={`/classes/${card.id}/assignments?subject_id=${card.subjectId}`} style={{ textDecoration: 'none' }}>
                                    <Button style={{ width: '100%', justifyContent: 'center' }}>
                                        Manage Assignments
                                        <ChevronRight size={16} style={{ marginLeft: '8px' }} />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default TeacherAssignments;
