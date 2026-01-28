import client from '../api/client';

export const academicService = {
    getHierarchy: () => client.get('/academic-hierarchy'),

    // Classes
    getClasses: () => client.get('/classes'),
    getClass: (id) => client.get(`/classes/${id}`),
    createClass: (data) => client.post('/classes', data),
    updateClass: (id, data) => client.put(`/classes/${id}`, data),
    deleteClass: (id) => client.delete(`/classes/${id}`),

    // Subjects
    getSubjects: () => client.get('/subjects'),
    createSubject: (data) => client.post('/subjects', data),
    updateSubject: (id, data) => client.put(`/academic/subject/${id}`, data),
    deleteSubject: (id) => client.delete(`/subjects/${id}`),

    // Advanced Academic CRUD (from AcademicManagement)
    createGradeSubject: (data) => client.post('/academic/grade-subject', data),
    createGrade: (data) => client.post('/academic/grade', data),
    createSection: (data) => client.post('/academic/section', data),
    deleteGrade: (data) => client.delete('/academic/grade', { data }),
    deleteSection: (id) => client.delete(`/academic/section/${id}`),
    deleteGradeSubject: (data) => client.delete('/academic/grade-subject', { data }),
    updateGrade: (data) => client.put('/academic/grade', data),
    updateSection: (id, data) => client.put(`/academic/section/${id}`, data),

    // Schedules
    getSchedules: (config) => client.get('/schedules', config),
    createSchedule: (data) => client.post('/schedules', data),
    deleteSchedule: (id) => client.delete(`/schedules/${id}`),
};
