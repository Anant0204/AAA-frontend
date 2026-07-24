import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import Dialog from '@mui/material/Dialog';
import Autocomplete from '@mui/material/Autocomplete';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

// Services & Components
import PageHeader from '../../components/PageHeader';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../contexts/AlertContext';

const SPOKEN_LANGUAGES_OPTIONS = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Arabic', 'Chinese', 'Russian', 'Turkish', 
  'Dutch', 'Swedish', 'Polish', 'Romanian', 'Hindi', 'Urdu', 'Bengali', 'Albanian', 'Georgian', 'Ukrainian',
  'Catalan', 'Basque', 'Galician'
];

const NATIONALITIES_OPTIONS = [
  'Spanish', 'British', 'American', 'Canadian', 'French', 'German', 'Italian', 'Dutch', 'Mexican', 'Colombian', 
  'Argentinian', 'Ukrainian', 'Russian', 'Indian', 'Moroccan', 'Albanian', 'Georgian', 'Chinese', 'Turkish', 
  'South African', 'Australian', 'Venezuelan', 'Ecuadorian', 'Peruvian', 'Bolivian', 'Honduran'
];

const AVAILABLE_MENUS = [
  'Dashboard',
  'Agents',
  'Active Cases',
  'Doc Verification',
  'Finance',
  'Closed Cases',
  'Clients',
  'Leads',
  'Social Inbox',
  'Marketing',
  'Calendar',
  'All Agents Performance',
  'Integrations'
];

const AVAILABLE_CARDS = [
  'Total Clients',
  'Today\'s Clients',
  'Total Consultations',
  'Today\'s Consultations',
  'Upcoming Meetings',
  'Pending Payments',
  'Total Revenue',
  'Active Cases',
  'Completed Cases',
  'Lost Consultations',
  'Revenue Today',
  'Outstanding Revenue',
  'Refunded (50% Rejections)'
];

const ROLE_DEFAULTS = {
  admin: {
    menus: ['Dashboard', 'Agents', 'Active Cases', 'Doc Verification', 'Finance', 'Closed Cases', 'Clients', 'Leads', 'Social Inbox', 'Marketing', 'Calendar', 'All Agents Performance', 'Integrations'],
    cards: ['Total Clients', 'Today\'s Clients', 'Total Consultations', 'Today\'s Consultations', 'Upcoming Meetings', 'Pending Payments', 'Total Revenue', 'Active Cases', 'Completed Cases', 'Lost Consultations', 'Revenue Today', 'Outstanding Revenue', 'Refunded (50% Rejections)']
  },
  operations: {
    menus: ['Dashboard', 'Agents', 'Active Cases', 'Doc Verification', 'Closed Cases', 'Clients', 'Leads', 'Social Inbox', 'Marketing', 'Calendar', 'All Agents Performance'],
    cards: ['Total Clients', 'Today\'s Clients', 'Total Consultations', 'Today\'s Consultations', 'Upcoming Meetings', 'Active Cases', 'Completed Cases']
  },
  finance: {
    menus: ['Dashboard', 'Finance'],
    cards: ['Total Revenue', 'Pending Payments']
  },
  consultant: {
    menus: ['Dashboard', 'Clients', 'Leads', 'Social Inbox', 'Calendar'],
    cards: ['Upcoming Meetings', 'Active Cases']
  },
  marketing: {
    menus: ['Dashboard', 'Leads', 'Marketing'],
    cards: ['Total Consultations', 'Today\'s Consultations']
  }
};

