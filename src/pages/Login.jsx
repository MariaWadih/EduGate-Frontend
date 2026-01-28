import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { Button, Card, Input } from '../components/atoms';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            if (!err.response) {
                setError('Unable to connect to the server. Please check if the backend is running.');
            } else {
                setError(err.response?.data?.message || 'Invalid credentials');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    x: [0, 50, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '40vw',
                    height: '40vw',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%'
                }}
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -120, 0],
                    x: [0, -30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-5%',
                    width: '35vw',
                    height: '35vw',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%'
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '24px',
                    zIndex: 10
                }}
            >
                <Card style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '48px',
                    borderRadius: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                            borderRadius: '20px',
                            color: 'white',
                            marginBottom: '24px',
                            boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
                        }}>
                            <GraduationCap size={40} />
                        </div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#111827' }}>EduGate</h1>
                        <p style={{ margin: 0, color: '#6B7280', fontWeight: 500, fontSize: '1rem' }}>Welcome back to your workspace</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <AnimatePresence mode='wait'>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        background: '#FEF2F2',
                                        color: '#B91C1C',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        border: '1px solid #FCA5A5'
                                    }}
                                >
                                    <AlertCircle size={18} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label style={{ display: 'block', paddingLeft: '4px', marginBottom: '10px', fontSize: '0.875rem', fontWeight: 700, color: '#374151' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                <Input
                                    type="email"
                                    placeholder="name@edugate.com"
                                    style={{
                                        paddingLeft: '48px',
                                        width: '100%',
                                        height: '52px',
                                        backgroundColor: '#F9FAFB',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '14px',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500
                                    }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', paddingLeft: '4px', marginBottom: '10px', fontSize: '0.875rem', fontWeight: 700, color: '#374151' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    style={{
                                        paddingLeft: '48px',
                                        width: '100%',
                                        height: '52px',
                                        backgroundColor: '#F9FAFB',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '14px',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500
                                    }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                height: '52px',
                                marginTop: '8px',
                                fontSize: '1rem',
                                borderRadius: '14px'
                            }}
                        >
                            {isLoading ? 'Authenticating...' : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Sign In <ChevronRight size={18} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 500 }}>
                            Demo Access: admin@edugate.com / password
                        </p>
                    </div>
                </Card>

                <p style={{ textAlign: 'center', marginTop: '32px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 600 }}>
                    &copy; 2026 EduGate Systems Inc.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
