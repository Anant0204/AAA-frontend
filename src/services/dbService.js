import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://aaa-consultancy-production.up.railway.app/api/v1';

// Setup Axios instance with JWT Interceptor
const apiClient = axios.create({
  baseURL: API_URL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('clientToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dbService = {
  // LEADS
  getLeads: async () => {
    const res = await apiClient.get('/leads');
    return res.data;
  },
  getLeadById: async (id) => {
    const res = await apiClient.get(`/leads/${id}`);
    return res.data;
  },
  createLead: async (lead) => {
    const res = await apiClient.post('/leads', lead);
    return res.data;
  },
  updateLead: async (lead) => {
    const res = await apiClient.put(`/leads/${lead.id}`, lead);
    return res.data;
  },
  updateLeadStatus: async (leadId, status) => {
    const res = await apiClient.post('/leads/status', { leadId, status });
    return res.data;
  },
  assignAgent: async (leadId, agentId) => {
    const res = await apiClient.post('/leads/assign', { leadId, agentId });
    return res.data;
  },
  deleteLead: async (leadId) => {
    const res = await apiClient.delete(`/leads/${leadId}`);
    return res.data;
  },
  assignConsultant: async (leadId, consultantId) => {
    const res = await apiClient.post('/leads/assign', { leadId, agentId: consultantId });
    return res.data;
  },
  // Public — no auth needed — find lead by email for self-fill form
  findLeadByEmail: async (email) => {
    const res = await axios.get(`${API_URL}/leads/find-by-email?email=${encodeURIComponent(email)}`);
    return res.data;
  },
  // Public — lead submits meeting preference form
  updateMeetingPreference: async (leadId, data) => {
    const res = await axios.patch(`${API_URL}/leads/${leadId}/meeting-preference`, data);
    return res.data;
  },
  // Agent accepts or declines a consultation
  respondToConsultation: async (consultationId, action, declineReason = '') => {
    const res = await apiClient.patch(`/consultations/${consultationId}/respond`, { action, declineReason });
    return res.data;
  },
  // Admin auto-creates a Pending Acceptance consultation when assigning agent
  createConsultationForLead: async (data) => {
    const res = await apiClient.post('/consultations/create-for-lead', data);
    return res.data;
  },

  // CLIENTS & CASES
  getClients: async () => {
    const res = await apiClient.get('/clients');
    return res.data;
  },
  getClientProfile: async () => {
    const res = await apiClient.get('/clients/profile/me');
    return res.data;
  },
  createClient: async (client) => {
    const res = await apiClient.post('/clients', client);
    return res.data;
  },
  updateClientVisaStatus: async (clientId, visaStatus, status) => {
    const res = await apiClient.patch(`/clients/${clientId}/status`, { visaStatus, status });
    return res.data;
  },
  updateClientDependents: async (clientId, dependents) => {
    const res = await apiClient.patch(`/clients/${clientId}/dependents`, { dependents });
    return res.data;
  },
  generateClientCredentials: async (clientId, forceReset = false) => {
    const res = await apiClient.post(`/clients/${clientId}/credentials${forceReset ? '?forceReset=true' : ''}`);
    return res.data;
  },
  clientLogin: async (clientId, password) => {
    const res = await apiClient.post('/clients/login', { clientId, password });
    return res.data;
  },
  selectPackage: async (clientId, packageId) => {
    const res = await apiClient.post(`/clients/${clientId}/select-package`, {
      packageId,
      status: 'Payment Received',
      visaStatus: 'Document Preparation'
    });
    return res.data;
  },
  getActiveCases: async () => {
    const res = await apiClient.get('/cases/active');
    return res.data;
  },
  getClosedCases: async () => {
    const res = await apiClient.get('/cases/closed');
    return res.data;
  },

  // CONSULTATIONS
  getConsultations: async () => {
    const res = await apiClient.get('/consultations');
    return res.data;
  },
  createConsultation: async (cons) => {
    const res = await apiClient.post('/consultations', cons);
    return res.data;
  },
  updateConsultationStatus: async (consultationId, status) => {
    const res = await apiClient.patch(`/consultations/${consultationId}/outcome`, { status });
    return res.data;
  },
  completeConsultation: async (consultationId, outcome, notes, recommendedService, recommendedPackageId) => {
    const res = await apiClient.patch(`/consultations/${consultationId}/outcome`, { 
      status: 'Completed', 
      eligibility: outcome, 
      internalNotes: notes,
      recommendedService,
      recommendedPackageId
    });
    return res.data;
  },
  bookClientConsultation: async (data) => {
    const res = await apiClient.post('/consultations', data);
    return res.data;
  },

  // PAYMENTS
  getPayments: async () => {
    const res = await apiClient.get('/payments');
    return res.data;
  },
  generatePaymentLink: async (payment) => {
    const res = await apiClient.post('/payments/generate-link', payment);
    return res.data;
  },
  createInvoice: async (invoice) => {
    const res = await apiClient.post('/payments/generate-link', invoice);
    return res.data;
  },
  updatePaymentStatus: async (paymentId, status, paymentMethod, transactionId) => {
    const res = await apiClient.patch(`/payments/${paymentId}/status`, { status, paymentMethod, transactionId });
    return res.data;
  },
  createCheckoutSession: async ({ packageId, amount, discount }) => {
    const res = await apiClient.post('/payments/create-checkout-session', { packageId, amount, discount });
    return res.data;
  },
  verifyCheckoutSession: async (sessionId) => {
    const res = await apiClient.post('/payments/verify-checkout-session', { sessionId });
    return res.data;
  },

  // DOCUMENTS
  getDocuments: async () => {
    const res = await apiClient.get('/documents');
    return res.data;
  },
  uploadDocument: async (doc) => {
    const formData = new FormData();
    formData.append('file', doc.file);
    formData.append('clientId', doc.clientId);
    formData.append('category', doc.category || 'General');
    if (doc.belongsTo) formData.append('belongsTo', doc.belongsTo);
    if (doc.status) formData.append('status', doc.status);
    if (doc.uploadedByRole) formData.append('uploadedByRole', doc.uploadedByRole);

    const res = await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  reviewDocument: async (documentId, status, comment) => {
    const res = await apiClient.patch(`/documents/${documentId}/verify`, { status, feedbackComment: comment });
    return res.data;
  },
  uploadTranslatedDocument: async (documentId, file) => {
    const formData = new FormData();
    formData.append('translatedFile', file);
    const res = await apiClient.patch(`/documents/${documentId}/translated`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // MARKETING
  getMarketingSpend: async () => {
    const res = await apiClient.get('/marketing/spend');
    return res.data;
  },
  updateMarketingSpend: async (spendData) => {
    const res = await apiClient.post('/marketing/spend', spendData);
    return res.data;
  },

  // SETTINGS & CUSTOMIZATION
  getCustomizationSettings: async () => {
    try {
      const res = await apiClient.get('/settings/customization');
      const localDataStr = localStorage.getItem('crm_customization_settings');
      if (localDataStr) {
        try {
          const localData = JSON.parse(localDataStr);
          // We prefer localData over backend during development to prevent data loss on nodemon restarts
          // For rolesDefinition, we must ensure it replaces the default rather than just merging if it's longer
          return { ...res.data, ...localData, rolesDefinition: localData.rolesDefinition || res.data.rolesDefinition };
        } catch (e) {
          console.error('Error parsing local settings', e);
        }
      }
      return res.data;
    } catch (error) {
      const localDataStr = localStorage.getItem('crm_customization_settings');
      if (localDataStr) {
        return JSON.parse(localDataStr);
      }
      throw error;
    }
  },
  saveCustomizationSettings: async (settings) => {
    try {
      localStorage.setItem('crm_customization_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to local storage', e);
    }
    const res = await apiClient.put('/settings/customization', { settings });
    return res.data;
  },
  getLeadStages: async () => {
    const res = await apiClient.get('/settings/lead-stages');
    return res.data;
  },
  saveLeadStages: async (stages) => {
    const res = await apiClient.put('/settings/lead-stages', stages);
    return res.data;
  },

  // AGENTS
  getAgents: async () => {
    const res = await apiClient.get('/users/agents');
    return res.data;
  },
  createAgent: async (agent) => {
    const payload = {
      fullName: agent.name,
      email: agent.email,
      password: agent.password,
      hotlineNumber: agent.phone,
      role: agent.role,
      spokenLanguages: agent.languages,
      nationalities: agent.nationalities,
      commissionRate: agent.commissionRate,
      immigrationBio: agent.bio,
      customPermissions: agent.customPermissions
    };
    const res = await apiClient.post('/users', payload);
    return res.data;
  },
  updateAgent: async (agent) => {
    const payload = {
      fullName: agent.name,
      email: agent.email,
      hotlineNumber: agent.phone,
      role: agent.role,
      spokenLanguages: agent.languages,
      nationalities: agent.nationalities,
      commissionRate: agent.commissionRate,
      immigrationBio: agent.bio,
      customPermissions: agent.customPermissions
    };
    const res = await apiClient.put(`/users/${agent.id}`, payload);
    return res.data;
  },
  resetAgentPassword: async (id, newPassword) => {
    const res = await apiClient.put(`/users/${id}/password`, { newPassword });
    return res.data;
  },
  deleteAgent: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
  getConsultants: async () => {
    const res = await apiClient.get('/users/agents');
    // filter consultants if needed
    return res.data;
  },

  // AUTH
  authLogin: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  // Verify stored JWT token is still valid against backend
  verifyToken: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  clientLogin: async (clientId, password) => {
    const res = await apiClient.post('/clients/login', { clientId, password });
    return res.data;
  },
  changeClientPassword: async (clientId, newPassword) => {
    const res = await apiClient.put(`/clients/${clientId}/change-password`, { newPassword });
    return res.data;
  },

  // STUBS (To prevent UI crash where APIs are not yet built)
  getNotifications: async () => [],
  addNotification: async () => ({}),
  markNotificationRead: async (id) => ({ id }),
  markAllNotificationsRead: async () => ({}),
  getConversations: async () => {
    const res = await apiClient.get('/social/conversations');
    return res.data;
  },
  addConversation: async (newConv) => {
    return newConv;
  },
  markConversationRead: async (conversationId) => {
    try {
      const res = await apiClient.get('/social/conversations');
      const conversations = res.data;
      const conv = conversations.find(c => c.id === conversationId);
      const phone = conv ? conv.phone : conversationId.replace('conv_phone_', '');
      const readRes = await apiClient.get(`/social/messages/${encodeURIComponent(phone)}`);
      return readRes.data;
    } catch (e) {
      console.error('Failed to mark conversation as read:', e);
      return { success: false };
    }
  },
  receiveSocialMessage: async ({ conversationId, message, isActive }) => {
    return { success: true };
  },
  sendSocialMessage: async ({ conversationId, message }) => {
    try {
      const res = await apiClient.get('/social/conversations');
      const conversations = res.data;
      const conv = conversations.find(c => c.id === conversationId);
      const phone = conv ? conv.phone : conversationId.replace('conv_phone_', '');
      const sendRes = await apiClient.post('/social/messages/send', {
        phone: phone,
        text: message.text
      });
      return sendRes.data;
    } catch (e) {
      console.error('Failed to send social message:', e);
      throw e;
    }
  },
  getSettings: async () => {
    const res = await apiClient.get('/settings/company');
    return res.data;
  },
  updateSettings: async (data) => {
    const res = await apiClient.put('/settings/company', data);
    return res.data;
  },
  getServices: async () => {
    const res = await apiClient.get('/settings/services');
    return res.data;
  },
  updateServices: async (data) => {
    const res = await apiClient.put('/settings/services', data);
    return res.data;
  },
  getPackages: async () => {
    const res = await apiClient.get('/settings/packages');
    return res.data;
  },
  updatePackages: async (data) => {
    const res = await apiClient.put('/settings/packages', data);
    return res.data;
  },
  getEmailTemplates: async () => {
    const res = await apiClient.get('/settings/templates/email');
    return res.data;
  },
  updateEmailTemplates: async (data) => {
    const res = await apiClient.put('/settings/templates/email', data);
    return res.data;
  },
  getWhatsappTemplates: async () => {
    const res = await apiClient.get('/settings/templates/whatsapp');
    return res.data;
  },
  updateWhatsappTemplates: async (data) => {
    const res = await apiClient.put('/settings/templates/whatsapp', data);
    return res.data;
  },
  getCommissionRates: async () => {
    const res = await apiClient.get('/payments/commissions/rates');
    return res.data;
  },
  getCommissionsReport: async () => {
    const res = await apiClient.get('/payments/commissions/report');
    return res.data;
  },
  updateCommissionRate: async (agentId, type, value) => {
    const res = await apiClient.patch('/payments/commissions/rates', { agentId, type, value });
    return res.data;
  },
  getRefundRequests: async () => {
    const res = await apiClient.get('/payments/refunds');
    return res.data;
  },
  createRefundRequest: async (data) => {
    const res = await apiClient.post('/payments/refunds', data);
    return res.data;
  },
  updateRefundStatus: async (refundId, status, payoutMethod, transactionRef, adminNotes) => {
    const res = await apiClient.patch(`/payments/refunds/${refundId}/status`, { status, payoutMethod, transactionRef, adminNotes });
    return res.data;
  },
  getBackupLogs: async () => [],

  // ─── Notifications ───────────────────────────────────────────────────────
  getMyNotifications: async () => {
    const res = await apiClient.get('/notifications/my');
    return res.data;
  },
  getUnreadNotificationCount: async () => {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data; // { count: N }
  },
  markNotificationRead: async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },

  // ─── Communications ───────────────────────────────────────────────────
  getCommunications: async ({ clientId, leadId }) => {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (leadId) params.append('leadId', leadId);
    const res = await apiClient.get(`/communications?${params.toString()}`);
    return res.data;
  },
  createCommunicationLog: async (data) => {
    const res = await apiClient.post('/communications', data);
    return res.data;
  },

  // ─── Application Cycles (Resubmission & Appeal) ────────────────────────
  getApplicationCycles: async (clientId) => {
    const res = await apiClient.get(`/cases/cycles/${clientId}`);
    return res.data;
  },
  createApplicationCycle: async (data) => {
    const res = await apiClient.post('/cases/cycles', data);
    return res.data;
  },
  updateApplicationCycle: async (id, data) => {
    const res = await apiClient.patch(`/cases/cycles/${id}`, data);
    return res.data;
  },
};
