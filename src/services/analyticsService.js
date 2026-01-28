import client from '../api/client';

export const analyticsService = {
    getAdminOverview: () => client.get('/analytics/admin/overview'),
    getTeacherOverview: () => client.get('/analytics/teacher/overview'),
    getParentOverview: (studentId) => client.get(`/analytics/parent/overview?student_id=${studentId}`),
    getStudentOverview: () => client.get('/analytics/student/overview'),
};
