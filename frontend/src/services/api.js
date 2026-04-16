import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { username, password });
  return response.data;
};

export const getLeads = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/leads`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createLead = async (leadData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/leads`, leadData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateLeadStatus = async (id, status) => {
  const token = localStorage.getItem('token');
  const response = await axios.patch(`${API_URL}/leads/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addNote = async (id, text) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/leads/${id}/notes`, { text }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteLead = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/leads/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};