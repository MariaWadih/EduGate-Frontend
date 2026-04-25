import client from '../api/client';

export const academicYearService = {
    getAll:   ()        => client.get('/academic-years'),
    getActive: ()       => client.get('/academic-years/active'),
    create:   (data)    => client.post('/academic-years', data),
    update:   (id, data) => client.put(`/academic-years/${id}`, data),
    activate: (id)      => client.post(`/academic-years/${id}/activate`),
    getRecords: (id)    => client.get(`/academic-years/${id}/records`),
};
