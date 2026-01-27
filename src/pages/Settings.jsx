import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { User, Mail, Lock, Shield, Phone, Save, CheckCircle2 } from 'lucide-react';
import { Button, Card, Avatar, Input, Toggle } from '../components/atoms';
import { FormField } from '../components/molecules';

const Settings = () => {
    const { user, login } = useAuth();
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

    const sidebarItems = [
        { id: 'personal', icon: <User size={18} />, label: 'Personal Info' },
        { id: 'security', icon: <Shield size={18} />, label: 'Security' },
        { id: 'preferences', icon: <Phone size={18} />, label: 'Preferences' }
    ];

    const preferenceItems = [
        { id: 'notifications', title: 'Email Notifications', desc: 'Receive immediate alerts for high-severity insights.' },
        { id: 'darkMode', title: 'System Dark Mode', desc: 'Optimize the interface for low-light environments.' },
        { id: 'biometric', title: 'Biometric Access', desc: 'Use platform-standard biometric authentication.' },
        { id: 'analytics', title: 'Detailed Analytics', desc: 'Display expanded standard deviation in performance reports.' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Global Settings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Configure your personal profile and system preferences</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px', alignItems: 'start' }}>
                <aside>
                    <Card style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '32px', textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <Avatar
                                    name={user?.name}
                                    size={80}
                                    style={{
                                        marginBottom: '16px',
                                        border: '3px solid rgba(255,255,255,0.2)',
                                        background: 'white',
                                        color: 'var(--primary)'
                                    }}
                                />
                            </div>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.125rem' }}>{user?.name}</h3>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 800, marginTop: '4px', letterSpacing: '0.1em' }}>{user?.role}</div>
                        </div>
                        <nav style={{ padding: '12px' }}>
                            {sidebarItems.map((item) => (
                                <Button
                                    key={item.id}
                                    variant={activeTab === item.id ? 'primary' : 'outline'}
                                    onClick={() => setActiveTab(item.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                                        color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: 700,
                                        textAlign: 'left',
                                        marginBottom: '4px',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </Button>
                            ))}
                        </nav>
                    </Card>
                </aside>

                <main>
                    <AnimatePresence mode="wait">
                        {activeTab === 'personal' && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card style={{ padding: '32px' }}>
                                    <div style={{ marginBottom: '32px' }}>
                                        <h3 style={{ margin: '0 0 8px 0' }}>Profile Information</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Update your primary identification and contact details.</p>
                                    </div>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>FULL LEGAL NAME</label>
                                            <div style={{ position: 'relative' }}>
                                                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <Input
                                                    fullWidth
                                                    style={{ paddingLeft: '48px' }}
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SYSTEM EMAIL</label>
                                            <div style={{ position: 'relative' }}>
                                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <Input
                                                    type="email"
                                                    fullWidth
                                                    style={{ paddingLeft: '48px' }}
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                                            {success && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.875rem' }}
                                                >
                                                    <CheckCircle2 size={18} /> Profile Synchronized
                                                </motion.div>
                                            )}
                                            <Button type="submit" disabled={submitting}>
                                                <Save size={18} />
                                                {submitting ? 'Applying...' : 'Save Changes'}
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
                            >
                                <Card style={{ padding: '32px' }}>
                                    <div style={{ marginBottom: '32px' }}>
                                        <h3 style={{ margin: '0 0 8px 0' }}>Security Credentials</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Secure your account by updating your password periodically.</p>
                                    </div>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>NEW PASSWORD</label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <Input
                                                    type="password"
                                                    fullWidth
                                                    style={{ paddingLeft: '48px' }}
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CONFIRMATION</label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <Input
                                                    type="password"
                                                    fullWidth
                                                    style={{ paddingLeft: '48px' }}
                                                    value={formData.password_confirmation}
                                                    onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                                                    placeholder="Repeat new password"
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                                            {success && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.875rem' }}
                                                >
                                                    <CheckCircle2 size={18} /> Credentials Updated
                                                </motion.div>
                                            )}
                                            <Button type="submit" disabled={submitting}>
                                                <Save size={18} />
                                                {submitting ? 'Updating...' : 'Update Credentials'}
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
                            >
                                <Card style={{ padding: '32px' }}>
                                    <div style={{ marginBottom: '32px' }}>
                                        <h3 style={{ margin: '0 0 8px 0' }}>System Preferences</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tailor your administrative experience.</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {preferenceItems.map((pref) => (
                                            <div
                                                key={pref.id}
                                                onClick={() => togglePreference(pref.id)}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '16px',
                                                    background: 'var(--bg-main)',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border-color)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>{pref.title}</div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{pref.desc}</div>
                                                </div>
                                                <Toggle checked={prefs[pref.id]} onChange={() => togglePreference(pref.id)} />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </motion.div>
    );
};

export default Settings;
