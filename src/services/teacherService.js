import client from '../api/client';

export const teacherService = {
    getAll: () => client.get('/teachers'),
    getOne: (id) => client.get(`/teachers/${id}`),
    create: (data) => client.post('/teachers', data),
    update: (id, data) => client.put(`/teachers/${id}`, data),
    delete: (id) => client.delete(`/teachers/${id}`),
    updateStatus: (id, status) => client.patch(`/teachers/${id}/status`, { status }),

    // Teacher-specific (for teacher role)
    getDashboard: () => client.get('/analytics/teacher/overview'),
    getMyClasses: () => client.get('/teacher/classes'),
    getClasses: () => client.get('/analytics/classes'),
    storeAttendance: (data) => client.post('/attendance', data),
    checkAttendance: (classId, date) => client.get(`/attendance/check?class_id=${classId}&date=${date}`),

    // Materials
    getMaterials: (classId, subjectId) => client.get(`/materials?class_id=${classId}${subjectId ? `&subject_id=${subjectId}` : ''}`),
    uploadMaterial: (formData) => client.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteMaterial: (id) => client.delete(`/materials/${id}`),
    downloadMaterial: (path) => client.get(`/materials/download?path=${path}`, { responseType: 'blob' }),

    // Grades
    getGrades: (classId, subjectId) => client.get(`/grades?class_id=${classId}&subject_id=${subjectId}`),
    saveGrades: (grades) => client.post('/grades', { grades }),
};
