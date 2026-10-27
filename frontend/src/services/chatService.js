import api from './api';

export const getConversations = async () => {
  const { data } = await api.get('/chat/conversations');
  return data.data.conversations;
};

export const createConversation = async (payload = {}) => {
  const { data } = await api.post('/chat/conversations', payload);
  return data.data.conversation;
};

export const getConversation = async (id) => {
  const { data } = await api.get(`/chat/conversations/${id}`);
  return data.data;
};

export const deleteConversation = async (id) => {
  const { data } = await api.delete(`/chat/conversations/${id}`);
  return data;
};

export const sendMessage = async (conversationId, content) => {
  const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
  return data.data;
};

export const submitMessageFeedback = async (messageId, feedback) => {
  const { data } = await api.patch(`/chat/messages/${messageId}/feedback`, { feedback });
  return data.data;
};
