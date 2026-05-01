import axios from 'axios';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000') + '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const saveToHistory = (result) => {
  if (typeof window === 'undefined') return;
  const history = JSON.parse(localStorage.getItem('xai_history') || '[]');
  history.unshift({ ...result, date: new Date().toISOString() });
  localStorage.setItem('xai_history', JSON.stringify(history));
};

export const getHistory = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('xai_history') || '[]');
};
