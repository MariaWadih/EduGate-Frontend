import client from '../api/client';

export const feedbackService = {
    getAll: () => client.get('/feedback'),
    create: (data) => client.post('/feedback', data),
    update: (id, data) => client.put(`/feedback/${id}`, data),
    getOne: (id) => client.get(`/feedback/${id}`),
    delete: (id) => client.delete(`/feedback/${id}`),
};