export const AdminAgents = () => {
  const queryClient = useQueryClient();
  const { currentUser, isAdmin } = useAuth();
  const { showAlert } = useAlert();

  const [view, setView] = useState('list'); // 'list' or 'details'

  // State
  const [activeAgentId, setActiveAgentId] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openResetPasswordModal, setOpenResetPasswordModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(10);

  // Form Fields
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('consultant');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [languages, setLanguages] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [customPermissionsEnabled, setCustomPermissionsEnabled] = useState(false);
  const [customMenus, setCustomMenus] = useState([]);
  const [customCards, setCustomCards] = useState([]);

  useEffect(() => {
    if (customPermissionsEnabled && customMenus.length === 0 && customCards.length === 0) {
      const defaults = ROLE_DEFAULTS[role] || { menus: [], cards: [] };
      setCustomMenus(defaults.menus);
      setCustomCards(defaults.cards);
    }
  }, [customPermissionsEnabled, role]);

  const { data: allLeads = [] } = useQuery({ queryKey: ['leads'], queryFn: dbService.getLeads });
  const { data: allClients = [] } = useQuery({ queryKey: ['clients'], queryFn: dbService.getClients });
  const { data: allConsultations = [] } = useQuery({ queryKey: ['consultations'], queryFn: dbService.getConsultations });
  const { data: allPayments = [] } = useQuery({ queryKey: ['payments'], queryFn: dbService.getPayments });
  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });
  const { isViewOnlyMenu } = useAuth();
  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Agents');

  // Fetch Agents dynamically
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents });

  // Set first agent as active if none selected
  useEffect(() => {
    if (agents.length > 0 && !activeAgentId) {
      setActiveAgentId(agents[0].id);
    }
  }, [agents, activeAgentId]);

  // Mutations
  const createAgentMutation = useMutation({
    mutationFn: (agentData) => dbService.createAgent(agentData),
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showAlert('Agent registered successfully!', 'success');
      setOpenAddModal(false);
      resetForm();
      if (newAgent) {
        setActiveAgentId(newAgent.id);
      }
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Error registering agent.';
      showAlert(msg, 'error');
    }
  });

  const deleteAgentMutation = useMutation({
    mutationFn: (id) => dbService.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showAlert('Agent removed successfully.', 'success');
      setActiveAgentId(agents[0]?.id || null);
    },
    onError: () => showAlert('Error removing agent.', 'error') });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => dbService.resetAgentPassword(id, newPassword),
    onSuccess: () => {
      showAlert('Agent password reset successfully!', 'success');
      setOpenResetPasswordModal(false);
      setNewPassword('');
    },
    onError: () => showAlert('Error resetting password.', 'error') });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, newRole }) => dbService.updateAgentRole(id, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showAlert('Agent role updated successfully!', 'success');
    },
    onError: () => showAlert('Error updating role.', 'error') });

  const updateAgentMutation = useMutation({
    mutationFn: (agentData) => dbService.updateAgent(agentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showAlert('Agent profile updated successfully!', 'success');
      setOpenEditModal(false);
      resetForm();
    },
    onError: () => showAlert('Error updating agent profile.', 'error') });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRole('consultant');
    setAvatarBase64('');
    setLanguages([]);
    setNationalities([]);
    setBio('');
    setCommissionRate(10);
    setCustomPermissionsEnabled(false);
    setCustomMenus([]);
    setCustomCards([]);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setOpenAddModal(true);
  };

  const handleOpenEditModal = (agent) => {
    setSelectedAgent(agent);
    setName(agent.name || '');
    setEmail(agent.email || '');
    setPhone(agent.phone || '');
    setRole(agent.role || 'consultant');
    setAvatarBase64(agent.avatar || '');
    setLanguages(agent.languages || []);
    setNationalities(agent.nationalities || []);
    setBio(agent.bio || '');
    setCommissionRate(agent.commissionRate !== undefined ? agent.commissionRate : 10);
    setCustomPermissionsEnabled(agent.customPermissions?.enabled || false);
    setCustomMenus(agent.customPermissions?.menus || []);
    setCustomCards(agent.customPermissions?.cards || []);
    setOpenEditModal(true);
  };

  const handleOpenResetPasswordModal = (agent) => {
    setSelectedAgent(agent);
    setOpenResetPasswordModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Image must be less than 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatarBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || languages.length === 0) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }

    createAgentMutation.mutate({
      name,
      email,
      password,
      phone,
      role,
      avatar: avatarBase64,
      languages,
      nationalities,
      bio,
      commissionRate,
      customPermissions: {
        enabled: customPermissionsEnabled,
        menus: customMenus,
        cards: customCards
      }
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || languages.length === 0) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }

    updateAgentMutation.mutate({
      id: selectedAgent.id,
      name,
      email,
      phone,
      role,
      avatar: avatarBase64,
      languages,
      nationalities,
      bio,
      commissionRate,
      customPermissions: {
        enabled: customPermissionsEnabled,
        menus: customMenus,
        cards: customCards
      }
    });
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showAlert('Please enter a password.', 'warning');
      return;
    }
    resetPasswordMutation.mutate({ id: selectedAgent.id, newPassword });
  };

  const handleDeleteAgent = (id, name) => {
    if (window.confirm(`Are you sure you want to remove Agent ${name}?`)) {
      deleteAgentMutation.mutate(id);
    }
  };

  const activeAgent = agents.find((a) => a.id === activeAgentId);

  // Compute 13 KPIs for the active Agent
  const getAgentKPIs = (agent) => {
    if (!agent) return {};

    const agentConsultations = allConsultations.filter((c) => c.assignedConsultantId === agent.id);
    const agentClients = allClients.filter((cl) => cl.assignedConsultantId === agent.id);
    const agentLeads = allLeads.filter((ld) => ld.assignedConsultantId === agent.id);

    // Total Consultations
    const totalConsultations = agentConsultations.length;

    // Today's Consultations (Simulated/Mock checking date match with "2026-06-22" or active date)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayConsultations = agentConsultations.filter((c) => c.date && c.date.startsWith(todayStr)).length;

    // Upcoming Consultations
    const upcomingConsultations = agentConsultations.filter((c) => c.status === 'Scheduled').length;

    // Converted Clients and Payments
    const clientIds = agentClients.map((cl) => cl.id);
    const agentPayments = allPayments.filter((p) => clientIds.includes(p.clientId));

    // Pending Payments count
    const pendingPaymentsCount = agentPayments.filter((p) => p.status === 'Pending').length;

    // Total Revenue (Closed)
    const totalRevenueClosed = agentPayments
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Active Cases (still under process, visaStatus !== 'Approved' and status !== 'Completed')
    const activeCases = agentClients.filter(
      (cl) => cl.visaStatus !== 'Approved' && cl.status !== 'Completed'
    ).length;

    // Closed Cases
    const closedCases = agentClients.filter(
      (cl) => cl.visaStatus === 'Approved' || cl.status === 'Completed'
    ).length;

    // Client No-Show / Cancelled
    const clientNoShowCancelled = agentConsultations.filter(
      (c) => c.status === 'No-Show' || c.status === 'Cancelled'
    ).length;

    // Agent No-Show (simulated data check or fallback mock logic)
    const agentNoShow = agentConsultations.filter((c) => c.noShow === 'agent').length || 0;

    // Agent Cancelled Meetings (simulated data check or fallback mock logic)
    const agentCancelled = agentConsultations.filter((c) => c.cancelledBy === 'agent').length || 0;

    // Agent Leads (from card scans / references)
    const agentLeadsCount = agentLeads.length;

    // Agent Performance % = (Closed Cases ÷ Total Consultations) × 100
    const performancePercent =
      totalConsultations > 0 ? Math.round((closedCases / totalConsultations) * 100) : 0;

    // Agent Commission (dynamic rate from agent.commissionRate or fallback to 10)
    const rate = agent.commissionRate !== undefined ? agent.commissionRate : 10;
    const commissionAmount = Math.round(totalRevenueClosed * (rate / 100));

    return {
      totalConsultations,
      todayConsultations,
      upcomingConsultations,
      pendingPaymentsCount,
      totalRevenueClosed,
      activeCases,
      closedCases,
      clientNoShowCancelled,
      agentNoShow,
      agentCancelled,
      agentLeadsCount,
      performancePercent,
      commissionAmount };
  };

  const kpis = getAgentKPIs(activeAgent);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Agents Management"
        subtitle="Manage agent accounts, review key performance metrics, commissions, and access privileges."
        action={
          !isViewOnly && isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{ borderRadius: 2.5, fontWeight: 700 }}
            >
              Add New Team/Agent
            </Button>
          )
        }
      />

      <Box className="grid grid-cols-12 gap-2" sx={{ flexGrow: 1, minHeight: 0, width: '100%' }}>
        {/* Left Side: Agent List Panel */}
        {view === 'list' && (
          <Box className="col-span-12" sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                overflow: 'hidden' }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Agents Directory
                </Typography>
              </Box>

              <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                {agents.map((agent) => (
                  <ListItemButton
                    key={agent.id}
                    selected={activeAgentId === agent.id}
                    onClick={() => {
                      setActiveAgentId(agent.id);
                      setView('details');
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(10, 37, 64, 0.05)', // Soft Dark Navy hover
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(10, 37, 64, 0.1)', // Selected soft Dark Navy background
                        '&:hover': { bgcolor: 'rgba(10, 37, 64, 0.12)' },
                        '& .MuiTypography-root': {
                          color: '#0A2540 !important' } } }}
                  >
                    <ListItemAvatar>
                      <Avatar src={agent.avatar} alt={agent.name} />
                    </ListItemAvatar>
                    <ListItemText
                      slotProps={{
                        primary: { component: 'div' },
                        secondary: { component: 'div' }
                      }}
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {agent.name}
                          </Typography>
                          <Chip
                            label={
                              agent.role === 'admin'
                                ? 'Admin'
                                : agent.role === 'operations'
                                  ? 'Operations'
                                  : agent.role === 'finance'
                                    ? 'Finance'
                                    : agent.role === 'marketing'
                                      ? 'Marketing'
                                      : 'Agent'
                            }
                            size="small"
                            color={
                              agent.role === 'admin'
                                ? 'primary'
                                : agent.role === 'operations'
                                  ? 'info'
                                  : agent.role === 'finance'
                                    ? 'warning'
                                    : agent.role === 'marketing'
                                      ? 'success'
                                      : 'secondary'
                            }
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {agent.email}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* Right Side: Active Agent Dashboard Pane */}
        {view === 'details' && (
          <Box className="col-span-12" sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {activeAgent ? (
              <Paper
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  overflowY: 'auto',
                  p: 3,
                  position: 'relative'
                }}
              >
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setView('list')}
                  sx={{ alignSelf: 'flex-start', mb: 2, fontWeight: 700 }}
                  variant="outlined"
                  size="small"
                  color="secondary"
                >
                  Back to Directory
                </Button>
                {/* Header Info */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar src={activeAgent.avatar} sx={{ width: 70, height: 70 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {activeAgent.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activeAgent.email} | {activeAgent.phone}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {activeAgent.languages?.map((l) => (
                          <Chip key={l} label={l} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {!isViewOnly && isAdmin && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditModal(activeAgent)}
                        sx={{ borderRadius: 2 }}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<LockResetIcon />}
                        onClick={() => handleOpenResetPasswordModal(activeAgent)}
                        sx={{ borderRadius: 2 }}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteAgent(activeAgent.id, activeAgent.name)}
                        sx={{ borderRadius: 2 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* 13 KPI Boxes Grid */}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                  Agent Performance Metrics Dashboard
                </Typography>

                <Box className="grid grid-cols-12 gap-2" sx={{ mb: 3 }}>
                  {/* 1. Total Consultations */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Total Consultations</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.totalConsultations}</Typography>
                    </Paper>
                  </Box>

                  {/* 2. Today's Consultations */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Today's Consultations</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.todayConsultations}</Typography>
                    </Paper>
                  </Box>

                  {/* 3. Upcoming Consultations */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Upcoming Consultations</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.upcomingConsultations}</Typography>
                    </Paper>
                  </Box>

                  {/* 4. Pending Payments */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Pending Payments</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>{kpis.pendingPaymentsCount}</Typography>
                    </Paper>
                  </Box>

                  {/* 5. Total Revenue (Closed) */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Total Revenue</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>€{kpis.totalRevenueClosed.toLocaleString()}</Typography>
                    </Paper>
                  </Box>

                  {/* 6. Active Cases */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Active Cases</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.activeCases}</Typography>
                    </Paper>
                  </Box>

                  {/* 7. Closed Cases */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Closed Cases</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.closedCases}</Typography>
                    </Paper>
                  </Box>

                  {/* 8. Client No-Show / Cancelled */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Client No-Show / Canceled</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.clientNoShowCancelled}</Typography>
                    </Paper>
                  </Box>

                  {/* 9. Agent No-Show */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Agent No-Show</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>{kpis.agentNoShow}</Typography>
                    </Paper>
                  </Box>

                  {/* 10. Agent Cancelled Meetings */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Agent Cancelled Meetings</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>{kpis.agentCancelled}</Typography>
                    </Paper>
                  </Box>

                  {/* 11. Agent Leads */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Tooltip title="This displays lead entries initialized from digital QR business card scans for this agent reference. Note: Leads are only assigned to agent list once a consultation is booked." placement="top">
                      <Paper sx={{ p: 2, border: '1px dashed', borderColor: 'primary.main', bgcolor: 'primary.neutral', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'help', position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: 5, right: 5, color: 'primary.main', display: 'flex' }}><InfoIcon sx={{ fontSize: '0.85rem' }} /></Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Agent Leads</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.agentLeadsCount}</Typography>
                      </Paper>
                    </Tooltip>
                  </Box>

                  {/* 12. Agent Performance % */}
                  <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                    <Paper sx={{ p: 2, border: '2px solid', borderColor: 'secondary.main', bgcolor: 'secondary.neutral', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700, display: 'block' }}>Agent Performance</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.performancePercent}%</Typography>
                    </Paper>
                  </Box>
                </Box>

                {/* 13. Commission Box */}
                <Paper sx={{ p: 3, bgcolor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="amber.900" sx={{ fontWeight: 800 }}>Agent Commission Earned ({activeAgent.commissionRate !== undefined ? activeAgent.commissionRate : 10}%)</Typography>
                    <Typography variant="caption" color="amber.850">Calculated automatically on paid invoice totals closed by this agent.</Typography>
                  </Box>
                  <Typography variant="h4" color="amber.900" sx={{ fontWeight: 900 }}>€{kpis.commissionAmount.toLocaleString()}</Typography>
                </Paper>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Biography</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{activeAgent.bio || 'No biography recorded for this agent.'}</Typography>
              </Paper>
            ) : (
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3, p: 3, position: 'relative' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setView('list')}
                  sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 700 }}
                  variant="outlined"
                  size="small"
                  color="secondary"
                >
                  Back to Directory
                </Button>
                <Typography color="text.secondary">No agent accounts active.</Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>

      {/* MODAL: Add New Agent */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Register Team / Agent Account</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar src={avatarBase64} sx={{ width: 90, height: 90, mb: 1, border: '1px dashed', borderColor: 'divider' }} />
            <Button variant="outlined" component="label" size="small" startIcon={<PhotoCamera />} sx={{ borderRadius: 2 }}>
              Upload Photo
              <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
            </Button>
          </Box>
          <TextField label="Full Name *" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          <TextField label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
          <TextField label="Password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required helperText="Provide credentials for the agent login." />
          <TextField label="Hotline Number *" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth required />
          <TextField
            select
            label="User Role *"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            required
            helperText="Assign the system role determining permissions and sidebar access."
          >
            {customizationSettings?.rolesDefinition?.map(r => (
              <MenuItem key={r.id} value={r.id}>{r.label.split('(')[0].trim()}</MenuItem>
            ))}
          </TextField>
          <Autocomplete
            multiple
            options={SPOKEN_LANGUAGES_OPTIONS}
            value={languages}
            onChange={(event, newValue) => setLanguages(newValue)}
            renderInput={(params) => <TextField {...params} label="Spoken Languages *" placeholder="Select languages" required />}
            fullWidth
          />
          <Autocomplete
            multiple
            options={NATIONALITIES_OPTIONS}
            value={nationalities}
            onChange={(event, newValue) => setNationalities(newValue)}
            renderInput={(params) => <TextField {...params} label="Nationalities" placeholder="Select nationalities" />}
            fullWidth
          />
          <TextField
            label="Commission Rate (%)"
            type="number"
            value={commissionRate}
            onChange={(e) => setCommissionRate(Math.max(0, Math.min(100, Number(e.target.value))))}
            fullWidth
            required
            helperText="Specify the commission percentage of total closed revenue (e.g. 10)."
          />
          <TextField label="Immigration Bio Description" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} fullWidth />
          

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={createAgentMutation.isPending}>Register Agent</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Edit Agent */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Agent Profile</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar src={avatarBase64} sx={{ width: 90, height: 90, mb: 1, border: '1px dashed', borderColor: 'divider' }} />
            <Button variant="outlined" component="label" size="small" startIcon={<PhotoCamera />} sx={{ borderRadius: 2 }}>
              Upload Photo
              <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
            </Button>
          </Box>
          <TextField label="Full Name *" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          <TextField label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
          <TextField label="Hotline Number *" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth required />
          <TextField
            select
            label="User Role *"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            required
            helperText="Update the user system role determining permissions and sidebar access."
          >
            {customizationSettings?.rolesDefinition?.map(r => (
              <MenuItem key={r.id} value={r.id}>{r.label.split('(')[0].trim()}</MenuItem>
            ))}
          </TextField>
          <Autocomplete
            multiple
            options={SPOKEN_LANGUAGES_OPTIONS}
            value={languages}
            onChange={(event, newValue) => setLanguages(newValue)}
            renderInput={(params) => <TextField {...params} label="Spoken Languages *" placeholder="Select languages" required />}
            fullWidth
          />
          <Autocomplete
            multiple
            options={NATIONALITIES_OPTIONS}
            value={nationalities}
            onChange={(event, newValue) => setNationalities(newValue)}
            renderInput={(params) => <TextField {...params} label="Nationalities" placeholder="Select nationalities" />}
            fullWidth
          />
          <TextField
            label="Commission Rate (%) *"
            type="number"
            value={commissionRate}
            onChange={(e) => setCommissionRate(Math.max(0, Math.min(100, Number(e.target.value))))}
            fullWidth
            required
          />
          <TextField label="Immigration Bio Description" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} fullWidth />
          

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="secondary" disabled={updateAgentMutation.isPending}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Reset Password Override */}
      <Dialog open={openResetPasswordModal} onClose={() => setOpenResetPasswordModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Password Override</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide a new password for Agent <strong>{selectedAgent?.name}</strong>. They will be required to log in with these new credentials.
          </Typography>
          <TextField
            label="New Account Password *"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenResetPasswordModal(false)}>Cancel</Button>
          <Button onClick={handleResetPasswordSubmit} variant="contained" color="secondary" disabled={resetPasswordMutation.isPending}>Reset Password</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAgents;
