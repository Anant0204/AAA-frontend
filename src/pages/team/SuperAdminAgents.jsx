import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
import Badge from '@mui/material/Badge';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CloseIcon from '@mui/icons-material/Close';

// Services & Components
import PageHeader from '../../components/PageHeader';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../contexts/AlertContext';
import { SERVICES } from '../../constants/mockData';

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

export const SuperAdminAgents = () => {
  const queryClient = useQueryClient();
  const { currentUser, isAdmin, isSuperAdmin, refreshUser } = useAuth();
  const { showAlert } = useAlert();

  const [view, setView] = useState('list'); // 'list' or 'details'

  // State
  const [activeAgentId, setActiveAgentId] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openResetPasswordModal, setOpenResetPasswordModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(10);
  const [timeRange, setTimeRange] = useState('All Time');
  const [customDays, setCustomDays] = useState(14);
  const [activeTab, setActiveTab] = useState(0);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  // KPI Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);
  const [modalType, setModalType] = useState('');

  // Commission History Dialog State
  const [commHistoryOpen, setCommHistoryOpen] = useState(false);
  const [commHistoryAgentId, setCommHistoryAgentId] = useState(null);

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
  const [customCanManageOverrides, setCustomCanManageOverrides] = useState(false);

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
  const { data: commissionHistory = [], isLoading: loadingCommHistory } = useQuery({
    queryKey: ['commission-history', commHistoryAgentId],
    queryFn: () => dbService.getCommissionHistory(commHistoryAgentId),
    enabled: !!commHistoryAgentId
  });
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
    onSuccess: (updatedAgent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      // If the updated agent is the currently logged-in user, sync their session immediately
      // Only sync session if the SuperAdmin edited THEIR OWN profile, not another agent's
      if (updatedAgent && refreshUser && updatedAgent.id === currentUser?.id) refreshUser(updatedAgent);
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
    setCustomCanManageOverrides(false);
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
    setCustomCanManageOverrides(agent.customPermissions?.canManageOverrides || false);
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
        cards: customCards,
        canManageOverrides: customCanManageOverrides
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
        cards: customCards,
        canManageOverrides: customCanManageOverrides
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

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getPeriodRange = (rangeType, customDaysVal = 14) => {
    const today = new Date();
    let start, end;

    if (rangeType === 'Last 7 Days') {
      end = new Date(today);
      start = new Date(today);
      start.setDate(today.getDate() - 6);
    } else if (rangeType === 'Last 30 Days') {
      end = new Date(today);
      start = new Date(today);
      start.setDate(today.getDate() - 29);
    } else if (rangeType === 'Custom Days') {
      end = new Date(today);
      start = new Date(today);
      start.setDate(today.getDate() - (customDaysVal - 1));
    } else if (rangeType === 'This Year') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    } else {
      // All Time
      start = new Date(2000, 0, 1);
      end = new Date(2100, 0, 1);
    }

    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  };

  // Compute KPIs for the active Agent (supporting date-range filters)
  const getAgentKPIs = (agent, rangeType = 'All Time', customDaysVal = 14) => {
    if (!agent) return {};

    const { start, end } = getPeriodRange(rangeType, customDaysVal);

    const rawConsultations = allConsultations.filter((c) => c.assignedConsultantId === agent.id);
    const rawClients = allClients.filter((cl) => cl.assignedConsultantId === agent.id);
    const rawLeads = allLeads.filter((ld) => ld.assignedConsultantId === agent.id);

    const agentConsultations = rawConsultations.filter(
      (c) => rangeType === 'All Time' || (c.meetingDate >= start && c.meetingDate <= end)
    );
    const agentClients = rawClients.filter(
      (cl) => rangeType === 'All Time' || (cl.onboardingDate >= start && cl.onboardingDate <= end)
    );
    const agentLeads = rawLeads.filter(
      (ld) => rangeType === 'All Time' || (ld.date >= start && ld.date <= end)
    );

    // Total Consultations
    const totalConsultations = agentConsultations.length;

    // Today's Consultations
    const today = new Date();
    const todayDateStr = formatDate(today);
    const todayConsultations = rawConsultations.filter((c) => c.meetingDate === todayDateStr).length;

    // Upcoming Consultations
    const upcomingConsultations = agentConsultations.filter((c) => c.status === 'Scheduled').length;

    // Converted Clients and Payments
    const clientIds = agentClients.map((cl) => cl.id);
    const agentPayments = allPayments.filter(
      (p) => clientIds.includes(p.clientId) && (rangeType === 'All Time' || ((p.paymentDate || p.dueDate) >= start && (p.paymentDate || p.dueDate) <= end))
    );

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

    // Conversion Rate (%) = (Closed Cases ÷ Total Consultations) × 100
    const conversionRate =
      totalConsultations > 0 ? Math.round((closedCases / totalConsultations) * 100) : 0;

    // Agent Commission (dynamic rate from agent.commissionRate or fallback to 10)
    const rate = agent.commissionRate !== undefined ? agent.commissionRate : 10;
    
    // Monthly Agent Commission
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyRevenue = allPayments.filter(p => clientIds.includes(p.clientId))
      .filter((p) => p.status === 'Paid' && (p.paymentDate || p.dueDate)?.startsWith(currentMonthStr))
      .reduce((sum, p) => sum + (p.totalPaid || 0), 0);
    const monthlyCommission = Math.round(monthlyRevenue * (rate / 100));

    // Total Commission since joining
    const totalCommissionSinceJoining = Math.round(totalRevenueClosed * (rate / 100));

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
      conversionRate,
      monthlyCommission,
      totalCommissionSinceJoining };
  };

  const getAgentHistory = (agent) => {
    if (!agent) return [];
    
    const list = [];
    
    // 1. Join event
    list.push({
      id: 'join',
      date: agent.createdAt ? agent.createdAt.split('T')[0] : formatDate(new Date()),
      title: 'Joined AAA Consultancy Team',
      description: 'Account registered as Spain Immigration Consultant.',
      type: 'system',
      icon: 'person'
    });
    
    // 2. Assigned Leads
    const agentLeads = allLeads.filter(ld => ld.assignedConsultantId === agent.id);
    agentLeads.forEach(ld => {
      list.push({
        id: `ld_assign_${ld.id}`,
        date: ld.assignedAt ? ld.assignedAt.split('T')[0] : (ld.createdDate ? ld.createdDate.split('T')[0] : formatDate(new Date())),
        title: `Lead Task Assigned: ${ld.firstName || ''} ${ld.lastName || ''}`,
        description: `Service: ${ld.serviceId || 'Visa'} | Assigned Date: ${ld.assignedAt ? formatDate(new Date(ld.assignedAt)) : formatDate(new Date(ld.createdDate || Date.now()))} | Status: ${ld.status}`,
        type: 'consultation',
        icon: 'meeting'
      });
    });

    // 3. Consultations
    const agentConsultations = allConsultations.filter(c => c.assignedConsultantId === agent.id);
    agentConsultations.forEach(c => {
      list.push({
        id: `c_${c.id}`,
        date: c.assignedAt ? c.assignedAt.split('T')[0] : (c.meetingDate || formatDate(new Date())),
        title: `Consultation Session Assigned: ${c.clientName || 'Client'}`,
        description: `Slot: ${c.meetingDate || ''} ${c.meetingTime || ''} | Assigned Date: ${c.assignedAt ? formatDate(new Date(c.assignedAt)) : 'N/A'} | Status: ${c.status}`,
        type: 'consultation',
        icon: 'meeting'
      });
    });
    
    // 4. Client Cases
    const agentClients = allClients.filter(cl => cl.assignedConsultantId === agent.id);
    agentClients.forEach(cl => {
      list.push({
        id: `cl_open_${cl.id}`,
        date: cl.assignedAt ? cl.assignedAt.split('T')[0] : (cl.onboardingDate ? cl.onboardingDate.split('T')[0] : formatDate(new Date())),
        title: `Case File Assigned: ${cl.firstName} ${cl.lastName}`,
        description: `Client ID: ${cl.clientCode || cl.id} | Assigned Date: ${cl.assignedAt ? formatDate(new Date(cl.assignedAt)) : formatDate(new Date(cl.onboardingDate || Date.now()))} | Status: ${cl.status}`,
        type: 'case',
        icon: 'case'
      });
      
      if (cl.status === 'Completed' || cl.visaStatus === 'Approved') {
        list.push({
          id: `cl_close_${cl.id}`,
          date: cl.completionDate || cl.onboardingDate || formatDate(new Date()),
          title: `Visa Approved: ${cl.firstName} ${cl.lastName}`,
          description: `Spain Visa application successfully approved and case file closed.`,
          type: 'case',
          icon: 'check'
        });
      }
    });
    
    // 4. Payments
    const clientIds = agentClients.map(cl => cl.id);
    const agentPayments = allPayments.filter(p => clientIds.includes(p.clientId));
    agentPayments.forEach(p => {
      list.push({
        id: `pay_${p.id}`,
        date: p.paymentDate || p.dueDate || formatDate(new Date()),
        title: p.status === 'Paid' ? `Invoice Paid: €${p.amount - (p.discount || 0)}` : `Invoice Issued (Pending): €${p.amount - (p.discount || 0)}`,
        description: `Invoice: ${p.id} | Method: ${p.paymentMethod || 'Credit Card'} | Status: ${p.status} | Agent Commission (10%): €${Math.round((p.amount - (p.discount || 0)) * 0.1)}`,
        type: 'payment',
        icon: 'payment'
      });
    });
    
    return list.sort((a, b) => b.date.localeCompare(a.date));
  };

  const kpis = getAgentKPIs(activeAgent, timeRange, customDays);

  const handleKPIBoxClick = (kpiName) => {
    if (!activeAgent) return;
    const { start, end } = getPeriodRange(timeRange, customDays);

    const rawConsultations = allConsultations.filter((c) => c.assignedConsultantId === activeAgent.id);
    const rawClients = allClients.filter((cl) => cl.assignedConsultantId === activeAgent.id);
    const rawLeads = allLeads.filter((ld) => ld.assignedConsultantId === activeAgent.id);
    
    const agentConsultations = rawConsultations.filter(
      (c) => timeRange === 'All Time' || (c.meetingDate >= start && c.meetingDate <= end)
    );
    const agentClients = rawClients.filter(
      (cl) => timeRange === 'All Time' || (cl.onboardingDate >= start && cl.onboardingDate <= end)
    );
    const agentLeads = rawLeads.filter(
      (ld) => timeRange === 'All Time' || (ld.date >= start && ld.date <= end)
    );

    const agentClientIds = agentClients.map((c) => c.id);
    const agentPayments = allPayments.filter(
      (p) => agentClientIds.includes(p.clientId) && (timeRange === 'All Time' || ((p.paymentDate || p.dueDate) >= start && (p.paymentDate || p.dueDate) <= end))
    );
    const todayDateStr = '2026-06-18';

    let data = [];
    let type = '';
    let title = '';

    if (kpiName === 'Total Consultations') {
      title = `${activeAgent.name}'s Total Consultations`;
      data = agentConsultations;
      type = 'consultation';
    } else if (kpiName === "Today's Consultations") {
      title = `${activeAgent.name}'s Today's Consultations`;
      data = agentConsultations.filter(c => c.meetingDate === todayDateStr);
      type = 'consultation';
    } else if (kpiName === 'Upcoming Consultations') {
      title = `${activeAgent.name}'s Upcoming Consultations`;
      data = agentConsultations.filter(c => c.status === 'Scheduled');
      type = 'consultation';
    } else if (kpiName === 'Active Cases') {
      title = `${activeAgent.name}'s Active Cases`;
      data = agentClients.filter(cl => cl.status === 'Under Process');
      type = 'client';
    } else if (kpiName === 'Closed Cases') {
      title = `${activeAgent.name}'s Closed Cases`;
      data = agentClients.filter(cl => cl.status === 'Completed');
      type = 'client';
    } else if (kpiName === 'Pending Payments') {
      title = `${activeAgent.name}'s Pending Invoices`;
      data = agentPayments.filter(p => p.status === 'Pending');
      type = 'payment';
    } else if (kpiName === 'Total Revenue') {
      title = `${activeAgent.name}'s Closed Revenue Payments`;
      data = agentPayments.filter(p => p.status === 'Paid');
      type = 'payment';
    } else if (kpiName === 'Client No-Show / Cancelled') {
      title = `${activeAgent.name}'s Client Missed / Cancelled Meetings`;
      data = agentConsultations.filter(c => c.status === 'No-Show' || c.status === 'Cancelled');
      type = 'consultation';
    } else if (kpiName === 'Agent No-Show') {
      title = `${activeAgent.name}'s Agent No-Shows`;
      data = agentConsultations.filter(c => c.noShow === 'agent');
      type = 'consultation';
    } else if (kpiName === 'Agent Cancelled Meetings') {
      title = `${activeAgent.name}'s Agent Cancellations`;
      data = agentConsultations.filter(c => c.cancelledBy === 'agent');
      type = 'consultation';
    } else if (kpiName === 'Agent Leads') {
      title = `${activeAgent.name}'s Leads`;
      data = agentLeads;
      type = 'client';
    } else if (kpiName === 'Conversion Rate') {
      title = `${activeAgent.name}'s Completed Consultations for Conversion`;
      data = agentConsultations.filter(c => c.status === 'Completed');
      type = 'consultation';
    } else if (kpiName === 'Monthly Agent Commission') {
      title = `${activeAgent.name}'s June 2026 Commission Paid Invoices`;
      data = allPayments.filter(p => clientIds.includes(p.clientId))
        .filter((p) => p.status === 'Paid' && (p.paymentDate || p.dueDate)?.startsWith('2026-06'));
      type = 'payment';
    } else if (kpiName === 'Total Commission') {
      // Open the commission rate history dialog
      setCommHistoryAgentId(activeAgent.id);
      setCommHistoryOpen(true);
      return;
    } else {
      return;
    }

    setModalTitle(title);
    setModalData(data);
    setModalType(type);
    setDetailsModalOpen(true);
  };

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
          !isViewOnly && (isAdmin || isSuperAdmin) && (
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Agents Directory
                  </Typography>
                  {/* Custom Override Summary Badge */}
                  {(() => {
                    const overrideCount = agents.filter(a => a.customPermissions?.enabled).length;
                    return overrideCount > 0 ? (
                      <Tooltip title={`${overrideCount} agent${overrideCount > 1 ? 's have' : ' has'} individual permission overrides active — shown with a purple badge`} arrow>
                        <Chip
                          icon={<TuneIcon sx={{ fontSize: '0.85rem !important' }} />}
                          label={`${overrideCount} Custom Override${overrideCount > 1 ? 's' : ''} Active`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(124, 58, 237, 0.12)',
                            color: '#7C3AED',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            border: '1px solid rgba(124, 58, 237, 0.3)',
                            '& .MuiChip-icon': { color: '#7C3AED' },
                            cursor: 'default'
                          }}
                        />
                      </Tooltip>
                    ) : null;
                  })()}
                </Box>
              </Box>

                <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                  {agents.map((agent) => {
                    const agentLeadsCount = allLeads.filter((ld) => ld.assignedConsultantId === agent.id).length;
                    const agentClientsCount = allClients.filter((cl) => cl.assignedConsultantId === agent.id).length;
                    return (
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
                        position: 'relative',
                        // Subtle purple glow border for agents with custom overrides
                        ...(agent.customPermissions?.enabled && {
                          border: '1px solid rgba(124, 58, 237, 0.25)',
                          bgcolor: 'rgba(124, 58, 237, 0.03)',
                        }),
                        '&:hover': {
                          bgcolor: agent.customPermissions?.enabled
                            ? 'rgba(124, 58, 237, 0.08)'
                            : 'rgba(10, 37, 64, 0.05)',
                        },
                        '&.Mui-selected': {
                          bgcolor: agent.customPermissions?.enabled
                            ? 'rgba(124, 58, 237, 0.12)'
                            : 'rgba(10, 37, 64, 0.1)',
                          '&:hover': {
                            bgcolor: agent.customPermissions?.enabled
                              ? 'rgba(124, 58, 237, 0.15)'
                              : 'rgba(10, 37, 64, 0.12)'
                          },
                          '& .MuiTypography-root': { color: '#0A2540 !important' }
                        }
                      }}
                    >
                      <ListItemAvatar>
                        {/* Wrap avatar with badge if custom permissions enabled */}
                        {agent.customPermissions?.enabled ? (
                          <Tooltip title="Individual permission override active" arrow>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <Box sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  bgcolor: '#7C3AED',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1.5px solid white',
                                  boxShadow: '0 0 6px rgba(124,58,237,0.6)',
                                }}>
                                  <TuneIcon sx={{ fontSize: '0.55rem', color: 'white' }} />
                                </Box>
                              }
                            >
                              <Avatar src={agent.avatar} alt={agent.name} />
                            </Badge>
                          </Tooltip>
                        ) : (
                          <Avatar src={agent.avatar} alt={agent.name} />
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        slotProps={{
                          primary: { component: 'div' },
                          secondary: { component: 'div' }
                        }}
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {agent.name}
                              </Typography>
                              {/* Inline custom override label */}
                              {agent.customPermissions?.enabled && (
                                <Chip
                                  label="Custom"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    bgcolor: 'rgba(124, 58, 237, 0.12)',
                                    color: '#7C3AED',
                                    border: '1px solid rgba(124, 58, 237, 0.3)',
                                    letterSpacing: '0.03em',
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                            </Box>
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
                              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {agent.email}
                              </Typography>
                              {agent.customPermissions?.enabled && (
                                <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 600, flexShrink: 0 }}>
                                  · {(agent.customPermissions.menus || []).length}M / {(agent.customPermissions.cards || []).length}C
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                label={`${agentLeadsCount} Leads`}
                                size="small"
                                sx={{ height: 16, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#1E40AF', color: '#FFFFFF' }}
                              />
                              <Chip
                                label={`${agentClientsCount} Cases`}
                                size="small"
                                sx={{ height: 16, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#065F46', color: '#FFFFFF' }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                    );
                   })}
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
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        <strong>Joining Date:</strong> {activeAgent.joiningDate || '2025-01-15'} | <strong>Nationalities:</strong> {activeAgent.nationalities?.join(', ') || 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {activeAgent.languages?.map((l) => (
                          <Chip key={l} label={l} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                      select
                      size="small"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      sx={{ minWidth: 150, bgcolor: 'background.paper' }}
                      InputProps={{ style: { fontWeight: 700, fontSize: '0.85rem' } }}
                    >
                      <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                      <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                      <MenuItem value="Custom Days">Custom Days</MenuItem>
                      <MenuItem value="This Year">This Year</MenuItem>
                      <MenuItem value="All Time">All Time</MenuItem>
                    </TextField>
                    {timeRange === 'Custom Days' && (
                      <TextField
                        type="number"
                        size="small"
                        label="Days"
                        value={customDays}
                        onChange={(e) => setCustomDays(Math.max(1, Number(e.target.value)))}
                        sx={{ width: 80, bgcolor: 'background.paper' }}
                        inputProps={{ min: 1, style: { fontWeight: 700, fontSize: '0.85rem' } }}
                      />
                    )}

                    {!isViewOnly && (isAdmin || isSuperAdmin) && (
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
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} color="secondary">
                    <Tab label="Performance Dashboard" sx={{ fontWeight: 700 }} />
                    <Tab label="Activity History Log" sx={{ fontWeight: 700 }} />
                  </Tabs>
                </Box>

                {activeTab === 0 ? (
                  <Box>
                    {/* 13 KPI Boxes Grid */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                      Agent Performance Metrics Dashboard
                    </Typography>

                    <Box className="grid grid-cols-12 gap-2" sx={{ mb: 3 }}>
                      {/* 1. Total Consultations */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Total Consultations')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Total Consultations</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.totalConsultations}</Typography>
                        </Paper>
                      </Box>

                      {/* 2. Today's Consultations */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick("Today's Consultations")}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Today's Consultations</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.todayConsultations}</Typography>
                        </Paper>
                      </Box>

                      {/* 3. Upcoming Consultations */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Upcoming Consultations')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Upcoming Consultations</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.upcomingConsultations}</Typography>
                        </Paper>
                      </Box>

                      {/* 4. Pending Payments */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Pending Payments')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Pending Payments</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>{kpis.pendingPaymentsCount}</Typography>
                        </Paper>
                      </Box>

                      {/* 5. Total Revenue (Closed) */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Total Revenue')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Total Revenue</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>€{kpis.totalRevenueClosed.toLocaleString()}</Typography>
                        </Paper>
                      </Box>

                      {/* 6. Active Cases */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Active Cases')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Active Cases</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.activeCases}</Typography>
                        </Paper>
                      </Box>

                      {/* 7. Closed Cases */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Closed Cases')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Closed Cases</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.closedCases}</Typography>
                        </Paper>
                      </Box>

                      {/* 8. Client No-Show / Cancelled */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Client No-Show / Cancelled')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Client No-Show / Canceled</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.clientNoShowCancelled}</Typography>
                        </Paper>
                      </Box>

                      {/* 9. Agent No-Show */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Agent No-Show')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Agent No-Show</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>{kpis.agentNoShow}</Typography>
                        </Paper>
                      </Box>

                      {/* 10. Agent Cancelled Meetings */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Agent Cancelled Meetings')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Agent Cancelled Meetings</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>{kpis.agentCancelled}</Typography>
                        </Paper>
                      </Box>

                      {/* 11. Agent Leads */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Tooltip title="This displays lead entries initialized from digital QR business card scans for this agent reference. Click to view detailed leads directory." placement="top">
                          <Paper 
                            onClick={() => handleKPIBoxClick('Agent Leads')}
                            sx={{ p: 2, border: '2px dashed', borderColor: 'primary.main', bgcolor: 'primary.neutral', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' }, position: 'relative' }}
                          >
                            <Box sx={{ position: 'absolute', top: 5, right: 5, color: 'primary.main', display: 'flex' }}><InfoIcon sx={{ fontSize: '0.85rem' }} /></Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Agent Leads</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.agentLeadsCount}</Typography>
                          </Paper>
                        </Tooltip>
                      </Box>

                       {/* 12. Conversion Rate */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Conversion Rate')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'secondary.main', bgcolor: 'secondary.neutral', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700, display: 'block' }}>Conversion Rate</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{kpis.conversionRate}%</Typography>
                        </Paper>
                      </Box>

                      {/* 13. Monthly Agent Commission Earned */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Monthly Agent Commission')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Monthly Agent Commission Earned</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'amber.950' }}>€{kpis.monthlyCommission.toLocaleString()}</Typography>
                        </Paper>
                      </Box>

                      {/* 14. Total Commission Since Joining */}
                      <Box className="col-span-6 sm:col-span-4 md:col-span-3">
                        <Paper 
                          onClick={() => handleKPIBoxClick('Total Commission')}
                          sx={{ p: 2, border: '2px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Commission History</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>€{kpis.totalCommissionSinceJoining.toLocaleString()}</Typography>
                        </Paper>
                      </Box>

                    </Box>

                    {/* Highlight Commission Box */}
                    <Paper sx={{ p: 3, bgcolor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box>
                        <Typography variant="subtitle2" color="amber.900" sx={{ fontWeight: 800 }}>Total Commission Earned since joining ({activeAgent.commissionRate !== undefined ? activeAgent.commissionRate : 10}%)</Typography>
                        <Typography variant="caption" color="amber.850">Calculated automatically on paid invoice totals closed by this agent.</Typography>
                      </Box>
                      <Typography variant="h4" color="amber.900" sx={{ fontWeight: 900 }}>€{kpis.totalCommissionSinceJoining.toLocaleString()}</Typography>
                    </Paper>

                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Biography</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{activeAgent.bio || 'No biography recorded for this agent.'}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Complete Activity Logs & History ({getAgentHistory(activeAgent).filter(item => {
                          const matchesSearch = item.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                                                item.description.toLowerCase().includes(historySearch.toLowerCase()) ||
                                                item.date.includes(historySearch);
                          const matchesFilter = historyFilter === 'all' || 
                                                (historyFilter === 'consultations' && item.type === 'consultation') ||
                                                (historyFilter === 'cases' && item.type === 'case') ||
                                                (historyFilter === 'payments' && item.type === 'payment');
                          return matchesSearch && matchesFilter;
                        }).length})
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <TextField
                          size="small"
                          placeholder="Search logs..."
                          value={historySearch}
                          onChange={(e) => setHistorySearch(e.target.value)}
                          sx={{ width: 220 }}
                        />
                        <TextField
                          select
                          size="small"
                          value={historyFilter}
                          onChange={(e) => setHistoryFilter(e.target.value)}
                          sx={{ minWidth: 150 }}
                        >
                          <MenuItem value="all">All Activities</MenuItem>
                          <MenuItem value="consultations">Consultations</MenuItem>
                          <MenuItem value="cases">Client Cases</MenuItem>
                          <MenuItem value="payments">Payments & Invoices</MenuItem>
                        </TextField>
                      </Box>
                    </Box>

                    {getAgentHistory(activeAgent).filter(item => {
                      const matchesSearch = item.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                                            item.description.toLowerCase().includes(historySearch.toLowerCase()) ||
                                            item.date.includes(historySearch);
                      const matchesFilter = historyFilter === 'all' || 
                                            (historyFilter === 'consultations' && item.type === 'consultation') ||
                                            (historyFilter === 'cases' && item.type === 'case') ||
                                            (historyFilter === 'payments' && item.type === 'payment');
                      return matchesSearch && matchesFilter;
                    }).length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No matching activity logs found.
                      </Typography>
                    ) : (
                      <Box sx={{ position: 'relative', pl: 4, '&::before': { content: '""', position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, bgcolor: 'divider' } }}>
                        {getAgentHistory(activeAgent).filter(item => {
                          const matchesSearch = item.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                                                item.description.toLowerCase().includes(historySearch.toLowerCase()) ||
                                                item.date.includes(historySearch);
                          const matchesFilter = historyFilter === 'all' || 
                                                (historyFilter === 'consultations' && item.type === 'consultation') ||
                                                (historyFilter === 'cases' && item.type === 'case') ||
                                                (historyFilter === 'payments' && item.type === 'payment');
                          return matchesSearch && matchesFilter;
                        }).map((item, idx) => {
                          let dotColor = 'primary.main';
                          let bgLight = '#EFF6FF';
                          if (item.type === 'case') {
                            dotColor = 'secondary.main';
                            bgLight = '#F5F3FF';
                          } else if (item.type === 'payment') {
                            dotColor = 'success.main';
                            bgLight = '#ECFDF5';
                          } else if (item.type === 'system') {
                            dotColor = 'amber.700';
                            bgLight = '#FFFBEB';
                          }

                          return (
                            <Box key={item.id} sx={{ position: 'relative', mb: 3 }}>
                              {/* Timeline Dot Icon */}
                              <Box 
                                sx={{ 
                                  position: 'absolute', 
                                  left: -33, 
                                  top: 2, 
                                  width: 24, 
                                  height: 24, 
                                  borderRadius: '50%', 
                                  bgcolor: dotColor, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  boxShadow: 2
                                }}
                              >
                                {item.icon === 'person' && '👤'}
                                {item.icon === 'meeting' && '📅'}
                                {item.icon === 'case' && '📁'}
                                {item.icon === 'check' && '✅'}
                                {item.icon === 'payment' && '💶'}
                              </Box>

                              <Paper 
                                sx={{ 
                                  p: 2, 
                                  border: '1px solid', 
                                  borderColor: 'divider', 
                                  boxShadow: 'none', 
                                  borderRadius: 2.5,
                                  bgcolor: bgLight,
                                  '&:hover': {
                                    borderColor: '#D97706',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                    {item.title}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Date: {item.date}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                                  {item.description}
                                </Typography>
                              </Paper>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                )}
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
            onChange={(e) => setCommissionRate(e.target.value === '' ? '' : Math.max(0, Math.min(100, Number(e.target.value))))}
            onFocus={(e) => { if (Number(e.target.value) === 0) setCommissionRate(''); }}
            onBlur={(e) => { if (e.target.value === '' || e.target.value === undefined) setCommissionRate(0); }}
            inputProps={{ min: 0, max: 100 }}
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
            onChange={(e) => setCommissionRate(e.target.value === '' ? '' : Math.max(0, Math.min(100, Number(e.target.value))))}
            onFocus={(e) => { if (Number(e.target.value) === 0) setCommissionRate(''); }}
            onBlur={(e) => { if (e.target.value === '' || e.target.value === undefined) setCommissionRate(0); }}
            inputProps={{ min: 0, max: 100 }}
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
      {/* MODAL: KPI Details Dialog */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{modalTitle}</DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {modalData.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No records found for this category.
            </Typography>
          ) : (
            <Box>
              {modalType === 'consultation' && (
                <List>
                  {modalData.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 1.5, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Meeting Date: {item.meetingDate} | Time: {item.slot}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Client Name: {item.clientName || 'N/A'} | Language: {item.clientLanguage || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                        Status: <Chip label={item.status} size="small" color={item.status === 'Completed' ? 'success' : item.status === 'Scheduled' ? 'primary' : 'default'} />
                      </Typography>
                    </Box>
                  ))}
                </List>
              )}
              {modalType === 'client' && (
                <List>
                  {modalData.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 1.5, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Client: {item.firstName} {item.lastName} (ID: {item.id})
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Nationality: {item.nationality} | Visa: {SERVICES.find(s => s.id === item.serviceId)?.name || item.serviceId}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                        Status: <Chip label={item.status} size="small" color={item.status === 'Completed' ? 'success' : 'secondary'} />
                      </Typography>
                    </Box>
                  ))}
                </List>
              )}
              {modalType === 'payment' && (
                <List>
                  {modalData.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 1.5, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Invoice ID: {item.id} | Amount: €{item.amount - item.discount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Method: {item.paymentMethod || 'N/A'} | Date: {item.paymentDate || item.dueDate}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                        Status: <Chip label={item.status} size="small" color={item.status === 'Paid' ? 'success' : 'warning'} />
                      </Typography>
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)} variant="contained" color="secondary" sx={{ fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: Commission Rate History (from KPI card) */}
      <Dialog
        open={commHistoryOpen}
        onClose={() => setCommHistoryOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2.5,
          px: 3
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Commission Rate History</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {activeAgent?.name} — Rate changes, revenue & commission earned at each point
            </Typography>
          </Box>
          <IconButton onClick={() => setCommHistoryOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
          {loadingCommHistory ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading history...</Typography>
            </Box>
          ) : commissionHistory.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>No Rate Changes Yet</Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                Commission rate changes will appear here once a rate is modified for this agent.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {commissionHistory.map((entry) => {
                const isIncrease = entry.newRate > entry.oldRate;
                const date = new Date(entry.createdAt);
                const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                return (
                  <Paper
                    key={entry.id}
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: isIncrease ? 'success.light' : 'warning.light',
                      borderLeft: '4px solid',
                      borderLeftColor: isIncrease ? 'success.main' : 'warning.main',
                      borderRadius: 3,
                      p: 2.5,
                      bgcolor: 'white'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          display: 'flex', alignItems: 'center', gap: 1,
                          border: '1px solid', borderColor: isIncrease ? 'success.light' : 'warning.light',
                          borderRadius: 2, px: 2, py: 0.75
                        }}>
                          <Typography sx={{ fontWeight: 800, color: 'text.secondary', textDecoration: 'line-through', fontSize: '0.9rem' }}>{entry.oldRate}%</Typography>
                          <Typography sx={{ color: 'text.disabled' }}>→</Typography>
                          <Typography sx={{ fontWeight: 900, color: isIncrease ? 'success.dark' : 'warning.dark', fontSize: '1rem' }}>{entry.newRate}%</Typography>
                          {isIncrease ? <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18 }} /> : <TrendingDownIcon sx={{ color: 'warning.main', fontSize: 18 }} />}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{isIncrease ? 'Rate Increased' : 'Rate Decreased'}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{dateStr}</Typography>
                        <Typography variant="caption" color="text.secondary">{timeStr}</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                          {(entry.changedBy?.fullName || 'A')[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Changed by</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{entry.changedBy?.fullName || 'Unknown'}</Typography>
                          <Typography variant="caption" color="text.secondary">{entry.changedBy?.role || ''}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 14, color: 'white', fontWeight: 700 }}>€</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Revenue at time of change</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                            €{(entry.revenueAtChange || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Commission on that revenue</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 6 }}>
                            €{((entry.revenueAtChange || 0) * entry.oldRate / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          → <span style={{ fontWeight: 900, color: isIncrease ? '#2e7d32' : '#e65100' }}>
                            €{((entry.revenueAtChange || 0) * entry.newRate / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {commissionHistory.length} rate change{commissionHistory.length !== 1 ? 's' : ''} recorded
          </Typography>
          <Button variant="contained" onClick={() => setCommHistoryOpen(false)} sx={{ fontWeight: 700, px: 3 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminAgents;
