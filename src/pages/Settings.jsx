import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks';
import { useAcademicYear } from '../context/AcademicYearContext';
import client from '../api/client';
import {
    User, Mail, Lock, Shield, Phone, Save,
    CheckCircle2, Bell, Sun, Fingerprint, Activity,
    ChevronRight, Settings as SettingsIcon, LogOut, Calendar, Plus, Zap
} from 'lucide-react';
import { Button, Card, Avatar, Input, Toggle, Badge } from '../components/atoms';

const Settings = () => {
    const { user, login } = useAuth();
    const { activeYear, academicYears, activateYear, createYear, refreshYears } = useAcademicYear();
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: ''
    });
    const [prefs, setPrefs] = useState({
        notifications: user?.settings?.notifications ?? true,
        darkMode: user?.settings?.darkMode ?? false,
        biometric: user?.settings?.biometric ?? true,
        analytics: user?.settings?.analytics ?? true
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Academic year management state
    const [yearLoading, setYearLoading] = useState(false);
    const [showNewYearForm, setShowNewYearForm] = useState(false);
    const [newYear, setNewYear] = useState({ name: '', start_date: '', end_date: '' });

    useEffect(() => {
        if (user?.settings) {
            setPrefs({
                notifications: user.settings.notifications ?? true,
                darkMode: user.settings.darkMode ?? false,
                biometric: user.settings.biometric ?? true,
                analytics: user.settings.analytics ?? true
            });
        }
    }, [user]);

    // Automatically synchronize academic cycles when the tab is accessed
    useEffect(() => {
        if (activeTab === 'academic') {
            refreshYears();
        }
    }, [activeTab, refreshYears]);

    const togglePreference = (key) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);

        client.put('/profile', { settings: newPrefs })
            .then(res => {
                login({ ...user, settings: res.data.user.settings });
            })
            .catch(err => {
                console.error('Failed to sync settings:', err);
                setPrefs(prefs);
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(false);

        try {
            let dataToSend = {};
            if (activeTab === 'personal') {
                dataToSend = { name: formData.name, email: formData.email };
            } else if (activeTab === 'security') {
                dataToSend = {
                    password: formData.password,
                    password_confirmation: formData.password_confirmation
                };
            }

            const res = await client.put('/profile', dataToSend);
            setSuccess(true);
            login({ ...user, ...res.data.user });
            setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const sidebarItems = [
        { id: 'personal', icon: <User size={18} />, label: 'Personal Information' },
        { id: 'security', icon: <Shield size={18} />, label: 'Security & Access' },
        { id: 'preferences', icon: <SettingsIcon size={18} />, label: 'System Preferences' },
        ...(user?.role === 'admin' ? [{ id: 'academic', icon: <Calendar size={18} />, label: 'Academic Years' }] : [])
    ];

    const preferenceItems = [
        { id: 'notifications', title: 'Email Notifications', desc: 'Receive immediate alerts for homework and exams.', icon: <Bell size={20} /> },
        { id: 'darkMode', title: 'System Dark Mode', desc: 'Optimize the interface for low-light environments.', icon: <Sun size={20} /> },
        { id: 'biometric', title: 'Biometric Access', desc: 'Use platform-standard biometric authentication.', icon: <Fingerprint size={20} /> },
        { id: 'analytics', title: 'Performance Analytics', desc: 'Enable detailed tracking of academic progress.', icon: <Activity size={20} /> }
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ maxWidth: '1100px', margin: '0 auto' }}
        >
            <header style={{ marginBottom: '40px' }}>
                <Badge bg="var(--primary-light)" color="var(--primary)" style={{ marginBottom: '12px', fontWeight: 800 }}>ACCOUNT CONFIGURATION</Badge>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Settings Hub</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Manage your digital identity and customize your EduGate experience.</p>
            </header>

            <div className="grid-2-1" style={{ gridTemplateColumns: '300px 1fr', gap: '40px', alignItems: 'start' }}>
                <motion.aside variants={itemVariants}>
                    <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ padding: '40px 32px', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)', color: 'white' }}>
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                                <Avatar
                                    name={user?.name}
                                    size={96}
                                    style={{
                                        border: '4px solid rgba(255,255,255,0.3)',
                                        background: 'white',
                                        color: 'var(--primary)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute', bottom: '4px', right: '4px',
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    background: 'var(--success)', border: '3px solid white'
                                }} />
                            </div>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 800 }}>{user?.name}</h3>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 800, marginTop: '6px', letterSpacing: '0.1em' }}>{user?.role} ACCOUNT</div>
                        </div>
                        <nav style={{ padding: '16px' }}>
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        marginBottom: '6px',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    {activeTab === item.id && <ChevronRight size={16} />}
                                </button>
                            ))}
                        </nav>
                    </Card>
                </motion.aside>

                <motion.main variants={itemVariants}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'personal' && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card style={{ padding: '40px', borderRadius: '24px' }}>
                                    <div style={{ marginBottom: '40px' }}>
                                        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Personal Information</h2>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500 }}>Configure the identity details used across the platform.</p>
                                    </div>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>FULL LEGAL NAME</label>
                                                <div style={{ position: 'relative' }}>
                                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                                    <Input
                                                        fullWidth
                                                        style={{ paddingLeft: '48px', height: '52px', borderRadius: '12px' }}
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SYSTEM EMAIL</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                                    <Input
                                                        type="email"
                                                        fullWidth
                                                        style={{ paddingLeft: '48px', height: '52px', borderRadius: '12px' }}
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                            {success && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}
                                                >
                                                    <CheckCircle2 size={20} /> Profile Synchronized
                                                </motion.div>
                                            )}
                                            <Button type="submit" disabled={submitting} style={{ padding: '12px 32px', borderRadius: '12px' }}>
                                                <Save size={18} style={{ marginRight: '8px' }} />
                                                {submitting ? 'Applying Changes...' : 'Update Explorer Profile'}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card style={{ padding: '40px', borderRadius: '24px' }}>
                                    <div style={{ marginBottom: '40px' }}>
                                        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Security & Access</h2>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500 }}>Update your credentials to maintain account integrity.</p>
                                    </div>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>NEW PASSWORD</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                                    <Input
                                                        type="password"
                                                        fullWidth
                                                        style={{ paddingLeft: '48px', height: '52px', borderRadius: '12px' }}
                                                        value={formData.password}
                                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                        placeholder="Create secure password"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PASSWORD CONFIRMATION</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                                    <Input
                                                        type="password"
                                                        fullWidth
                                                        style={{ paddingLeft: '48px', height: '52px', borderRadius: '12px' }}
                                                        value={formData.password_confirmation}
                                                        onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                                                        placeholder="Confirm secure password"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                            {success && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}
                                                >
                                                    <CheckCircle2 size={20} /> Credentials Restructured
                                                </motion.div>
                                            )}
                                            <Button type="submit" disabled={submitting} style={{ padding: '12px 32px', borderRadius: '12px' }}>
                                                <Shield size={18} style={{ marginRight: '8px' }} />
                                                {submitting ? 'Authenticating...' : 'Secure Account'}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'preferences' && (
                            <motion.div
                                key="preferences"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card style={{ padding: '40px', borderRadius: '24px' }}>
                                    <div style={{ marginBottom: '40px' }}>
                                        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Platform Preferences</h2>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500 }}>Tailor the EduGate interface to your workflow.</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {preferenceItems.map((pref) => (
                                            <motion.div
                                                key={pref.id}
                                                whileHover={{ scale: 1.01, borderColor: 'var(--primary)' }}
                                                onClick={() => togglePreference(pref.id)}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '24px',
                                                    background: 'var(--bg-main)',
                                                    borderRadius: '20px',
                                                    border: `2px solid ${prefs[pref.id] ? 'var(--primary-light)' : 'var(--border-color)'}`,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                    <div style={{
                                                        padding: '14px',
                                                        background: prefs[pref.id] ? 'var(--primary)' : 'white',
                                                        color: prefs[pref.id] ? 'white' : 'var(--text-muted)',
                                                        borderRadius: '16px',
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}>
                                                        {pref.icon}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{pref.title}</div>
                                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{pref.desc}</div>
                                                    </div>
                                                </div>
                                                <Toggle checked={prefs[pref.id]} onChange={() => togglePreference(pref.id)} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'academic' && user?.role === 'admin' && (
                            <motion.div
                                key="academic"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card style={{ padding: '40px', borderRadius: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Academic Year Management</h2>
                                            <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500 }}>Manage school cycles. Only one year can be active at a time.</p>
                                        </div>
                                        <Button icon={<Plus size={16} />} onClick={() => setShowNewYearForm(v => !v)}>
                                            New Year
                                        </Button>
                                    </div>

                                    {/* Create new year form */}
                                    <AnimatePresence>
                                        {showNewYearForm && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                style={{ overflow: 'hidden', marginBottom: '32px' }}
                                            >
                                                <div style={{ padding: '28px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                                    <h4 style={{ margin: '0 0 20px 0', fontWeight: 700 }}>Create New Academic Year</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                                        <div>
                                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>YEAR NAME</label>
                                                            <Input
                                                                fullWidth
                                                                placeholder="e.g. 2025-2026"
                                                                value={newYear.name}
                                                                onChange={e => setNewYear(p => ({ ...p, name: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>START DATE</label>
                                                            <Input
                                                                type="date"
                                                                fullWidth
                                                                value={newYear.start_date}
                                                                onChange={e => setNewYear(p => ({ ...p, start_date: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>END DATE</label>
                                                            <Input
                                                                type="date"
                                                                fullWidth
                                                                value={newYear.end_date}
                                                                onChange={e => setNewYear(p => ({ ...p, end_date: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                        <Button variant="outline" onClick={() => setShowNewYearForm(false)}>Cancel</Button>
                                                        <Button
                                                            disabled={yearLoading || !newYear.name || !newYear.start_date || !newYear.end_date}
                                                            onClick={async () => {
                                                                setYearLoading(true);
                                                                try {
                                                                    await createYear(newYear);
                                                                    setNewYear({ name: '', start_date: '', end_date: '' });
                                                                    setShowNewYearForm(false);
                                                                } catch (err) {
                                                                    alert(err.response?.data?.message || 'Failed to create year');
                                                                } finally {
                                                                    setYearLoading(false);
                                                                }
                                                            }}
                                                        >
                                                            {yearLoading ? 'Creating...' : 'Create Year'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Year list */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {(academicYears || []).sort((a, b) => b.name.localeCompare(a.name)).map(year => (
                                            <motion.div
                                                key={year.id}
                                                whileHover={{ scale: 1.005 }}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '24px 28px',
                                                    borderRadius: '16px',
                                                    border: `2px solid ${year.is_active ? 'var(--primary)' : 'var(--border-color)'}`,
                                                    background: year.is_active ? 'var(--primary-light)' : 'var(--bg-main)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{
                                                        padding: '12px',
                                                        background: year.is_active ? 'var(--primary)' : 'white',
                                                        color: year.is_active ? 'white' : 'var(--text-muted)',
                                                        borderRadius: '12px',
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}>
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                                            {year.name}
                                                            {year.is_active && (
                                                                <Badge bg="var(--primary)" color="white" style={{ marginLeft: '12px', fontSize: '0.65rem', fontWeight: 800 }}>ACTIVE</Badge>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                                                            {year.start_date ? new Date(year.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                            {' → '}
                                                            {year.end_date ? new Date(year.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                        </div>
                                                        <div style={{ marginTop: '4px' }}>
                                                            <span style={{
                                                                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                                                                color: year.status === 'active' ? '#059669' : year.status === 'upcoming' ? '#6366F1' : '#9CA3AF'
                                                            }}>
                                                                {year.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!year.is_active && (
                                                    <Button
                                                        variant="outline"
                                                        size="small"
                                                        icon={<Zap size={14} />}
                                                        disabled={yearLoading}
                                                        onClick={async () => {
                                                            if (!window.confirm(`Switch to academic year "${year.name}"? This will deactivate the current year.`)) return;
                                                            setYearLoading(true);
                                                            try {
                                                                await activateYear(year.id);
                                                            } catch (err) {
                                                                alert('Failed to switch year');
                                                            } finally {
                                                                setYearLoading(false);
                                                            }
                                                        }}
                                                        style={{ borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 700 }}
                                                    >
                                                        Set Active
                                                    </Button>
                                                )}
                                                {year.is_active && (
                                                    <Badge bg="rgba(16,185,129,0.1)" color="#059669" style={{ fontWeight: 700, padding: '8px 16px' }}>
                                                        Current Year
                                                    </Badge>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.main>
            </div>
        </motion.div>
    );
};

export default Settings;

