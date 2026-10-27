import api from './api';

// ---- Counselor registration & profiles ----
export const registerCounselor = async (payload) => {
  const { data } = await api.post('/counselors/register', payload);
  return data.data;
};
export const getCounselors = async () => (await api.get('/counselors')).data.data.counselors;
export const getCounselor = async (id) => (await api.get(`/counselors/${id}`)).data.data.counselor;
export const getMyCounselorProfile = async () => (await api.get('/counselors/me/profile')).data.data.profile;
export const updateMyCounselorProfile = async (payload) =>
  (await api.put('/counselors/me/profile', payload)).data.data.profile;

// ---- Admin: approve counselors ----
export const adminGetCounselors = async () => (await api.get('/counselors/admin/all')).data.data.counselors;
export const adminSetCounselorApproval = async (id, approved) =>
  (await api.patch(`/counselors/admin/${id}/approval`, { approved })).data;

// ---- Slots ----
export const getCounselorSlots = async (id) => (await api.get(`/counselors/${id}/slots`)).data.data;
export const getMySlots = async (params = {}) => (await api.get('/slots/mine', { params })).data.data.slots;
export const createSlots = async (payload) => (await api.post('/slots', payload)).data.data.slots;
export const deleteSlot = async (id) => (await api.delete(`/slots/${id}`)).data;

// ---- Appointments ----
export const bookAppointment = async (payload) => (await api.post('/appointments', payload)).data.data.appointment;
export const getAppointments = async (scope) =>
  (await api.get('/appointments', { params: { scope } })).data.data.appointments;
export const cancelAppointment = async (id, reason = '') =>
  (await api.patch(`/appointments/${id}/cancel`, { reason })).data.data.appointment;
export const setAppointmentStatus = async (id, status) =>
  (await api.patch(`/appointments/${id}/status`, { status })).data.data.appointment;

// ---- Counselor tickets (messenger-style chat) ----
export const createCounselorTicket = async (payload) =>
  (await api.post('/counselor-tickets', payload)).data.data.ticket;
export const getCounselorTickets = async (params = {}) => (await api.get('/counselor-tickets', { params })).data.data;
export const getCounselorTicket = async (id) => (await api.get(`/counselor-tickets/${id}`)).data.data;
export const pollTicketMessages = async (id, after) =>
  (await api.get(`/counselor-tickets/${id}/messages`, { params: after ? { after } : {} })).data.data;
export const sendTicketMessage = async (id, content) =>
  (await api.post(`/counselor-tickets/${id}/messages`, { content })).data.data;
export const setCounselorTicketStatus = async (id, status) =>
  (await api.patch(`/counselor-tickets/${id}/status`, { status })).data.data.ticket;
