import axios from 'axios';
import { DEFAULT_USER } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('postwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('postwise_token');
        localStorage.removeItem('postwise_user');
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// ============================================
// BRAND API
// ============================================
export const brandAPI = {
  getBrands: async () => {
    const res = await api.get('/brands');
    return res.data;
  },
  getBrandById: async (id) => {
    const res = await api.get(`/brands/${id}`);
    return res.data;
  },
  createBrand: async (data) => {
    const res = await api.post('/brands', data);
    return res.data;
  },
  updateBrand: async (id, data) => {
    const res = await api.put(`/brands/${id}`, data);
    return res.data;
  },
  deleteBrand: async (id) => {
    const res = await api.delete(`/brands/${id}`);
    return res.data;
  },
};

// ============================================
// CALENDAR API
// ============================================
export const calendarAPI = {
  generateCalendar: async (data) => {
    const res = await api.post('/calendars/generate', data);
    return res.data;
  },
  getCalendars: async () => {
    const res = await api.get('/calendars');
    return res.data;
  },
  getCalendarById: async (id) => {
    const res = await api.get(`/calendars/${id}`);
    return res.data;
  },
  exportJSON: async (id) => {
    return api.get(`/calendars/${id}/export/json`, { responseType: 'blob' });
  },
  exportCSV: async (id) => {
    return api.get(`/calendars/${id}/export/csv`, { responseType: 'blob' });
  },
  deleteCalendar: async (id) => {
    const res = await api.delete(`/calendars/${id}`);
    return res.data;
  },
};

// ============================================
// POST API
// ============================================
export const postAPI = {
  createPost: async (data) => {
    const res = await api.post('/posts', data);
    return res.data;
  },
  updatePost: async (id, data) => {
    const res = await api.put(`/posts/${id}`, data);
    return res.data;
  },
  regeneratePost: async (id, customInstruction) => {
    const res = await api.post(`/posts/${id}/regenerate`, { customInstruction });
    return res.data;
  },
  reschedulePost: async (id, date, timeSlot) => {
    const res = await api.patch(`/posts/${id}/reschedule`, { date, timeSlot });
    return res.data;
  },
  deletePost: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
  publishLinkedIn: async (id) => {
    const res = await api.post(`/posts/${id}/publish/linkedin`);
    return res.data;
  },
};

export default api;
