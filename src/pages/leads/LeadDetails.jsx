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

// Icons
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ChatIcon from '@mui/icons-material/Chat';
import QuickreplyIcon from '@mui/icons-material/Quickreply';

// Components & Services
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import AppCard from '../../components/AppCard';
import Timeline from '../../components/Timeline';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../hooks/useAuth';
import { SERVICES, PACKAGES } from '../../constants/mockData';

export const LeadDetails = () => {
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
    mutationFn: ({ conversationId, message }) => 
      dbService.sendSocialMessage(conversationId, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }) });

  const [activeTab, setActiveTab] = useState(0);
  const [noteText, setNoteText] = useState('');

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Convert lead state
  const [selectedPackageId, setSelectedPackageId] = useState('full_process');
  const [applicantsCount, setApplicantsCount] = useState(1);

  // WhatsApp Quick Templates state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateMessage, setTemplateMessage] = useState('');
  const [sentMessages, setSentMessages] = useState([]);

  const WA_TEMPLATES = [
    {
      id: 'greeting',
      label: 'Initial Greeting',
      body: (lead) => `Hello ${lead?.firstName} 👋, I'm from AAA Business Consultancy. We received your inquiry regarding Spain ${lead?.serviceId || 'visa'} services. May we schedule a quick consultation call to understand your goals?` },
    {
      id: 'qualification_q1',
      label: 'Q1 - Income Qualification',
      body: (lead) => `Hi ${lead?.firstName} 👋! To assess your eligibility, could you share:\n• Your current monthly income (after tax)?\n• Is your income from remote work, business, or passive investments?\n• Your current country of residence?` },
    {
      id: 'qualification_q2',
      label: 'Q2 - Family & Dependents',
      body: (lead) => `Thank you ${lead?.firstName}! One more question:\n• Will you be applying with family members (spouse/children)?\n• How many total applicants?\n• Do you have an existing Spanish connection or assets?` },
    {
      id: 'booking_link',
      label: 'Book Consultation Link',
      body: (lead) => `Hi ${lead?.firstName}! You can book your FREE initial consultation directly here:\n👉 https://calendly.com/aaaconsultancy/assessment\n\nOur team is ready to guide your Spain residency journey. 🇪🇸` },
    {
      id: 'docs_reminder',
      label: 'Documents Checklist Reminder',
      body: (lead) => `Dear ${lead?.firstName}, this is a friendly reminder to prepare the following documents:\n📄 Valid Passport (6+ months validity)\n💰 3-Month Bank Statements\n📋 Employment / Income Proof\n🏠 Proof of Address\nPlease upload them through our secure portal as soon as possible.` },
    {
      id: 'follow_up',
      label: 'Follow-Up Nudge',
      body: (lead) => `Hi ${lead?.firstName} 👋! We wanted to follow up on your Spain visa inquiry. Our team has an opening this week for a consultation. Would you like to schedule a quick call to discuss your options?` },
  ];

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
  const leadConsultations = consultations.filter((c) => c.leadId === lead.id);
  const leadPayments = payments.filter((p) => p.clientId === lead.id); // for leads prior to conversion
  const leadDocuments = documents.filter((d) => d.clientId === lead.id);
  const consultantObj = consultants.find((c) => c.id === lead.assignedConsultantId);
  const serviceObj = SERVICES.find((s) => s.id === lead.serviceId);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const updatedLead = {
      ...lead,
      notes: lead.notes ? `${lead.notes}\n\n[${currentUser.name} - ${dayjs().format('YYYY-MM-DD HH:mm')}]: ${noteText}` : `[${currentUser.name} - ${dayjs().format('YYYY-MM-DD HH:mm')}]: ${noteText}`,
      timeline: [
        { date: new Date().toISOString(), event: 'Added a note to case file', user: currentUser.name },
        ...lead.timeline,
      ] };
    addNoteMutation.mutate(updatedLead);
  };

  const handleOpenStatusModal = () => {
    setSelectedStatus(lead.status);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = () => {
    updateStatusMutation.mutate({ leadId: lead.id, status: selectedStatus });
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

    sendSocialMessageMutation.mutate({ conversationId, message: storeMsg });
    setLiveReplyText('');
    showAlert('Message sent via WhatsApp!', 'success');
  };

  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages });

  const leadStatuses = leadStages.map(s => s.name);

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
        subtitle={`Lead ID: ${lead.id} | Nationality: ${lead.nationality}`}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={handleOpenStatusModal}>
              Change Status
            </Button>
            {lead.status !== 'Completed' && (isAdmin || isOperations) && (
              <Button variant="contained" color="secondary" onClick={handleConvertLead} startIcon={<CheckCircleIcon />}>
                Convert to Client
              </Button>
            )}
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
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', wordBreak: 'break-all' }}>
                {lead.email}
              </Typography>
              <StatusBadge status={lead.status} />
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
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Source
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {lead.source}
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
              <Tab label="Overview" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
              <Tab label="Meetings / Consultations" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
              <Tab label="Payments & Invoices" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
              <Tab label="Documents" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
              <Tab label="Timeline" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
              <Tab icon={<WhatsAppIcon fontSize="small" />} iconPosition="start" label="Comms & Chat" sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
            </Tabs>

            <Box sx={{ p: 2.5, flex: 1 }}>
              {/* TAB 0: Overview & Qualifications */}
              {activeTab === 0 && (
                <Box className="grid grid-cols-12 gap-4">
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
                        Object.entries(lead.qualificationData).map(([key, value]) => (
                          <Box key={key}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                              {key.replace(/([A-Z])/g, ' $1')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No initial WhatsApp qualification forms completed yet.
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box className="col-span-12">
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                      Case Notes File
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        minHeight: 100,
                        maxHeight: 250,
                        overflowY: 'auto',
                        backgroundColor: 'background.neutral',
                        mb: 1.5,
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.85rem' }}
                    >
                      {lead.notes || 'No notes logged on file yet.'}
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Log new case comment or details..."
                        variant="outlined"
                        fullWidth
                        size="small"
                      />
                      <Button variant="contained" onClick={handleAddNote} endIcon={<SendIcon />} sx={{ px: 3 }}>
                        Comment
                      </Button>
                    </Box>
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
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{cons.meetingDate} at {cons.meetingTime}</Typography>
                          </Box>
                          <Box className="col-span-12 sm:col-span-4">
                            <Typography variant="subtitle2" color="text.secondary">Meeting Status</Typography>
                            <StatusBadge status={cons.status} />
                          </Box>
                          <Box className="col-span-12 sm:col-span-4" sx={{ textAlign: 'right' }}>
                            <Button size="small" onClick={() => navigate(`/consultations/details/${cons.id}`)}>
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
                                const tmpl = WA_TEMPLATES.find(t => t.id === e.target.value);
                                setSelectedTemplate(e.target.value);
                                setTemplateMessage(tmpl ? tmpl.body(lead) : '');
                              }}
                            >
                              {WA_TEMPLATES.map((t) => (
                                <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
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

                                sendSocialMessageMutation.mutate({ conversationId, message: storeMsg });
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
                            {Object.entries(lead.qualificationData).map(([k, v]) => (
                              <Typography key={k} variant="body2" sx={{ display: 'block', mb: 0.5 }}>
                                <strong>{k.replace(/([A-Z])/g, ' $1').trim()}:</strong> {v}
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

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant={aiResponderActive ? "contained" : "outlined"}
                                color={aiResponderActive ? "secondary" : "inherit"}
                                startIcon={<QuickreplyIcon fontSize="inherit" />}
                                onClick={toggleAiResponder}
                                sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 'bold' }}
                              >
                                {aiResponderActive ? "AI Active" : "AI Inactive"}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={handleSimulateClientMsg}
                                sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 'bold' }}
                              >
                                Simulate Client Msg
                              </Button>
                            </Box>
                          </Box>

                          {/* Live Chat Messages list */}
                          <Box sx={{ flexGrow: 1, p: 2.5, bgcolor: '#F8FAFC', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {messagesList.length === 0 ? (
                              <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary', p: 3 }}>
                                <ForumIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2">No active live chat logs found.</Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                  Send a template or click "Simulate Client Msg" to initialize the dialogue.
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

export default LeadDetails;
