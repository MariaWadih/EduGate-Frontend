import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, ClipboardCheck,
    Bell, LogOut, TrendingUp, Heart, Settings,
    GraduationCap, MessageSquare, CreditCard, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 8px', marginBottom: '48px' }}>
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}>
                    <GraduationCap size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>EduGate</h2>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Management Suite</div>
                </div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="text-muted text-small" style={{ fontWeight: 700, padding: '0 14px 12px 14px', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Main Menu</div>

                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    Dashboard
                </NavLink>

                {user?.role === 'admin' && (
                    <>
                        <NavLink to="/teachers" className="nav-link">
                            <Users size={20} />
                            Teachers Management
                        </NavLink>
                        <NavLink to="/parents" className="nav-link">
                            <Users size={20} />
                            Parents Management
                        </NavLink>
                        <NavLink to="/students" className="nav-link">
                            <Users size={20} />
                            Students Management
                        </NavLink>
                        <NavLink to="/academy" className="nav-link">
                            <BookOpen size={20} />
                            Academic Management
                        </NavLink>

                    </>
                )}

                {user?.role === 'teacher' && (
                    <>
                        <NavLink to="/classes" className="nav-link">
                            <BookOpen size={20} />
                            My Classes
                        </NavLink>
                        <NavLink to="/assignments" className="nav-link">
                            <ClipboardCheck size={20} />
                            Assignments
                        </NavLink>
                        <NavLink to="/exams" className="nav-link">
                            <ClipboardCheck size={20} />
                            Exams & Quizzes
                        </NavLink>
                        <NavLink to="/attendance" className="nav-link">
                            <Users size={20} />
                            Attendance
                        </NavLink>
                    </>
                )}

                {(user?.role === 'student' || user?.role === 'parent') && (
                    <>
                        <NavLink to="/assignments" className="nav-link">
                            <ClipboardCheck size={20} />
                            Assignments
                        </NavLink>
                        <NavLink to="/exams" className="nav-link">
                            <TrendingUp size={20} />
                            Exams
                        </NavLink>
                    </>
                )}

                <div className="text-muted text-small" style={{ fontWeight: 700, padding: '24px 14px 12px 14px', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Communication</div>

                <NavLink to="/announcements" className="nav-link">
                    <Bell size={20} />
                    Announcements
                </NavLink>

                <NavLink to="/feedback" className="nav-link">
                    <MessageSquare size={20} />
                    Feedback & Messages
                </NavLink>

                {user?.role === 'admin' && (
                    <NavLink to="/financial" className="nav-link">
                        <CreditCard size={20} />
                        Financial Management
                    </NavLink>
                )}

            </nav>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '20px' }}>
                <NavLink to="/settings" className="nav-link">
                    <Settings size={20} />
                    Settings
                </NavLink>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    marginTop: '12px',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                }}>
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                        alt="pfp"
                        style={{ width: '38px', height: '38px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 600 }}>{user?.role}</div>
                    </div>
                </div>

                <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '8px', color: 'var(--danger)' }}>
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
