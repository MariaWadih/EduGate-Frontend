import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/Dashboards/AdminDashboard';
import TeacherDashboard from './pages/Dashboards/TeacherDashboard';
import TeacherClasses from './pages/TeacherClasses';
import StudentDashboard from './pages/Dashboards/StudentDashboard';
import ParentDashboard from './pages/Dashboards/ParentDashboard';
import Sidebar from './components/organisms/Sidebar';
import Announcements from './pages/Announcements';
import MarkAttendance from './pages/MarkAttendance';
import ClassRoster from './pages/ClassRoster';
import Teachers from './pages/Teachers';
import Parents from './pages/Parents';
import Students from './pages/Students';
import AcademicManagement from './pages/AcademicManagement';
import FeedbackMessages from './pages/FeedbackMessages';
import Settings from './pages/Settings';
import PlaceholderPage from './pages/PlaceholderPage';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

const DashboardSwitcher = () => {
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
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

          <Route path="/teachers" element={<ProtectedRoute allowedRoles={['admin']}><Teachers /></ProtectedRoute>} />
          <Route path="/parents" element={<ProtectedRoute allowedRoles={['admin']}><Parents /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={['admin']}><Students /></ProtectedRoute>} />
          <Route path="/academy" element={<ProtectedRoute allowedRoles={['admin']}><AcademicManagement /></ProtectedRoute>} />


          <Route path="/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherClasses /></ProtectedRoute>} />

          <Route path="/assignments" element={<ProtectedRoute allowedRoles={['student', 'parent', 'teacher']}><PlaceholderPage title="Assignments" /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute allowedRoles={['student', 'parent', 'teacher']}><PlaceholderPage title="Exams" /></ProtectedRoute>} />

          <Route path="/feedback" element={<ProtectedRoute><FeedbackMessages /></ProtectedRoute>} />
          <Route path="/financial" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Financial Management" /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Add more specific routes as needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
