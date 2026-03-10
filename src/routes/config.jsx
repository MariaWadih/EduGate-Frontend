import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import Sidebar from '../components/organisms/Sidebar';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import TeacherDashboard from '../pages/Teachers/TeacherDashboard';
import StudentDashboard from '../pages/Students/StudentDashboard';
import ParentDashboard from '../pages/Parents/ParentDashboard';
import { Menu, X } from 'lucide-react';

/**
 * Route protector that checks for authentication and optional role-based access.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    // Close sidebar on route change
    React.useEffect(() => {
        setIsMobileOpen(false);
    }, [window.location.pathname]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-muted">Loading Secure Session...</div>
        </div>
    );

    if (!user) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return (
        <div className="main-layout">
            <div
                className={`sidebar-overlay ${isMobileOpen ? 'mobile-open' : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            <Sidebar className={isMobileOpen ? 'mobile-open' : ''} />

            <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header className="mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }} />
                        <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>EduGate</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

// Import Switcher dependencies
import TeacherAssignments from '../pages/Teachers/TeacherAssignments';
import StudentHomework from '../pages/Students/StudentHomework';
import TeacherExams from '../pages/Teachers/TeacherExams';
import StudentExams from '../pages/Students/StudentExams';
import TakeExam from '../pages/Students/TakeExam';
import PlaceholderPage from '../pages/PlaceholderPage';

export const DashboardSwitcher = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'admin': return <AdminDashboard />;
        case 'teacher': return <TeacherDashboard />;
        case 'student': return <StudentDashboard />;
        case 'parent': return <ParentDashboard />;
        default: return <Navigate to="/login" />;
    }
};

export const AssignmentsSwitcher = () => {
    const { user } = useAuth();
    if (['teacher', 'admin'].includes(user.role)) return <TeacherAssignments />;
    if (user.role === 'student') return <StudentHomework />;
    return <PlaceholderPage title="Assignments" />;
};

export const ExamsSwitcher = () => {
    const { user } = useAuth();
    if (['teacher', 'admin'].includes(user.role)) return <TeacherExams />;
    if (user.role === 'student') return <StudentExams />;
    return <PlaceholderPage title="Exams & Quizzes" />;
};
