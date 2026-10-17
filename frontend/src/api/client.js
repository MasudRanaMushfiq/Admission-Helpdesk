import axios from 'axios';

const TOKEN_KEY = 'helpdesk_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Adds the token to every request
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Invalid token -> logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadToken) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Readable message from an API error
export function errorMessage(error) {
  const data = error.response?.data;
  if (data?.errors) return Object.values(data.errors).join('. ');
  return data?.message || 'Could not reach the server, please try again';
}

// Field errors
export function fieldErrors(error) {
  return error.response?.data?.errors || {};
}

export default api;
