import api from './api';

// Tickets
export const createTicket = async (payload) => {
  const { data } = await api.post('/tickets', payload);
  return data.data.ticket;
};

export const getTickets = async (params = {}) => {
  const { data } = await api.get('/tickets', { params });
  return data.data.tickets;
};

export const getTicket = async (id) => {
  const { data } = await api.get(`/tickets/${id}`);
  return data.data.ticket;
};

export const updateTicket = async (id, payload) => {
  const { data } = await api.patch(`/tickets/${id}`, payload);
  return data.data.ticket;
};

// FAQs
export const getFaqs = async (params = {}) => {
  const { data } = await api.get('/faqs', { params });
  return data.data.faqs;
};

export const createFaq = async (payload) => {
  const { data } = await api.post('/faqs', payload);
  return data.data.faq;
};

export const updateFaq = async (id, payload) => {
  const { data } = await api.put(`/faqs/${id}`, payload);
  return data.data.faq;
};

export const deleteFaq = async (id) => {
  const { data } = await api.delete(`/faqs/${id}`);
  return data;
};

// Admin
export const getAnalytics = async () => {
  const { data } = await api.get('/admin/analytics');
  return data.data;
};

export const getUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data.data.users;
};

export const updateUserRole = async (id, payload) => {
  const { data } = await api.patch(`/admin/users/${id}`, payload);
  return data.data.user;
};
