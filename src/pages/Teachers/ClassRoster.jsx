import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { Users, Mail, User } from 'lucide-react';
import { Avatar, Badge, Card } from '../../components/atoms';
import { Table } from '../../components/molecules';

const ClassRoster = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        client.get(`/classes/${id}`).then(res => setData(res.data));
    }, [id]);

    if (!data) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Users size={48} color="var(--primary)" />
            </motion.div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>CLASS MANAGEMENT</div>
                <h1 style={{ margin: 0 }}>{data.name} - Students Roster</h1>
            </div>

            <Card style={{ padding: '0' }}>
                <Table>
                    <Table.Head>
                        <Table.Row>
                            <Table.Header align="center" style={{ width: '60px' }}>#</Table.Header>
                            <Table.Header>Student</Table.Header>
                            <Table.Header>Email Address</Table.Header>
                            <Table.Header align="right">Status</Table.Header>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {data.students.map((s, i) => (
                            <Table.Row key={s.id}>
                                <Table.Cell align="center" style={{ color: 'var(--text-light)', fontWeight: 700 }}>{i + 1}</Table.Cell>
                                <Table.Cell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Avatar name={s.user.name} size={32} />
                                        <div style={{ fontWeight: 600 }}>{s.user.name}</div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell style={{ color: 'var(--text-muted)' }}>{s.user.email}</Table.Cell>
                                <Table.Cell align="right">
                                    <Badge bg="var(--success-light)" color="var(--success)" style={{ fontWeight: 700 }}>
                                        Active
                                    </Badge>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
                {data.students.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No students enrolled in this class.
                    </div>
                )}
            </Card>
        </motion.div>
    );
};

export default ClassRoster;
