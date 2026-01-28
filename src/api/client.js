import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true, // Key for HTTP-only cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Helper to get cookie by name
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

client.interceptors.request.use(config => {
    const token = getCookie('XSRF-TOKEN');
    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
    return config;
});

export default client;
