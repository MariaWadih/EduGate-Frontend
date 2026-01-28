import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, DashboardSwitcher } from './config';

// Pages
import Login from '../pages/Login';
import Announcements from '../pages/Announcements';
import FeedbackMessages from '../pages/FeedbackMessages';
import Settings from '../pages/Settings';
import PlaceholderPage from '../pages/PlaceholderPage';

// Admin
import Teachers from '../pages/Admin/Teachers';
import Parents from '../pages/Admin/Parents';
import Students from '../pages/Admin/Students';
import AcademicManagement from '../pages/Admin/AcademicManagement';

// Teacher
import TeacherClasses from '../pages/Teachers/TeacherClasses';
import MarkAttendance from '../pages/Teachers/MarkAttendance';
import ClassRoster from '../pages/Teachers/ClassRoster';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Main Application Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <DashboardSwitcher />
                </ProtectedRoute>
            } />

            <Route path="/announcements" element={
                <ProtectedRoute>
                    <Announcements />
                </ProtectedRoute>
            } />

            <Route path="/feedback" element={
                <ProtectedRoute>
                    <FeedbackMessages />
                </ProtectedRoute>
            } />

            <Route path="/settings" element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/teachers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <Teachers />
                </ProtectedRoute>
            } />
            <Route path="/parents" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <Parents />
                </ProtectedRoute>
            } />
            <Route path="/students" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <Students />
                </ProtectedRoute>
            } />
            <Route path="/academy" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AcademicManagement />
                </ProtectedRoute>
            } />
            <Route path="/financial" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderPage title="Financial Management" />
                </ProtectedRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/classes" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherClasses />
                </ProtectedRoute>
            } />
            <Route path="/attendance" element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <MarkAttendance />
                </ProtectedRoute>
            } />
            <Route path="/classes/:id" element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <ClassRoster />
                </ProtectedRoute>
            } />

            {/* Student/Parent/Teacher Shared Placeholders */}
            <Route path="/assignments" element={
                <ProtectedRoute allowedRoles={['student', 'parent', 'teacher']}>
                    <PlaceholderPage title="Assignments" />
                </ProtectedRoute>
            } />
            <Route path="/exams" element={
                <ProtectedRoute allowedRoles={['student', 'parent', 'teacher']}>
                    <PlaceholderPage title="Exams & Quizzes" />
                </ProtectedRoute>
            } />

            {/* Default fallback */}
            <Route path="*" element={<ProtectedRoute><DashboardSwitcher /></ProtectedRoute>} />
        </Routes>
    );
};

export default AppRoutes;
