import client from '../api/client';

export const promotionService = {
    getCandidates: (params) => client.get('/promotions/candidates', { params }),

    promoteStudents: (data) => client.post('/promotions/promote', data),

    bulkPromoteClass: (data) => client.post('/promotions/bulk-promote-class', data),

    getStudentHistory: (studentId) => client.get(`/promotions/student/${studentId}/history`),
    getYearStatistics: (academicYear) => client.get(`/promotions/year/${academicYear}/statistics`),
    initializeNextYearClasses: (data) => client.post('/promotions/initialize-classes', data)
};
