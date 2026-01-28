import client from '../api/client';

export const authService = {
    csrf: () => client.get('http://localhost:8000/sanctum/csrf-cookie'), // Ensure full URL
    login: (email, password) => client.post('/login', { email, password }),
    logout: () => client.post('/logout'),
    getMe: () => client.get('/me'),
    updateProfile: (data) => client.put('/profile', data),
    register: (data) => client.post('/users/register', data)
};
