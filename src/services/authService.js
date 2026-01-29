import client from '../api/client';

export const authService = {
    // csrf: () => client.get('http://localhost:8000/sanctum/csrf-cookie'), // Not needed for token auth

    login: async (email, password) => {
        const response = await client.post('/login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response;
    },

    logout: async () => {
        try {
            await client.post('/logout');
        } finally {
            localStorage.removeItem('token');
        }
    },

    getMe: () => client.get('/me'),
    updateProfile: (data) => client.put('/profile', data),

    register: async (data) => {
        const response = await client.post('/users/register', data);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response;
    }
};
