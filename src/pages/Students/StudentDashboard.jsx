import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Clock, Book, Calendar, CheckSquare,
    Search, Filter, ChevronRight, BarChart2
} from 'lucide-react';
import { useAuth, useStudentDashboard } from '../../hooks';
import { Button, Badge, Card, Input } from '../../components/atoms';
import { SearchBar } from '../../components/molecules';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { data, loading, error } = useStudentDashboard();
    const [searchTerm, setSearchTerm] = useState('');

    if (loading || !data) return <div style={{ padding: '40px' }}>Loading Your Progress...</div>;
    if (error) return <div style={{ padding: '40px', color: 'var(--danger)' }}>{error}</div>;


    const { metrics, grades, exams, assignments, insights } = data;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ margin: 0 }}>Student Dashboard</h1>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <SearchBar
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search courses or exams..."
                        style={{ width: '350px' }}
                    />
                </div>
            </div>

            <section style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0 }}>Grades Summary</h3>
                    <div style={{ color: 'var(--primary)', fontWeight: 600 }}>GPA: <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem' }}>{Math.round(metrics.gpa * 10) / 10}</span></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                    {grades.map((g, i) => (
                        <Card key={i} style={{ textAlign: 'center', padding: '24px' }}>
                            <div className="text-muted text-small" style={{ marginBottom: '12px', fontWeight: 600 }}>{g.subject.name}</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{g.score}</div>
                            <div className="text-muted text-small" style={{ marginBottom: '16px', fontWeight: 600 }}>/{g.max_score}</div>
                            <Button
                                variant="outline"
                                style={{ border: 'none', color: 'var(--primary)', padding: '0', height: 'auto' }}
                                onClick={() => { }}
                            >
                                View Report <ChevronRight size={14} />
                            </Button>
                        </Card>
                    ))}
                    {grades.length === 0 && <div className="text-muted">No grades recorded yet.</div>}
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
                <section>
                    <h3 style={{ marginBottom: '24px' }}>Assignments</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {assignments.map((hw, i) => {
                            const submission = hw.submissions[0];
                            const isSubmitted = submission?.status === 'submitted';
                            return (
                                <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                                        <Book size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{hw.title}</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                            <Badge bg="#F3F4F6" color="var(--text-muted)" style={{ fontSize: '0.7rem' }}>{hw.subject.name}</Badge>
                                            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {isSubmitted ? (
                                            <Badge bg="#dcfce7" color="var(--success)" style={{ fontWeight: 700 }}>Submitted</Badge>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Badge bg="#fee2e2" color="var(--danger)" style={{ fontWeight: 700 }}>Pending</Badge>
                                                <Button size="small" variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Submit</Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                        {assignments.length === 0 && <div className="text-muted">No assignments found.</div>}
                    </div>
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <Card style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Upcoming Exams</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {exams.map((ex, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: i < exams.length - 1 ? '16px' : 0, borderBottom: i < exams.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                    <div style={{ background: '#F1F5F9', padding: '10px', borderRadius: '10px', height: 'fit-content' }}>
                                        <Calendar size={20} className="text-muted" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ex.title}</div>
                                            <Badge bg="var(--primary-light)" color="var(--primary)" style={{ fontSize: '0.65rem' }}>Scheduled</Badge>
                                        </div>
                                        <div className="text-muted text-small" style={{ fontWeight: 500 }}>{new Date(ex.date).toLocaleDateString()} • {ex.subject.name}</div>
                                    </div>
                                </div>
                            ))}
                            {exams.length === 0 && <div className="text-muted text-small">No upcoming exams.</div>}
                        </div>
                    </Card>

                    <Card style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Insights & Alerts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {insights.map((insight, i) => (
                                <div key={i} style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: insight.severity === 'high' ? '#fee2e2' : '#fffbeb',
                                    borderLeft: `4px solid ${insight.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}`,
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: insight.severity === 'high' ? '#991b1b' : '#92400e'
                                }}>
                                    {insight.message}
                                </div>
                            ))}
                            {insights.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--success)', fontWeight: 600 }}>
                                    Excellent! No alerts found.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
