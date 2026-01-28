import client from '../api/client';

export const teacherService = {
    getAll: () => client.get('/teachers'),
    getOne: (id) => client.get(`/teachers/${id}`),
    create: (data) => client.post('/teachers', data),
    update: (id, data) => client.put(`/teachers/${id}`, data),
    delete: (id) => client.delete(`/teachers/${id}`),

    // Teacher-specific (for teacher role)
    getDashboard: () => client.get('/analytics/teacher/overview'),
    getMyClasses: () => client.get('/teacher/classes'),
    getClasses: () => client.get('/analytics/classes'),
    storeAttendance: (data) => client.post('/attendance', data),
};
