import client from '../api/client';

export const announcementService = {
    getAll: () => client.get('/announcements'),
    create: (data) => client.post('/announcements', data),
};
