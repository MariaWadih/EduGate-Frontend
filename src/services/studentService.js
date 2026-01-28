import client from '../api/client';

export const studentService = {
    getAll: () => client.get('/students'),
    getOne: (id) => client.get(`/students/${id}`),
    create: (data) => client.post('/students', data),
    update: (id, data) => client.put(`/students/${id}`, data),
    delete: (id) => client.delete(`/students/${id}`),

    // Student-specific (for student role)
    getDashboard: () => client.get('/analytics/student/overview'),
    getMyAttendance: () => client.get('/attendance/my'),
    getMyGrades: () => client.get('/grades/my'),
    getMyHomework: () => client.get('/homework/my'),
};
