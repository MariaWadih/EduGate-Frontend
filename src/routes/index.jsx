import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, DashboardSwitcher, AssignmentsSwitcher, ExamsSwitcher } from './config';

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
import StudentPromotion from '../pages/Admin/StudentPromotion';
import HistoricalRecords from '../pages/Admin/HistoricalRecords';
import AcademicYearRecords from '../pages/Admin/AcademicYearRecords';

// Teacher
import TeacherClasses from '../pages/Teachers/TeacherClasses';
import MarkAttendance from '../pages/Teachers/MarkAttendance';
import ClassRoster from '../pages/Teachers/ClassRoster';
import ClassHomework from '../pages/Teachers/ClassHomework';
import ClassMaterials from '../pages/Teachers/ClassMaterials';
import HomeworkSubmissions from '../pages/Teachers/HomeworkSubmissions';
import ExamDetails from '../pages/Teachers/ExamDetails';
import ExamSubmissions from '../pages/Teachers/ExamSubmissions';
import TeacherGrades from '../pages/Teachers/TeacherGrades';

// Student
import StudentCourses from '../pages/Students/StudentCourses';
import StudentAttendance from '../pages/Students/StudentAttendance';
import StudentMaterials from '../pages/Students/StudentMaterials';
import StudentCalendar from '../pages/Students/StudentCalendar';
import StudentGrades from '../pages/Students/StudentGrades';
import TakeExam from '../pages/Students/TakeExam';

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
            <Route path="/promotions" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <StudentPromotion />
                </ProtectedRoute>
            } />

            <Route path="/academic-records" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AcademicYearRecords />
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
            <Route path="/classes/:id/assignments" element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <ClassHomework />
                </ProtectedRoute>
            } />
            <Route path="/classes/:id/materials" element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <ClassMaterials />
                </ProtectedRoute>
            } />
            <Route path="/homework/:id/submissions" element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <HomeworkSubmissions />
                </ProtectedRoute>
            } />
            <Route path="/teacher/exams/:id/view" element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <ExamDetails />
                </ProtectedRoute>
            } />
            <Route path="/teacher/exams/:id/submissions" element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <ExamSubmissions />
                </ProtectedRoute>
            } />
            <Route path="/teacher/grades" element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherGrades />
                </ProtectedRoute>
            } />

            {/* Student/Parent Shared Placeholders */}
            <Route path="/assignments" element={
                <ProtectedRoute allowedRoles={['student', 'parent', 'teacher', 'admin']}>
                    <AssignmentsSwitcher />
                </ProtectedRoute>
            } />
            <Route path="/exams" element={
                <ProtectedRoute allowedRoles={['student', 'parent', 'teacher']}>
                    <ExamsSwitcher />
                </ProtectedRoute>
            } />

            {/* Student Specific Routes */}
            <Route path="/student/attendance" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentAttendance />
                </ProtectedRoute>
            } />
            <Route path="/student/courses" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentCourses />
                </ProtectedRoute>
            } />
            <Route path="/student/calendar" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentCalendar />
                </ProtectedRoute>
            } />
            <Route path="/student/grades" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentGrades />
                </ProtectedRoute>
            } />
            <Route path="/student/materials" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentMaterials />
                </ProtectedRoute>
            } />
            <Route path="/student/exams/:id/take" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <TakeExam />
                </ProtectedRoute>
            } />

            {/* Default fallback */}
            <Route path="*" element={<ProtectedRoute><DashboardSwitcher /></ProtectedRoute>} />
        </Routes>
    );
};

export default AppRoutes;
