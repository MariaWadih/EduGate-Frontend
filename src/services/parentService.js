import client from '../api/client';

export const parentService = {
    getAll: () => client.get('/parents'),
    getOne: (id) => client.get(`/parents/${id}`),
    create: (data) => client.post('/parents', data),
    update: (id, data) => client.put(`/parents/${id}`, data),
    delete: (id) => client.delete(`/parents/${id}`),

    // Parent-specific
    getChildren: () => client.get('/parent/children'),
    getRecommendations: () => client.get('/parent/recommendations'),
    postRecommendation: (data) => client.post('/parent/recommendations', data),
};
