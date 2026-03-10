import axios from 'axios';

const client = axios.create({
    baseURL: 'http://127.0.0.1:18000/api',
    // withCredentials: true, // Not needed for Bearer token
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add a request interceptor to inject the token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
