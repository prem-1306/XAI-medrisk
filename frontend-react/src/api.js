import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Since history is required but wasn't fully implemented in the dummy, we'll store local history in localStorage as a fallback.
export const saveToHistory = (result) => {
  const history = JSON.parse(localStorage.getItem('xai_history') || '[]');
  history.unshift({ ...result, date: new Date().toISOString() });
  localStorage.setItem('xai_history', JSON.stringify(history));
};

export const getHistory = () => {
  return JSON.parse(localStorage.getItem('xai_history') || '[]');
};
