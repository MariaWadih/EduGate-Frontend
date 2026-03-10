import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, ClipboardCheck,
    Bell, LogOut, TrendingUp, Heart, Settings,
    GraduationCap, MessageSquare, CreditCard, ChevronRight,
    CalendarDays, Trophy, History
} from 'lucide-react';
import { useAuth } from '../../hooks';

const Sidebar = ({ className = '' }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className={`sidebar ${className}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 8px', marginBottom: '32px' }}>
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)',
                    color: 'white',
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)',
                    flexShrink: 0
                }}>
                    <GraduationCap size={22} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, fontWeight: 900, letterSpacing: '-0.03em' }}>EduGate</h2>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-1px' }}>Management Suite</div>
                </div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 800, padding: '0 14px 10px 14px', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--text-muted)', opacity: 0.6 }}>Main Menu</div>

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
                        <NavLink to="/promotions" className="nav-link">
                            <TrendingUp size={20} />
                            Student Promotion
                        </NavLink>
                        <NavLink to="/history" className="nav-link">
                            <History size={20} />
                            History & Archives
                        </NavLink>

                    </>
                )}

                {user?.role === 'teacher' && (
                    <>
                        <NavLink
                            to="/classes"
                            className={({ isActive }) => {
                                const isAssignments = location.pathname.includes('/assignments');
                                return `nav-link ${isActive && !isAssignments ? 'active' : ''}`;
                            }}
                        >
                            <BookOpen size={20} />
                            My Classes
                        </NavLink>
                        <NavLink
                            to="/assignments"
                            className={({ isActive }) => {
                                const isClassAssignments = location.pathname.includes('/assignments');
                                return `nav-link ${isActive || isClassAssignments ? 'active' : ''}`;
                            }}
                        >
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
                        <NavLink to="/teacher/grades" className="nav-link">
                            <Trophy size={20} />
                            Grades & Results
                        </NavLink>
                    </>
                )}

                {(user?.role === 'student' || user?.role === 'parent') && (
                    <>
                        <NavLink to="/student/calendar" className="nav-link">
                            <CalendarDays size={18} />
                            Academic Calendar
                        </NavLink>
                        <NavLink to="/assignments" className="nav-link">
                            <ClipboardCheck size={18} />
                            Assignments
                        </NavLink>
                        <NavLink to="/exams" className="nav-link">
                            <TrendingUp size={20} />
                            Exams
                        </NavLink>
                        {user?.role === 'student' && (
                            <>
                                <NavLink to="/student/courses" className="nav-link">
                                    <BookOpen size={20} />
                                    My Courses
                                </NavLink>
                                <NavLink to="/student/attendance" className="nav-link">
                                    <Users size={20} />
                                    Attendance
                                </NavLink>
                                <NavLink to="/student/grades" className="nav-link">
                                    <Trophy size={20} />
                                    Performance Record
                                </NavLink>
                            </>
                        )}
                    </>
                )}

                <div style={{ fontWeight: 800, padding: '24px 14px 10px 14px', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--text-muted)', opacity: 0.6 }}>Communication</div>

                <NavLink to="/announcements" className="nav-link">
                    <Bell size={20} />
                    Announcements
                </NavLink>

                <NavLink to="/feedback" className="nav-link">
                    <MessageSquare size={20} />
                    Feedback & Messages
                </NavLink>


            </nav>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: 'auto' }}>
                <NavLink to="/settings" className="nav-link">
                    <Settings size={18} />
                    Settings
                </NavLink>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    marginTop: '12px',
                    backgroundColor: 'rgba(249, 250, 251, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}>
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5&color=fff&bold=true`}
                        alt="pfp"
                        style={{ width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em', opacity: 0.7 }}>{user?.role}</div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="nav-link"
                    style={{
                        width: '100%',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginTop: '8px',
                        color: '#EF4444',
                        transition: 'all 0.2s ease',
                        padding: '10px 14px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                        e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#EF4444';
                    }}
                >
                    <LogOut size={18} />
                    <span style={{ fontWeight: 700 }}>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
