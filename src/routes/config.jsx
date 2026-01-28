import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import Sidebar from '../components/organisms/Sidebar';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import TeacherDashboard from '../pages/Teachers/TeacherDashboard';
import StudentDashboard from '../pages/Students/StudentDashboard';
import ParentDashboard from '../pages/Parents/ParentDashboard';

/**
 * Route protector that checks for authentication and optional role-based access.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

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
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div className="main-content" style={{ flex: 1, minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
                {children}
            </div>
        </div>
    );
};

/**
 * Automatically switches the root dashboard based on user role.
 */
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
