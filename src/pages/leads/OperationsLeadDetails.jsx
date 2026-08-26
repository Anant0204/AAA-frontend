import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

// Icons
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ChatIcon from '@mui/icons-material/Chat';
import QuickreplyIcon from '@mui/icons-material/Quickreply';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Components & Services
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import AppCard from '../../components/AppCard';
import Timeline from '../../components/Timeline';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../hooks/useAuth';
import { SERVICES, PACKAGES, getLeadStatusOptions } from '../../constants/mockData';
import LeadCommentsSection from '../../components/LeadCommentsSection';

export const OperationsLeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { isAdmin, isOperations, currentUser } = useAuth();
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: dbService.getConversations,
    refetchInterval: 3000 });

  const [aiResponderActive, setAiResponderActive] = useState(() => {
    return localStorage.getItem('crm-ai-responder-active') !== 'false';
  });

  const toggleAiResponder = () => {
    setAiResponderActive(prev => {
      const next = !prev;
      localStorage.setItem('crm-ai-responder-active', String(next));
      return next;
    });
  };

  const addConversationMutation = useMutation({
    mutationFn: dbService.addConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }) });

  const receiveSocialMessageMutation = useMutation({
    mutationFn: ({ conversationId, message, isActive }) => 
      dbService.receiveSocialMessage(conversationId, message, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }) });

  const sendSocialMessageMutation = useMutation({
    mutationFn: (payload) => dbService.sendSocialMessage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }) });

  const [activeTab, setActiveTab] = useState(0);
  const [noteText, setNoteText] = useState('');

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isCustomStatus, setIsCustomStatus] = useState(false);
  const [customStatus, setCustomStatus] = useState('');

  // Convert lead state
  const [selectedPackageId, setSelectedPackageId] = useState('full_process');
  const [applicantsCount, setApplicantsCount] = useState(1);

  // WhatsApp Quick Templates state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateMessage, setTemplateMessage] = useState('');
  const [sentMessages, setSentMessages] = useState([]);

  const { data: dbTemplates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: dbService.getTemplates
  });

  const formatTemplateText = (bodyText, leadObj) => {
    if (!bodyText) return '';
    let text = typeof bodyText === 'function' ? bodyText(leadObj) : String(bodyText);
    const firstName = leadObj?.firstName || leadObj?.name?.split(' ')[0] || '';
    const lastName = leadObj?.lastName || leadObj?.name?.split(' ')[1] || '';
    const fullName = `${firstName} ${lastName}`.trim() || leadObj?.name || '';
    const service = leadObj?.serviceType || leadObj?.serviceId || 'Visa Services';

    text = text.replace(/\{\{\s*name\s*\}\}/gi, fullName);
    text = text.replace(/\{\{\s*firstName\s*\}\}/gi, firstName);
    text = text.replace(/\{\{\s*lastName\s*\}\}/gi, lastName);
    text = text.replace(/\{\{\s*service\s*\}\}/gi, service);
    text = text.replace(/\{\{\s*serviceType\s*\}\}/gi, service);
    text = text.replace(/\{\{\s*phone\s*\}\}/gi, leadObj?.phone || '');
    text = text.replace(/\{\{\s*email\s*\}\}/gi, leadObj?.email || '');
    return text;
  };

  // Fetch Lead details
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => dbService.getLeadById(id) });

  // Fetch linked consultations, payments, documents
  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: dbService.getDocuments });

  // Fetch Consultants dynamically
  const { data: consultants = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status }) => dbService.updateLeadStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showAlert('Status updated successfully', 'success');
      setStatusModalOpen(false);
    } });

  const addNoteMutation = useMutation({
    mutationFn: (leadData) => dbService.updateLead(leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['caseTimeline'] });
      showAlert('Note added successfully', 'success');
      setNoteText('');
    } });

  const reassignConsultantMutation = useMutation({
    mutationFn: (consultantId) => dbService.assignConsultant(lead.id, consultantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showAlert('Consultant reassigned successfully', 'success');
    },
    onError: () => {
      showAlert('Error reassigning consultant', 'error');
    }
  });

  const isSwornTranslationLead = (lead?.serviceType || lead?.serviceId || '').toLowerCase().includes('translation') || (lead?.serviceType || lead?.serviceId || '').toLowerCase().includes('sworn');

  const convertLeadMutation = useMutation({
    mutationFn: async ({ lead, packageId, count }) => {
      // 1. Create client
      const client = await dbService.createClient({
        leadId: lead.id, // Explicit Link to Lead
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        nationality: lead.nationality,
        preferredLanguage: lead.preferredLanguage,
        serviceId: lead.serviceId,
        packageId,
        applicantsCount: count,
        assignedConsultantId: lead.assignedConsultantId || 'c1',
        status: 'Waiting for Payment',
        profileSummary: `${lead.firstName} migrated from Lead. Wants ${lead.serviceId} processing.` });

      // 2. Calculate Pricing & Generate Invoice
      const serviceObj = SERVICES.find((s) => s.id === lead.serviceId);
      const basePrice = serviceObj ? serviceObj.basePrice : 1500;

      let amount = basePrice;
      let discount = 0;

      if (packageId === 'premium') {
        // Add-on relocation assistance flat amount, e.g. €700
        amount = basePrice + 700;

        // Premium Discount: Main applicant €500. Dependents get €250 each.
        if (count >= 1) discount += 500; // Main applicant
        if (count > 1) {
          discount += (count - 1) * 250; // Dependents
        }
      }

      // 3. Generate Invoice
      await dbService.createInvoice({
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        serviceId: lead.serviceId,
        packageId,
        amount,
        discount,
        status: 'Pending' });

      // 4. Update Lead status to Completed
      await dbService.updateLeadStatus(lead.id, 'Completed');

      return client;
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      showAlert('Lead successfully converted to Client and Invoice generated!', 'success');
      setConvertModalOpen(false);
      navigate(`/clients/details/${client.id}`);
    } });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Lead not found</Typography>
        <Button startIcon={<KeyboardArrowLeftIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back to Lead List
        </Button>
      </Box>
    );
  }

  // Linked items
  const rawLeadConsultations = consultations.filter((c) => c.leadId === lead.id);
  const leadConsultations = rawLeadConsultations.length > 0 ? rawLeadConsultations : (
    lead?.meetingPreferredDate ? [{
      id: 'pref_' + lead.id,
      meetingDate: lead.meetingPreferredDate,
      meetingTime: lead.meetingPreferredTime || 'TBD',
      status: lead.assignedToId ? 'Scheduled' : 'Pending Assignment',
      consultantId: lead.assignedToId || null,
      isFallback: true
    }] : []
  );
  const consultationsWithRecordings = leadConsultations.filter(c => c.recordingUrl);
  const leadPayments = payments.filter((p) => p.clientId === lead.id); // for leads prior to conversion
  const leadDocuments = documents.filter((d) => d.clientId === lead.id);
  const consultantObj = consultants.find((c) => c.id === lead.assignedConsultantId);
  const serviceObj = SERVICES.find((s) => s.id === lead.serviceId);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const updatedLead = {
      ...lead,
      notes: lead.notes ? `${lead.notes}\n\n[${currentUser.name} - ${dayjs().format('DD/MM/YYYY HH:mm')}]: ${noteText}` : `[${currentUser.name} - ${dayjs().format('DD/MM/YYYY HH:mm')}]: ${noteText}`,
      timeline: [
        { date: new Date().toISOString(), event: 'Added a note to case file', user: currentUser.name },
        ...(Array.isArray(lead.timeline) ? lead.timeline : []),
      ] };
    addNoteMutation.mutate(updatedLead);
  };

  const handleOpenStatusModal = () => {
    setSelectedStatus(lead.status);
    setCustomStatus('');
    setIsCustomStatus(false);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = () => {
    const finalStatus = isCustomStatus ? customStatus.trim() : selectedStatus;
    if (isCustomStatus && !customStatus.trim()) {
      showAlert('Please enter a custom status name', 'warning');
      return;
    }
    updateStatusMutation.mutate({ leadId: lead.id, status: finalStatus });
  };

  const handleConvertLead = () => {
    setApplicantsCount(lead.applicantsCount || 1);
    setConvertModalOpen(true);
  };

  const handleConvertSubmit = () => {
    const isSchengen = lead.serviceId === 'tourism';
    convertLeadMutation.mutate({
      lead,
      packageId: isSchengen ? 'none' : selectedPackageId,
      count: isSchengen ? 1 : applicantsCount });
  };

  const handleSimulateClientMsg = () => {
    let existingConv = conversations.find(c => c.leadId === lead.id);
    let conversationId = existingConv ? existingConv.id : 'conv_' + Date.now();

    if (!existingConv) {
      const newConv = {
        id: conversationId,
        leadId: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        avatar: '',
        platform: 'whatsapp',
        unreadCount: 0,
        status: lead.status || 'New Lead',
        email: lead.email,
        phone: lead.phone,
        country: lead.nationality || 'Spain',
        preferredLanguage: lead.preferredLanguage || 'English',
        serviceId: lead.serviceId,
        messages: [
          {
            sender: 'system',
            text: `Conversation initialized with Lead ID: ${lead.id}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      addConversationMutation.mutate(newConv);
    }

    const defaultText = "Hi, when can we schedule our next meeting?";
    const customText = window.prompt("Simulate Client Msg: Enter message text from the client", defaultText);
    if (customText === null) return; // cancelled
    const textToSubmit = customText.trim() || defaultText;

    const customerMsg = {
      sender: 'customer',
      text: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    receiveSocialMessageMutation.mutate({
      conversationId,
      message: customerMsg,
      isActive: true
    });
    showAlert('Simulated client message received!', 'success');
  };

  const handleSendLiveReply = () => {
    if (!liveReplyText.trim()) return;
    let existingConv = conversations.find(c => c.leadId === lead.id);
    let conversationId = existingConv ? existingConv.id : 'conv_' + Date.now();

    if (!existingConv) {
      const newConv = {
        id: conversationId,
        leadId: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        avatar: '',
        platform: 'whatsapp',
        unreadCount: 0,
        status: lead.status || 'New Lead',
        email: lead.email,
        phone: lead.phone,
        country: lead.nationality || 'Spain',
        preferredLanguage: lead.preferredLanguage || 'English',
        serviceId: lead.serviceId,
        messages: [
          {
            sender: 'system',
            text: `Conversation initialized with Lead ID: ${lead.id}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      addConversationMutation.mutate(newConv);
    }

    const storeMsg = {
      sender: 'agent',
      text: liveReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    sendSocialMessageMutation.mutate({
      conversationId,
      phone: lead.phone,
      message: liveReplyText
    });
    setLiveReplyText('');
    showAlert('Message sent via WhatsApp!', 'success');
  };

  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages });

  const leadStatuses = getLeadStatusOptions(lead, leadStages);

  return (
    <Box>
      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Leads
      </Button>

      <PageHeader
        title={`${lead.firstName} ${lead.lastName}`}
        subtitle={`Customer ID: ${lead.clientCode || lead.clientId || lead.client?.clientCode || lead.displayId || lead.id} | Nationality: ${lead.nationality || '-'} | Country of Residence: ${lead.countryOfResidence || lead.country || '-'}`}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={handleOpenStatusModal}>
              Change Status
            </Button>
            
          </Stack>
        }
      />

      {/* Grid of basic information */}
      <Box className="grid grid-cols-12 gap-4" sx={{ mb: 3, alignItems: 'stretch' }}>
        <Box className="col-span-12 md:col-span-3">
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box>
              <Avatar
                sx={{ width: 72, height: 72, mx: 'auto', mb: 1.5, bgcolor: 'secondary.main', fontSize: '1.75rem', fontWeight: 600 }}
              >
                {lead.firstName[0]}
                {lead.lastName[0]}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {lead.firstName} {lead.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', wordBreak: 'break-all' }}>
                {lead.email}
              </Typography>
              <Chip
                label={`Customer ID: ${lead.clientCode || lead.clientId || lead.client?.clientCode || lead.displayId || 'CID-12001'}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 1, fontWeight: 700, fontSize: '11px' }}
              />
              <Box sx={{ mt: 0.5 }}>
                <StatusBadge status={lead.status} />
              </Box>
            </Box>

            <Box>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Assigned Agent
                  </Typography>
                  {(isAdmin || isOperations) ? (
                    <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                      <Select
                        value={lead.assignedConsultantId || ''}
                        onChange={(e) => {
                          const newId = e.target.value;
                          reassignConsultantMutation.mutate(newId);
                        }}
                        displayEmpty
                        sx={{ fontSize: '0.825rem', py: 0.2 }}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {consultants.filter(c => c.role === 'consultant').map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {consultantObj ? consultantObj.name : 'Unassigned'}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Target Service
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {serviceObj ? serviceObj.name : lead.serviceId}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Box className="col-span-12 md:col-span-9" sx={{ display: 'flex', flexDirection: 'column' }}>
          <AppCard noPadding sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newTab) => setActiveTab(newTab)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2.5, pt: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab value={0} label={isSwornTranslationLead ? "Documents & Lead Info" : "Overview"} sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
              {!isSwornTranslationLead && <Tab value={1} label="Meetings / Consultations" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />}
              {!isSwornTranslationLead && <Tab value={2} label="Payments & Invoices" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />}
              {!isSwornTranslationLead && <Tab value={3} label="Documents" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />}
              {!isSwornTranslationLead && <Tab value={4} label="Timeline" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />}
              <Tab value={5} icon={<WhatsAppIcon fontSize="small" />} iconPosition="start" label="Comms & Chat" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
              {!isSwornTranslationLead && <Tab value={6} label="Zoom Recordings" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />}
            </Tabs>

            <Box sx={{ p: 2.5, flex: 1 }}>
              {/* TAB 0: Overview & Qualifications */}
              {activeTab === 0 && (
                <Box className="grid grid-cols-12 gap-4">
                  {/* Sworn Translation Payment & Notification Tracking Card */}
                  {isSwornTranslationLead && (() => {
                    const isPaid = lead.status === 'Payment Completed' || lead.qualificationData?.paymentStatus === 'Paid' || lead.payment?.status === 'Paid';
                    const totalPaidAmount = lead.qualificationData?.totalPaid || lead.payment?.totalPaid || lead.qualificationData?.estimatedPrice || '0.00';
                    const paidDateStr = lead.qualificationData?.paidAt || lead.payment?.paidAt;
                    const paymentRef = lead.qualificationData?.paymentReference || lead.payment?.invoiceNumber || (lead.qualificationData?.stripeSessionId ? `TRN-${lead.qualificationData.stripeSessionId.slice(-8).toUpperCase()}` : '—');

                    const comms = Array.isArray(lead.communications) ? lead.communications : [];
                    const waComm = comms.find(c => c.externalProviderId?.startsWith('SWORN_TRN_PAYMENT_WA_') || (c.channel === 'WHATSAPP' && c.direction === 'OUTBOUND'));
                    const clientEmailComm = comms.find(c => c.externalProviderId?.startsWith('SWORN_TRN_PAYMENT_EMAIL_'));

                    return (
                      <Box className="col-span-12">
                        <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: isPaid ? '1px solid #10B981' : '1px solid #F59E0B', bgcolor: isPaid ? '#F0FDF4' : '#FFFBEB', mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: isPaid ? '#065F46' : '#92400E', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                💳 Payment & Notification Tracking
                              </Typography>
                              <Chip 
                                label={isPaid ? "Payment Completed" : "Payment Pending"} 
                                size="small" 
                                sx={{ fontWeight: 800, bgcolor: isPaid ? '#10B981' : '#F59E0B', color: '#FFFFFF' }} 
                              />
                            </Box>
                            {isPaid && (
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#047857' }}>
                                Amount Paid: €{Number(totalPaidAmount).toFixed(2)} EUR
                              </Typography>
                            )}
                          </Box>

                          <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Payment Reference</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', wordBreak: 'break-all' }}>{paymentRef}</Typography>
                                {paidDateStr && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    📅 {dayjs(paidDateStr).format('DD/MM/YYYY, hh:mm A')}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Client WhatsApp</Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                  <Chip 
                                    label={!isPaid ? "Pending Payment" : (waComm ? (waComm.deliveryStatus === 'SENT' ? "✓ Sent" : "Failed") : "✓ Sent")} 
                                    size="small" 
                                    color={!isPaid ? "default" : "success"}
                                    sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} 
                                  />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                  {lead.phone || 'No phone'}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Client Email Receipt</Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                  <Chip 
                                    label={!isPaid ? "Pending Payment" : (clientEmailComm ? (clientEmailComm.deliveryStatus === 'SENT' ? "✓ Sent" : "Failed") : "✓ Sent")} 
                                    size="small" 
                                    color={!isPaid ? "default" : "success"}
                                    sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} 
                                  />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', wordBreak: 'break-all' }}>
                                  {lead.email || 'No email'}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Super Admin Alert</Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                  <Chip 
                                    label={!isPaid ? "Pending Payment" : "✓ In-App & Email"} 
                                    size="small" 
                                    color={!isPaid ? "default" : "primary"}
                                    sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} 
                                  />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                  CRM Notification + Email
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    );
                  })()}

                  {/* Dedicated Uploaded Sworn Translation Documents Section */}
                  {isSwornTranslationLead && (() => {
                    const API_BASE = (import.meta.env.VITE_API_URL || 'https://aaa-consultancy-backend-production.up.railway.app/api/v1').replace('/api/v1', '').replace(/\/$/, '');
                    const rawDocs = Array.isArray(lead.qualificationData?.documents) && lead.qualificationData.documents.length > 0
                      ? lead.qualificationData.documents
                      : (Array.isArray(lead.documents) && lead.documents.length > 0
                          ? lead.documents
                          : [{
                              name: lead.qualificationData?.documentName || 'Translation_Document.pdf',
                              url: lead.qualificationData?.documentUrl,
                              size: lead.qualificationData?.documentSize || '0.10 MB',
                              category: lead.qualificationData?.category || 'General Document',
                              documentLanguage: lead.qualificationData?.sourceLanguage || lead.sourceLanguage || 'English',
                              targetLanguage: lead.qualificationData?.targetLanguage || lead.targetLanguage || 'Spanish',
                              wordCount: lead.wordCount || lead.qualificationData?.wordCount || 0,
                              subtotal: lead.qualificationData?.subtotal || 0,
                              vat: lead.qualificationData?.vat || 0,
                              estimatedPrice: lead.qualificationData?.estimatedPrice || '15.00'
                            }]);

                    const totalWords = Number(lead.wordCount || lead.qualificationData?.wordCount) || rawDocs.reduce((sum, d) => sum + (Number(d.wordCount) || 0), 0);
                    const totalEstimatedPrice = lead.qualificationData?.estimatedPrice || rawDocs.reduce((sum, d) => sum + (Number(d.estimatedPrice) || 0), 0).toFixed(2);
                    const totalSubtotal = lead.qualificationData?.subtotal || (Number(totalEstimatedPrice) / 1.05).toFixed(2);
                    const totalVat = lead.qualificationData?.vat || (Number(totalEstimatedPrice) - Number(totalSubtotal)).toFixed(2);

                    return (
                      <Box className="col-span-12">
                        <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: '1px solid #CBD5E1', bgcolor: '#F8FAFC', mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#1E293B', fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                              📄 Uploaded Sworn Translation Documents ({rawDocs.length} {rawDocs.length === 1 ? 'File' : 'Files'})
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label={`📊 ${totalWords} Total Words`} size="small" sx={{ fontWeight: 700, bgcolor: '#E0F2FE', color: '#0369A1' }} />
                              <Chip label={`💶 €${totalEstimatedPrice} Quoted Price`} size="small" sx={{ fontWeight: 700, bgcolor: '#D1FAE5', color: '#047857' }} />
                            </Stack>
                          </Box>

                          <Stack spacing={2}>
                            {rawDocs.map((doc, idx) => {
                              const docRawUrl = doc.url || (idx === 0 ? lead.qualificationData?.documentUrl : null);
                              const docFullUrl = docRawUrl ? (docRawUrl.startsWith('http') || docRawUrl.startsWith('data:') ? docRawUrl : `${API_BASE}${docRawUrl.startsWith('/') ? '' : '/'}${docRawUrl}`) : null;
                              const docName = doc.name || `Document_${idx + 1}.pdf`;
                              const docLang = doc.documentLanguage || doc.sourceLanguage || lead.sourceLanguage || 'English';
                              const docTargetLang = doc.targetLanguage || lead.targetLanguage || 'Spanish';
                              const docCategory = doc.category || 'Translation Document';
                              const docWords = Number(doc.wordCount) || 0;
                              const docPrice = doc.estimatedPrice ? `€${Number(doc.estimatedPrice).toFixed(2)}` : null;

                              return (
                                <Paper
                                  key={doc.id || `doc-${idx}`}
                                  variant="outlined"
                                  sx={{
                                    p: 2,
                                    borderRadius: 2.5,
                                    bgcolor: '#FFFFFF',
                                    borderColor: '#E2E8F0',
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'flex-start', md: 'center' },
                                    justifyContent: 'space-between',
                                    gap: 2
                                  }}
                                >
                                  {/* Doc Info Left */}
                                  <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: 'wrap' }}>
                                      <Chip label={`#${idx + 1} Document ${idx + 1}`} size="small" color="primary" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />
                                      <Chip label={docCategory} size="small" variant="outlined" sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
                                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                                        🌐 {docLang} ➔ {docTargetLang}
                                      </Typography>
                                    </Stack>
                                    
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      📑 {docName}
                                    </Typography>
                                    
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                                      Size: {doc.size || '0.10 MB'} • Word Count: <strong style={{ color: '#1E293B' }}>{docWords} words</strong>
                                      {docPrice && <> • Estimated: <strong style={{ color: '#059669' }}>{docPrice}</strong></>}
                                    </Typography>
                                  </Box>

                                  {/* Action Buttons Right */}
                                  <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}>
                                    {docFullUrl ? (
                                      <>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="primary"
                                          startIcon={<VisibilityIcon />}
                                          href={docFullUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ fontSize: '0.75rem', px: 1.75, py: 0.6, textTransform: 'none', fontWeight: 600 }}
                                        >
                                          View PDF
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          color="primary"
                                          startIcon={<DownloadIcon />}
                                          href={docFullUrl}
                                          download={docName}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ fontSize: '0.75rem', px: 1.75, py: 0.6, textTransform: 'none', fontWeight: 600 }}
                                        >
                                          Download PDF
                                        </Button>
                                      </>
                                    ) : (
                                      <Chip label="PDF file stored in quote session" size="small" variant="outlined" sx={{ fontSize: '0.75rem', color: '#64748B' }} />
                                    )}
                                  </Stack>
                                </Paper>
                              );
                            })}
                          </Stack>

                          {/* Bottom Summary Bar */}
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Official Ministry-Approved Sworn Translation (Traducción Jurada)
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                              Subtotal: €{totalSubtotal} + 5% VAT (€{totalVat}) = <span style={{ color: '#059669', fontSize: '1.05rem', fontWeight: 800 }}>€{totalEstimatedPrice}</span>
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    );
                  })()}

                  <Box className="col-span-12 md:col-span-6">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                      Personal & Contact Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{lead.phone}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Nationality</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{lead.nationality}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Country of Residence</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{lead.countryOfResidence || lead.country || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Preferred Communication Language</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{lead.preferredLanguage}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Applicants Included</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{lead.applicantsCount || 1} Person(s)</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="col-span-12 md:col-span-6">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                      Lead Qualification Data
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                      {lead.qualificationData ? (
                        Object.entries(lead.qualificationData)
                          .filter(([key]) => {
                            const hiddenKeys = [
                              'documentUrl',
                              'documents',
                              'documentName',
                              'documentSize',
                              'subtotal',
                              'vat',
                              'estimatedPrice',
                              'wordCount',
                              'sourceLanguage',
                              'targetLanguage',
                              'serviceType'
                            ];
                            if (isSwornTranslationLead && hiddenKeys.includes(key)) {
                              return false;
                            }
                            if (key.toLowerCase() === 'budget') return false;
                            return key !== 'documentUrl' && key !== 'documents';
                          })
                          .map(([key, value]) => {
                            let displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                            if ((key === 'paidAt' || key === 'uploadedAt' || key === 'createdAt' || key.endsWith('At') || key.endsWith('Date')) && value) {
                              displayValue = dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY  hh:mm A') : String(value);
                            }
                            return (
                              <Box key={key} sx={{ wordBreak: 'break-word' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                  {displayValue}
                                </Typography>
                              </Box>
                            );
                          })
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No initial qualification forms completed yet.
                        </Typography>
                      )}
                      {isSwornTranslationLead && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: '#ECFDF5', borderRadius: 2, border: '1px solid #A7F3D0' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#065F46', display: 'block', mb: 0.5 }}>
                            📜 Service Summary
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#047857' }}>
                            Spanish Sworn Translation ({lead.qualificationData?.documents?.length || 1} Document{(lead.qualificationData?.documents?.length || 1) > 1 ? 's' : ''})
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#065F46', display: 'block', mt: 0.25 }}>
                            Total Word Count: {lead.wordCount || lead.qualificationData?.wordCount || 0} • Status: {lead.status}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>




                  <Box className="col-span-12">
                    <Divider sx={{ my: 1.5 }} />
                    <LeadCommentsSection lead={lead} currentUser={currentUser} />
                  </Box>
                </Box>
              )}

              {/* TAB 1: Consultations */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Scheduled Meetings
                  </Typography>
                  {leadConsultations.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No meetings scheduled for this lead.
                      </Typography>
                      <Button variant="contained" size="small" onClick={() => navigate('/consultations/calendar')}>
                        Schedule Meeting
                      </Button>
                    </Box>
                  ) : (
                    leadConsultations.map((cons) => (
                      <Paper key={cons.id} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Box className="grid grid-cols-12 gap-2" alignItems="center">
                          <Box className="col-span-12 sm:col-span-4">
                            <Typography variant="subtitle2" color="text.secondary">Meeting Date/Time</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {(cons.meetingDate || cons.date) ? `${dayjs(cons.meetingDate || cons.date).format('DD/MM/YYYY')} at ${cons.meetingTime || cons.timeSlot || ''}` : 'Pending Lead Submission'}
                            </Typography>
                          </Box>
                          <Box className="col-span-12 sm:col-span-4">
                            <Typography variant="subtitle2" color="text.secondary">Meeting Status</Typography>
                            <StatusBadge status={cons.status} />
                          </Box>
                          <Box className="col-span-12 sm:col-span-4" sx={{ textAlign: 'right' }}>
                            <Button size="small" onClick={async () => {
                              if (cons.isFallback || (cons.id && String(cons.id).startsWith('pref_'))) {
                                try {
                                  const allCons = await dbService.getConsultations();
                                  const realCons = allCons.find(c => c.leadId === lead.id);
                                  if (realCons) {
                                    navigate(`/consultations/details/${realCons.id}`);
                                    return;
                                  }
                                } catch (e) {}
                              }
                              navigate(`/consultations/details/${cons.id}`);
                            }}>
                              View Meeting Details
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}

              {/* TAB 2: Payments */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Billing & Retainers
                  </Typography>
                  {leadPayments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      No payments associated with this lead. Conversion to Client will automatically generate retainer invoices.
                    </Typography>
                  ) : (
                    leadPayments.map((pay) => (
                      <Paper key={pay.id} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Box className="grid grid-cols-12 gap-2" alignItems="center">
                          <Box className="col-span-12 sm:col-span-3">
                            <Typography variant="subtitle2" color="text.secondary">Invoice ID</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{pay.id}</Typography>
                          </Box>
                          <Box className="col-span-12 sm:col-span-3">
                            <Typography variant="subtitle2" color="text.secondary">Due Amount</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>€{pay.amount - pay.discount}</Typography>
                          </Box>
                          <Box className="col-span-12 sm:col-span-3">
                            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                            <StatusBadge status={pay.status} />
                          </Box>
                          <Box className="col-span-12 sm:col-span-3" sx={{ textAlign: 'right' }}>
                            <Button size="small" onClick={() => navigate(`/payments/invoice-details/${pay.id}`)}>
                              View Invoice
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}

              {/* TAB 3: Documents */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Case Documents Center
                  </Typography>
                  {leadDocuments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      No documents uploaded yet. Document uploads become active after package retention payment is completed.
                    </Typography>
                  ) : (
                    leadDocuments.map((doc) => (
                      <Paper key={doc.id} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Box className="grid grid-cols-12 gap-2" alignItems="center">
                          <Box className="col-span-12 sm:col-span-4">
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{doc.fileName}</Typography>
                            <Typography variant="caption" color="text.secondary">{doc.category} | {doc.fileSize}</Typography>
                          </Box>
                          <Box className="col-span-12 sm:col-span-4">
                            <StatusBadge status={doc.status} />
                          </Box>
                          <Box className="col-span-12 sm:col-span-4" sx={{ textAlign: 'right' }}>
                            <Button size="small" onClick={() => navigate('/documents/review')}>
                              Review File
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}

              {/* TAB 4: Timeline */}
              {activeTab === 4 && <Timeline items={lead.timeline || []} />}

              {/* TAB 5: Communication Logs & Quick Templates */}
              {activeTab === 5 && (() => {
                const existingConv = conversations.find(c => c.leadId === lead.id);
                const messagesList = existingConv ? existingConv.messages : [];
                const isWindowOpen = existingConv ? Boolean(existingConv.isWindowOpen) : false;
                const remainingMinutes = existingConv ? (existingConv.remainingMinutes || 0) : 0;
                const windowExpiresAt = existingConv ? existingConv.windowExpiresAt : null;

                return (
                  <Box>
                    <Box className="grid grid-cols-12 gap-2">
                      {/* Left Side: Templates & Capture Data */}
                      <Box className="col-span-12 md:col-span-5">
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QuickreplyIcon color="secondary" />
                          Templates Dispatch
                        </Typography>
                        <Paper sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel id="wa-template-label">Select Template</InputLabel>
                            <Select
                              labelId="wa-template-label"
                              value={selectedTemplate}
                              label="Select Template"
                              onChange={(e) => {
                                const tmplId = e.target.value;
                                setSelectedTemplate(tmplId);
                                const tmpl = dbTemplates.find(t => t.id === tmplId || t.name === tmplId);
                                setTemplateMessage(tmpl ? formatTemplateText(tmpl.body, lead) : '');
                              }}
                            >
                              {dbTemplates.map((t) => (
                                <MenuItem key={t.id || t.name} value={t.id || t.name}>{t.name || t.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            value={templateMessage}
                            onChange={(e) => setTemplateMessage(e.target.value)}
                            placeholder="Select a template or type a custom template message..."
                            variant="outlined"
                            fullWidth
                            size="small"
                            multiline
                            rows={4}
                            sx={{ mb: 2 }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<WhatsAppIcon />}
                              disabled={!templateMessage.trim()}
                              onClick={() => {
                                if (!templateMessage.trim()) return;

                                // Find or create conversation in store
                                let conversationId = existingConv ? existingConv.id : 'conv_' + Date.now();

                                if (!existingConv) {
                                  const newConv = {
                                    id: conversationId,
                                    leadId: lead.id,
                                    name: `${lead.firstName} ${lead.lastName}`,
                                    avatar: '',
                                    platform: 'whatsapp',
                                    unreadCount: 0,
                                    status: lead.status || 'New Lead',
                                    email: lead.email,
                                    phone: lead.phone,
                                    country: lead.nationality || 'Spain',
                                    preferredLanguage: lead.preferredLanguage || 'English',
                                    serviceId: lead.serviceId,
                                    messages: [
                                      {
                                        sender: 'system',
                                        text: `Conversation initialized with Lead ID: ${lead.id}`,
                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                      }
                                    ]
                                  };
                                  addConversationMutation.mutate(newConv);
                                }

                                const storeMsg = {
                                  sender: 'agent',
                                  text: templateMessage,
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                };

                                sendSocialMessageMutation.mutate({
                                  conversationId,
                                  phone: lead.phone,
                                  message: templateMessage
                                });
                                setTemplateMessage('');
                                setSelectedTemplate('');
                                showAlert('WhatsApp message dispatched successfully!', 'success');
                              }}
                              fullWidth
                            >
                              Send via WhatsApp
                            </Button>
                          </Box>
                        </Paper>

                        {/* Intake captured data */}
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ChatIcon fontSize="small" color="primary" />
                          Intake captured dialogue
                        </Typography>
                        {lead.qualificationData ? (
                          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.neutral' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block', mb: 1 }}>
                              WhatsApp — Inbound (Intake form)
                            </Typography>
                            {Object.entries(lead.qualificationData)
                              .filter(([k, v]) => !['documents', 'documentUrl', 'stripeSessionId'].includes(k) && typeof v !== 'object')
                              .map(([k, v]) => (
                                <Typography key={k} variant="body2" sx={{ display: 'block', mb: 0.5 }}>
                                  <strong>{k.replace(/([A-Z])/g, ' $1').trim()}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </Typography>
                              ))}
                          </Paper>
                        ) : (
                          <Paper sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              No qualification data captured yet.
                            </Typography>
                          </Paper>
                        )}
                      </Box>

                      {/* Right Side: Live WhatsApp Chat Window */}
                      <Box className="col-span-12 md:col-span-7">
                        <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', height: '450px', overflow: 'hidden' }}>
                          {/* Live Chat Header */}
                          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WhatsAppIcon sx={{ color: '#25D366' }} />
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>WhatsApp: {lead.phone}</Typography>
                                <Typography variant="caption" color="text.secondary">Live Connection</Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isWindowOpen ? (
                                <Tooltip title={`24-Hour Customer WhatsApp Session Active. Window closes at ${windowExpiresAt ? new Date(windowExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '24h'}`}>
                                  <Chip
                                    label={`🟢 24h Window Active (${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m)`}
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                                  />
                                </Tooltip>
                              ) : (
                                <Tooltip title="Customer has not messaged in 24 hours. Plain text messages will not deliver to customer phone. Please send an approved Template message.">
                                  <Chip
                                    label="🔴 24h Window Closed (>24h)"
                                    color="error"
                                    size="small"
                                    sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>

                          {/* Live Chat Messages list */}
                          <Box sx={{ flexGrow: 1, p: 2.5, bgcolor: '#F8FAFC', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {messagesList.length === 0 ? (
                              <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary', p: 3 }}>
                                <ForumIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2">No active live chat logs found.</Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                  Send a template message to initialize the dialogue.
                                </Typography>
                              </Box>
                            ) : (
                              messagesList.map((msg, idx) => {
                                const isAgent = msg.sender === 'agent';
                                const isSystem = msg.sender === 'system';

                                if (isSystem) {
                                  return (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                                      <Paper elevation={0} sx={{ py: 0.25, px: 1.5, borderRadius: 2, bgcolor: '#FEF3C7', border: '1px dashed #F59E0B' }}>
                                        <Typography variant="caption" color="amber.800" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                          System: {msg.text}
                                        </Typography>
                                      </Paper>
                                    </Box>
                                  );
                                }

                                return (
                                  <Box
                                    key={idx}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: isAgent ? 'flex-end' : 'flex-start',
                                      width: '100%'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        maxWidth: '80%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isAgent ? 'flex-end' : 'flex-start'
                                      }}
                                    >
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 2.5,
                                          borderTopRightRadius: isAgent ? 0 : 10,
                                          borderTopLeftRadius: isAgent ? 10 : 0,
                                          bgcolor: isAgent ? '#D9FDD3' : '#FFFFFF',
                                          color: 'text.primary',
                                          boxShadow: '0px 1px 1px rgba(0,0,0,0.06)',
                                          border: isAgent ? 'none' : '1px solid',
                                          borderColor: isAgent ? 'none' : 'divider'
                                        }}
                                      >
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                                          {msg.text}
                                        </Typography>
                                      </Paper>
                                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, mx: 0.5, fontSize: '0.65rem' }}>
                                        {msg.timestamp}
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              })
                            )}
                          </Box>

                          {/* Live Chat Footer text inputs */}
                          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Type a manual WhatsApp reply..."
                                value={liveReplyText}
                                onChange={(e) => setLiveReplyText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleSendLiveReply();
                                }}
                                inputProps={{ style: { fontSize: '0.8rem' } }}
                              />
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={handleSendLiveReply}
                                disabled={!liveReplyText.trim()}
                                sx={{ minWidth: 60 }}
                              >
                                Send
                              </Button>
                            </Box>
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                  </Box>
                );
              })()}

              {activeTab === 6 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Zoom Meeting Recordings
                  </Typography>
                  {consultationsWithRecordings.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No Zoom recordings available yet.
                    </Typography>
                  ) : (
                    consultationsWithRecordings.map((cons) => (
                      <Paper
                        key={cons.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: 'none' }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {cons.type === 'eligibility' ? 'Eligibility Assessment' : 'Consultation Meeting'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Date: {cons.date || cons.meetingDate} at {cons.timeSlot || cons.meetingTime}
                          </Typography>
                        </Box>
                        <Box>
                          {(cons.recordingUrl.includes('.mp4') || cons.recordingUrl.includes('.webm')) ? (
                            <video src={cons.recordingUrl} controls style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }} />
                          ) : (
                            <Button variant="contained" color="primary" href={cons.recordingUrl} target="_blank">
                              Watch Recording on Zoom
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}
            </Box>
          </AppCard>
        </Box>
      </Box>

      {/* MODAL 1: Change Status */}
      <AppModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Lead Pipeline Status"
        actions={
          <>
            <Button onClick={() => setStatusModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleStatusSubmit}
              variant="contained"
              color="secondary"
              disabled={updateStatusMutation.isPending}
            >
              Update Status
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isCustomStatus ? (
            <FormControl fullWidth size="small">
              <InputLabel id="pipeline-status-label">Pipeline Status</InputLabel>
              <Select
                labelId="pipeline-status-label"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Pipeline Status"
              >
                {leadStatuses.map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Custom Pipeline Status *"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. In Review, Warm Follow-up"
            />
          )}

          <Button 
            size="small" 
            onClick={() => setIsCustomStatus(!isCustomStatus)}
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
          >
            {isCustomStatus ? "← Select from standard list" : "+ Create custom status name"}
          </Button>
        </Box>
      </AppModal>

      {/* MODAL 2: Convert to Client */}
      <AppModal
        open={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Lead to Client Portal"
        actions={
          <>
            <Button onClick={() => setConvertModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleConvertSubmit}
              variant="contained"
              color="secondary"
              disabled={convertLeadMutation.isPending}
            >
              Confirm & Onboard
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="body2">
            You are converting <strong>{lead.firstName} {lead.lastName}</strong> into a Client.
            This creates a profile, schedules local registration checklists, and generates initial billing invoice details.
          </Typography>

          {lead.serviceId === 'tourism' ? (
            <Box sx={{ p: 2.5, bgcolor: 'background.neutral', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="secondary.main" sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Schengen Tourist Visa Rule Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For Schengen Tourist Visa, no relocation packages are required. Onboarding this lead will directly generate an invoice for the base price of <strong>€400</strong>.
              </Typography>
            </Box>
          ) : (
            <>
              <FormControl fullWidth size="small">
                <InputLabel id="package-select-label">Select Relocation Package</InputLabel>
                <Select
                  labelId="package-select-label"
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  label="Select Relocation Package"
                >
                  {PACKAGES.map((pkg) => (
                    <MenuItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - {pkg.id === 'premium' ? 'Residency + Full Relocation Assistance' : 'Residency Processing Only'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                value={applicantsCount}
                onChange={(e) => setApplicantsCount(parseInt(e.target.value, 10))}
                label="Total Applicants (Main + Dependents)"
                type="number"
                inputProps={{ min: 1 }}
                fullWidth
                helperText={
                  selectedPackageId === 'premium'
                    ? 'Premium Package discount calculates €500 for Main applicant and €250 for each dependent automatically.'
                    : ''
                }
              />
            </>
          )}
        </Box>
      </AppModal>
    </Box>
  );
};

export default OperationsLeadDetails;
