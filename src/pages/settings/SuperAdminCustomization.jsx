import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CampaignIcon from '@mui/icons-material/Campaign';
import FaceIcon from '@mui/icons-material/Face';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SecurityIcon from '@mui/icons-material/Security';
import WorkIcon from '@mui/icons-material/Work';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GavelIcon from '@mui/icons-material/Gavel';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

// Services
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import { useAlert } from '../../contexts/AlertContext';

const AVAILABLE_MENUS = [
  'Dashboard',
  'Agents',
  'Active Cases',
  'Doc Verification',
  'Finance',
  'Refunds & Commissions',
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



const PRESET_COLORS = [
  { value: '#2196F3', name: 'Blue' },
  { value: '#FF9800', name: 'Amber' },
  { value: '#FF5722', name: 'Orange' },
  { value: '#4CAF50', name: 'Green' },
  { value: '#E91E63', name: 'Pink' },
  { value: '#9C27B0', name: 'Purple' },
  { value: '#3F51B5', name: 'Indigo' },
  { value: '#009688', name: 'Teal' },
  { value: '#F44336', name: 'Red' },
  { value: '#9E9E9E', name: 'Gray' }
];

const ALL_LEAD_COLUMNS = [
  { id: 'id', label: 'Lead ID' },
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'nationality', label: 'Nationality' },
  { id: 'service', label: 'Service' },
  { id: 'status', label: 'Status' },
  { id: 'assignedConsultant', label: 'Assigned Agent' },
  { id: 'source', label: 'Source' },
  { id: 'createdDate', label: 'Created Date' }
];

const ALL_CLIENT_COLUMNS = [
  { id: 'id', label: 'Client ID' },
  { id: 'name', label: 'Name' },
  { id: 'nationality', label: 'Nationality' },
  { id: 'service', label: 'Target Visa' },
  { id: 'package', label: 'Selected Package' },
  { id: 'status', label: 'Billing Status' },
  { id: 'visaStatus', label: 'Immigration Progress' },
  { id: 'assignedConsultant', label: 'Case Manager' }
];

const DEFAULT_ACTIONS = {
  leads: { canCreate: true, canDelete: true, canAssignAgent: true },
  clients: { 
    canChangeVisaStatus: true, 
    canVerifyDocs: true, 
    canDelete: true,
    canManageCredentials: true,
    canManageDependents: true,
    canAssignCaseManager: true,
    canSendMessages: true
  },
  calendar: { canAssignAgent: true, canScheduleSession: true },
  finance: { canGeneratePaymentLink: true, canUpdatePaymentStatus: true },
  refunds: { canProcessStripeRefund: true, canProcessBankPayout: true, requireDoubleConfirmation: true },
  commissions: { canEditCommissionRates: true, canGeneratePayoutReports: true },
  marketing: { canUpdateMarketingSpend: true },
  agents: { canCreateAgent: true, canEditAgent: true, canDeleteAgent: true }
};

const DEFAULT_COLUMNS = {
  leads: ['id', 'name', 'phone', 'email', 'nationality', 'service', 'status', 'assignedConsultant', 'source', 'createdDate'],
  clients: ['id', 'name', 'nationality', 'service', 'package', 'status', 'visaStatus', 'assignedConsultant']
};

const DEFAULT_CUSTOMIZATION = {
  allowAdminCustomOverrides: false,
  admin: {
    menus: ['Dashboard', 'Agents', 'Active Cases', 'Doc Verification', 'Finance', 'Closed Cases', 'Clients', 'Leads', 'Social Inbox', 'Marketing', 'Calendar', 'All Agents Performance', 'Integrations'],
    cards: ['Total Clients', 'Today\'s Clients', 'Total Consultations', 'Today\'s Consultations', 'Upcoming Meetings', 'Pending Payments', 'Total Revenue', 'Active Cases', 'Completed Cases', 'Lost Consultations', 'Revenue Today', 'Outstanding Revenue', 'Refunded (50% Rejections)'],
    viewOnlyMenus: [],
    features: ['canEditTranslationRates', 'canViewDependents'],
    actions: JSON.parse(JSON.stringify(DEFAULT_ACTIONS)),
    columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
  },
  operations: {
    menus: ['Dashboard', 'Agents', 'Active Cases', 'Doc Verification', 'Closed Cases', 'Clients', 'Leads', 'Social Inbox', 'Marketing', 'Calendar', 'All Agents Performance'],
    cards: ['Total Clients', 'Today\'s Clients', 'Total Consultations', 'Today\'s Consultations', 'Upcoming Meetings', 'Active Cases', 'Completed Cases'],
    viewOnlyMenus: [],
    features: ['canViewDependents'],
    actions: JSON.parse(JSON.stringify(DEFAULT_ACTIONS)),
    columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
  },
  finance: {
    menus: ['Dashboard', 'Finance', 'Refunds & Commissions'],
    cards: ['Total Revenue', 'Pending Payments'],
    viewOnlyMenus: [],
    features: [],
    actions: JSON.parse(JSON.stringify(DEFAULT_ACTIONS)),
    columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
  },
  consultant: {
    menus: ['Dashboard', 'Clients', 'Leads', 'Social Inbox', 'Calendar'],
    cards: ['Upcoming Meetings', 'Active Cases'],
    viewOnlyMenus: [],
    features: ['canViewDependents'],
    actions: JSON.parse(JSON.stringify(DEFAULT_ACTIONS)),
    columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
  },
  marketing: {
    menus: ['Dashboard', 'Leads', 'Marketing'],
    cards: ['Total Consultations', 'Today\'s Consultations'],
    viewOnlyMenus: [],
    features: [],
    actions: JSON.parse(JSON.stringify(DEFAULT_ACTIONS)),
    columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
  }
};

const DEFAULT_LEAD_STAGES = [
  { id: 'stage_new_lead', name: 'New Lead', type: 'lead', color: '#2196F3', emoji: '🆕' },
  { id: 'stage_hot_lead', name: 'Hot Lead', type: 'lead', color: '#FF9800', emoji: '🔥' },
  { id: 'stage_processing', name: 'Processing', type: 'lead', color: '#3F51B5', emoji: '⚙️' },
  { id: 'stage_under_consultation', name: 'Under Consultation', type: 'lead', color: '#9C27B0', emoji: '📅' },
  { id: 'stage_waiting_payment', name: 'Waiting for Payment', type: 'client', color: '#FF5722', emoji: '💳' },
  { id: 'stage_documents_pending', name: 'Documents Pending', type: 'client', color: '#E91E63', emoji: '📎' },
  { id: 'stage_under_process', name: 'Under Process', type: 'client', color: '#03A9F4', emoji: '📂' },
  { id: 'stage_completed', name: 'Completed', type: 'client', color: '#4CAF50', emoji: '✅' },
  { id: 'stage_closed', name: 'Closed', type: 'client', color: '#9E9E9E', emoji: '🔒' },
  { id: 'stage_cold_lead', name: 'Cold Lead', type: 'lead', color: '#009688', emoji: '❄️' },
  { id: 'stage_lost_lead', name: 'Lost Lead', type: 'lead', color: '#F44336', emoji: '❌' },
];

export const SuperAdminCustomization = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  // Fetch customization settings early so we can use dynamic roles
  const { data: customizationSettings, isLoading: isCustomizationLoading } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  // Local state for modified customization
  const [localSettings, setLocalSettings] = useState(null);

  const dynamicRoles = localSettings?.rolesDefinition || customizationSettings?.rolesDefinition || [
    { id: 'admin', label: 'Admin (General Manager)' },
    { id: 'operations', label: 'Operations Admin' },
    { id: 'finance', label: 'Finance Officer' },
    { id: 'consultant', label: 'Consultant / Visa Agent' },
    { id: 'marketing', label: 'Marketing Executive' }
  ];

  // Top level tabs: 0 = Role Permissions, 1 = Stage Manager, 2 = Visa Document Checklists
  const [topTab, setTopTab] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const currentRoleId = dynamicRoles[activeTab]?.id || 'admin';

  const [selectedVisaId, setSelectedVisaId] = useState('dnv');
  const [newDocText, setNewDocText] = useState({
    main: '',
    spouse: '',
    minorChild: '',
    adultChild: '',
    parent: '',
    other: ''
  });

  // Target customization state (All Users vs Individual User)
  const [targetType, setTargetType] = useState('role'); // 'role' or 'individual'
  const [selectedUserId, setSelectedUserId] = useState('');

  const currentTargetKey = (targetType === 'individual' && selectedUserId) ? selectedUserId : currentRoleId;

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleIcon, setNewRoleIcon] = useState('SupportAgentIcon');

  // Collapsible menu items state
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenuExpanded = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Modal / Editing states for Custom Stages
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null); // null means adding new
  const [stageForm, setStageForm] = useState({ name: '', emoji: '🆕', color: '#2196F3', type: 'lead' });



  // Fetch customizable stages
  const { data: leadStagesData, isLoading: isStagesLoading } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages
  });

  // Fetch agents for individual target selection
  const { data: allUsers = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents
  });

  const leadStages = leadStagesData || DEFAULT_LEAD_STAGES;

  useEffect(() => {
    if (customizationSettings && !localSettings) {
      setLocalSettings(customizationSettings);
    } else if (!isCustomizationLoading && !customizationSettings && !localSettings) {
      setLocalSettings(DEFAULT_CUSTOMIZATION);
    }
  }, [customizationSettings, isCustomizationLoading, localSettings]);
  useEffect(() => {
    // If we switch to an individual user, and they don't have settings yet, initialize with role defaults
    if (localSettings && targetType === 'individual' && selectedUserId && !localSettings[selectedUserId]) {
      setLocalSettings(prev => ({
        ...prev,
        [selectedUserId]: JSON.parse(JSON.stringify(prev[currentRoleId] || {}))
      }));
    }
  }, [targetType, selectedUserId, currentRoleId, localSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: dbService.saveCustomizationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-settings'] });
      showAlert('Customization layout settings updated in real-time!', 'success');
    },
    onError: (err) => {
      console.error('saveSettingsMutation Error:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to save settings', 'error');
    }
  });

  const saveStagesMutation = useMutation({
    mutationFn: dbService.saveLeadStages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-stages'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Lifecycle stages saved successfully!', 'success');
    },
    onError: (err) => {
      console.error('saveStagesMutation Error:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to save stages', 'error');
    }
  });

  const handleToggleMenu = (menu) => {
    if (!localSettings) return;
    const currentMenus = localSettings[currentTargetKey]?.menus || [];
    const updatedMenus = currentMenus.includes(menu)
      ? currentMenus.filter(m => m !== menu)
      : [...currentMenus, menu];

    setLocalSettings({
      ...localSettings,
      [currentTargetKey]: {
        ...localSettings[currentTargetKey],
        menus: updatedMenus
      }
    });
  };

  const handleToggleCard = (card) => {
    if (!localSettings) return;
    const currentCards = localSettings[currentTargetKey]?.cards || [];
    const updatedCards = currentCards.includes(card)
      ? currentCards.filter(c => c !== card)
      : [...currentCards, card];

    setLocalSettings({
      ...localSettings,
      [currentTargetKey]: {
        ...localSettings[currentTargetKey],
        cards: updatedCards
      }
    });
  };

  const handleToggleFeature = (feature) => {
    if (!localSettings) return;
    const currentFeatures = localSettings[currentTargetKey]?.features || [];
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];

    setLocalSettings({
      ...localSettings,
      [currentTargetKey]: {
        ...localSettings[currentTargetKey],
        features: updatedFeatures
      }
    });
  };

  const handleToggleColumn = (tableKey, colId) => {
    if (!localSettings) return;
    const currentTargetConfig = localSettings[currentTargetKey] || {};
    const currentColumns = currentTargetConfig.columns || {};
    const tableColumns = currentColumns[tableKey] || DEFAULT_COLUMNS[tableKey];

    const updatedTableColumns = tableColumns.includes(colId)
      ? tableColumns.filter(c => c !== colId)
      : [...tableColumns, colId];

    setLocalSettings({
      ...localSettings,
      [currentTargetKey]: {
        ...currentTargetConfig,
        columns: {
          ...currentColumns,
          [tableKey]: updatedTableColumns
        }
      }
    });
  };

  const handleToggleAction = (category, actionKey) => {
    if (!localSettings) return;
    const currentTargetConfig = localSettings[currentTargetKey] || {};
    const currentActions = currentTargetConfig.actions || {};
    const categoryActions = currentActions[category] || DEFAULT_ACTIONS[category];

    const updatedCategoryActions = {
      ...categoryActions,
      [actionKey]: !categoryActions[actionKey]
    };

    setLocalSettings({
      ...localSettings,
      [currentTargetKey]: {
        ...currentTargetConfig,
        actions: {
          ...currentActions,
          [category]: updatedCategoryActions
        }
      }
    });
  };

  const handleSave = () => {
    if (!localSettings) return;
    saveSettingsMutation.mutate(localSettings);
  };

  const handleAddDoc = (category) => {
    const docName = newDocText[category]?.trim();
    if (!docName) return;

    const checklists = localSettings.documentChecklists || {};
    const serviceChecklist = checklists[selectedVisaId] || {};
    const categoryList = serviceChecklist[category] || [];

    if (categoryList.includes(docName)) {
      showAlert('Document already exists in this category', 'warning');
      return;
    }

    const updatedChecklist = {
      ...checklists,
      [selectedVisaId]: {
        ...serviceChecklist,
        [category]: [...categoryList, docName]
      }
    };

    setLocalSettings({
      ...localSettings,
      documentChecklists: updatedChecklist
    });

    setNewDocText(prev => ({ ...prev, [category]: '' }));
  };

  const handleRemoveDoc = (category, docName) => {
    const checklists = localSettings.documentChecklists || {};
    const serviceChecklist = checklists[selectedVisaId] || {};
    const categoryList = serviceChecklist[category] || [];

    const updatedChecklist = {
      ...checklists,
      [selectedVisaId]: {
        ...serviceChecklist,
        [category]: categoryList.filter(d => d !== docName)
      }
    };

    setLocalSettings({
      ...localSettings,
      documentChecklists: updatedChecklist
    });
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset ALL roles and settings to factory defaults?")) {
      setLocalSettings(DEFAULT_CUSTOMIZATION);
      saveSettingsMutation.mutate(DEFAULT_CUSTOMIZATION);
    }
  };

  const handleToggleViewOnly = (menuName) => {
    if (!localSettings) return;
    const currentTargetConfig = localSettings[currentTargetKey] || {};
    const currentViewOnly = currentTargetConfig.viewOnlyMenus || [];
    const updatedViewOnly = currentViewOnly.includes(menuName)
      ? currentViewOnly.filter(m => m !== menuName)
      : [...currentViewOnly, menuName];

    setLocalSettings({
      ...localSettings,
      [currentTargetKey]: {
        ...currentTargetConfig,
        viewOnlyMenus: updatedViewOnly
      }
    });
  };

  const handleUpdateFlowSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      flowAutomationSettings: {
        ...(prev.flowAutomationSettings || {}),
        [key]: value
      }
    }));
  };

  const handleResetCurrentRole = () => {
    if (window.confirm(`Are you sure you want to reset the settings for ${dynamicRoles[activeTab]?.label || currentRoleId}?`)) {
      setLocalSettings({
        ...localSettings,
        [currentTargetKey]: DEFAULT_CUSTOMIZATION[currentRoleId] || {
          menus: [],
          cards: [],
          viewOnlyMenus: [],
          features: [],
          actions: JSON.parse(JSON.stringify(DEFAULT_ACTIONS)),
          columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
        }
      });
    }
  };

  // Stage CRUD operations
  const handleOpenAddStage = () => {
    setEditingStage(null);
    setStageForm({ name: '', emoji: '🆕', color: '#2196F3', type: 'lead' });
    setStageDialogOpen(true);
  };

  const handleOpenEditStage = (stage) => {
    setEditingStage(stage.id);
    setStageForm({ name: stage.name, emoji: stage.emoji || '🆕', color: stage.color || '#2196F3', type: stage.type || 'lead' });
    setStageDialogOpen(true);
  };

  const handleSaveStage = () => {
    if (!stageForm.name) return;
    let updatedStages = [...leadStages];
    if (editingStage) {
      updatedStages = updatedStages.map(s => s.id === editingStage ? { ...s, ...stageForm } : s);
    } else {
      const newId = 'stage_' + Math.random().toString(36).substring(2, 9);
      updatedStages.push({ id: newId, ...stageForm });
    }
    saveStagesMutation.mutate(updatedStages);
    setStageDialogOpen(false);
  };

  const handleDeleteStage = (id) => {
    if (window.confirm('Are you sure you want to delete this stage? Active leads/clients in this stage will revert to default.')) {
      const updatedStages = leadStages.filter(s => s.id !== id);
      saveStagesMutation.mutate(updatedStages);
    }
  };

  const handleMoveStage = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === leadStages.length - 1) return;

    const updatedStages = [...leadStages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const [movedStage] = updatedStages.splice(index, 1);
    updatedStages.splice(targetIndex, 0, movedStage);
    saveStagesMutation.mutate(updatedStages);
  };

  const handleResetStages = () => {
    if (window.confirm('Are you sure you want to reset lifecycle stages to their original factory defaults?')) {
      saveStagesMutation.mutate(DEFAULT_LEAD_STAGES);
    }
  };

  const handleSaveNewRole = () => {
    if (!newRoleName.trim()) return;
    const newRoleId = newRoleName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Create new roles array
    const updatedRoles = [...dynamicRoles, { id: newRoleId, label: newRoleName, icon: newRoleIcon }];
    
    // Create new local settings with the added role and empty template
    const newSettings = {
      ...localSettings,
      rolesDefinition: updatedRoles,
      [newRoleId]: {
        menus: [],
        cards: [],
        features: [],
        actions: JSON.parse(JSON.stringify(DEFAULT_ACTIONS)),
        columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
      }
    };
    
    setLocalSettings(newSettings);
    saveSettingsMutation.mutate(newSettings);
    
    // Switch to new role
    setActiveTab(updatedRoles.length - 1);
    setTargetType('role');
    setSelectedUserId('');
    
    setRoleDialogOpen(false);
    setNewRoleName('');
    setNewRoleIcon('SupportAgentIcon');
  };

  const handleDeleteRole = () => {
    if (window.confirm(`Are you sure you want to completely delete the "${dynamicRoles[activeTab]?.label}" role? This cannot be undone.`)) {
      const roleToDelete = currentRoleId;
      
      // Remove from dynamicRoles
      const updatedRoles = dynamicRoles.filter(r => r.id !== roleToDelete);
      
      // Remove from localSettings
      const newSettings = { ...localSettings };
      delete newSettings[roleToDelete];
      newSettings.rolesDefinition = updatedRoles;

      setLocalSettings(newSettings);
      saveSettingsMutation.mutate(newSettings);
      
      // Reset active tab to admin
      setActiveTab(0);
      setTargetType('role');
      setSelectedUserId('');
    }
  };

  console.log('DEBUG: SuperAdminCustomization States:', {
    isCustomizationLoading,
    customizationSettingsExist: !!customizationSettings,
    localSettingsExist: !!localSettings,
    isStagesLoading
  });

  if (isCustomizationLoading || !localSettings || isStagesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const roleMenus = localSettings[currentTargetKey]?.menus || [];
  const roleCards = localSettings[currentTargetKey]?.cards || [];
  const roleFeatures = localSettings[currentTargetKey]?.features || [];
  const roleActions = localSettings[currentTargetKey]?.actions || JSON.parse(JSON.stringify(DEFAULT_ACTIONS));
  const roleColumns = localSettings[currentTargetKey]?.columns || JSON.parse(JSON.stringify(DEFAULT_COLUMNS));

  const renderMenuActionButtons = () => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
      <Button size="small" variant="outlined" color="inherit" onClick={handleResetCurrentRole} sx={{ fontWeight: 600 }}>Reset</Button>
      <Button size="small" variant="contained" color="secondary" onClick={handleSave} sx={{ fontWeight: 600 }}>Save</Button>
    </Box>
  );

  const getMenuDetails = (menu) => {
    switch (menu) {
      case 'Dashboard':
        return (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>
              📊 Dashboard Stats Cards Visibility
            </Typography>
            <FormGroup>
              <Box className="grid grid-cols-12 gap-1">
                {AVAILABLE_CARDS.map((card) => (
                  <Box className="col-span-12 sm:col-span-6" key={card}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={roleCards.includes(card)}
                          onChange={() => handleToggleCard(card)}
                          color="secondary"
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{card}</Typography>}
                    />
                  </Box>
                ))}
              </Box>
            </FormGroup>
            {renderMenuActionButtons()}
          </Box>
        );

      case 'Leads':
        const leadsCols = roleColumns.leads || DEFAULT_COLUMNS.leads;
        return (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              📋 Lead Action Permissions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.leads?.canCreate !== false}
                    onChange={() => handleToggleAction('leads', 'canCreate')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Create Leads</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.leads?.canDelete !== false}
                    onChange={() => handleToggleAction('leads', 'canDelete')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Delete Leads</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.leads?.canAssignAgent !== false}
                    onChange={() => handleToggleAction('leads', 'canAssignAgent')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Assign Agent</Typography>}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              📊 Leads Table Visible Columns
            </Typography>
            <Box className="grid grid-cols-12 gap-0.5">
              {ALL_LEAD_COLUMNS.map((col) => (
                <Box className="col-span-12 sm:col-span-6" key={col.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={leadsCols.includes(col.id)}
                        onChange={() => handleToggleColumn('leads', col.id)}
                        color="secondary"
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{col.label}</Typography>}
                  />
                </Box>
              ))}
            </Box>
            {renderMenuActionButtons()}
          </Box>
        );

      case 'Clients':
        const clientsCols = roleColumns.clients || DEFAULT_COLUMNS.clients;
        return (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              👥 Client Action Permissions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.clients?.canChangeVisaStatus !== false}
                    onChange={() => handleToggleAction('clients', 'canChangeVisaStatus')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Visa Status</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.clients?.canVerifyDocs !== false}
                    onChange={() => handleToggleAction('clients', 'canVerifyDocs')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Verify Docs</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.clients?.canDelete !== false}
                    onChange={() => handleToggleAction('clients', 'canDelete')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Delete Clients</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.clients?.canManageCredentials !== false}
                    onChange={() => handleToggleAction('clients', 'canManageCredentials')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Manage Credentials</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.clients?.canManageDependents !== false}
                    onChange={() => handleToggleAction('clients', 'canManageDependents')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Manage Dependents</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.clients?.canAssignCaseManager !== false}
                    onChange={() => handleToggleAction('clients', 'canAssignCaseManager')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Assign Case Manager</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.clients?.canSendMessages !== false}
                    onChange={() => handleToggleAction('clients', 'canSendMessages')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Send Client Messages</Typography>}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              📊 Clients Table Visible Columns
            </Typography>
            <Box className="grid grid-cols-12 gap-0.5">
              {ALL_CLIENT_COLUMNS.map((col) => (
                <Box className="col-span-12 sm:col-span-6" key={col.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={clientsCols.includes(col.id)}
                        onChange={() => handleToggleColumn('clients', col.id)}
                        color="primary"
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{col.label}</Typography>}
                  />
                </Box>
              ))}
            </Box>
            {renderMenuActionButtons()}
          </Box>
        );

      case 'Calendar':
        return (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              📅 Calendar Action Permissions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.calendar?.canScheduleSession !== false}
                    onChange={() => handleToggleAction('calendar', 'canScheduleSession')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Schedule Sessions</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.calendar?.canAssignAgent !== false}
                    onChange={() => handleToggleAction('calendar', 'canAssignAgent')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Assign Host</Typography>}
              />
            </Box>
            {renderMenuActionButtons()}
          </Box>
        );

      case 'Finance':
        return (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              💳 Finance Action Permissions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.finance?.canGeneratePaymentLink !== false}
                    onChange={() => handleToggleAction('finance', 'canGeneratePaymentLink')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Invoicing / Links</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.finance?.canUpdatePaymentStatus !== false}
                    onChange={() => handleToggleAction('finance', 'canUpdatePaymentStatus')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mark Paid</Typography>}
              />
            </Box>
            {renderMenuActionButtons()}
          </Box>
        );

      case 'Refunds & Commissions':
        return (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: '#FAF6ED', border: '1px solid rgba(197, 155, 39, 0.4)' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#A37E1C', display: 'block', mb: 1 }}>
              🛡️ Master Financial & Refund Guarantee Rules
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                size="small"
                type="number"
                label="Visa Rejection Auto-Refund Rate (%)"
                value={localSettings.refundGuaranteePercentage ?? 50}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, refundGuaranteePercentage: Number(e.target.value) }))}
                inputProps={{ min: 0, max: 100 }}
                sx={{ bgcolor: 'white', borderRadius: 1, maxWidth: 280 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={localSettings.lockClientRefundTab !== false}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, lockClientRefundTab: e.target.checked }))}
                    color="warning"
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Lock Client Portal Refund Tab Until Paid</Typography>}
              />
              <Divider sx={{ my: 0.5 }} />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions?.refunds?.canProcessStripeRefund !== false}
                    onChange={() => handleToggleAction('refunds', 'canProcessStripeRefund')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Enable 1-Click Stripe Auto-Pay</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions?.refunds?.canProcessBankPayout !== false}
                    onChange={() => handleToggleAction('refunds', 'canProcessBankPayout')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Enable Manual Bank Wire Payout Form</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions?.refunds?.requireDoubleConfirmation !== false}
                    onChange={() => handleToggleAction('refunds', 'requireDoubleConfirmation')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Require Security Double Confirmation Dialog</Typography>}
              />

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" sx={{ fontWeight: 800, color: '#A37E1C', display: 'block', mb: 0.5 }}>
                💼 Agent Commission Management Rules
              </Typography>
              <TextField
                size="small"
                type="number"
                label="Default Agent Commission Rate (%)"
                value={localSettings.defaultCommissionRate ?? 10}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultCommissionRate: Number(e.target.value) }))}
                inputProps={{ min: 0, max: 100 }}
                sx={{ bgcolor: 'white', borderRadius: 1, maxWidth: 280 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions?.commissions?.canEditCommissionRates !== false}
                    onChange={() => handleToggleAction('commissions', 'canEditCommissionRates')}
                    color="primary"
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Allow Editing Agent Commission Percentages</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions?.commissions?.canGeneratePayoutReports !== false}
                    onChange={() => handleToggleAction('commissions', 'canGeneratePayoutReports')}
                    color="primary"
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Allow Generating Monthly Payout & Commission Reports</Typography>}
              />
            </Box>
            {renderMenuActionButtons()}
          </Box>
        );

      case 'Marketing':
        return (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              📢 Marketing Action Permissions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.marketing?.canUpdateMarketingSpend !== false}
                    onChange={() => handleToggleAction('marketing', 'canUpdateMarketingSpend')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Edit Spend</Typography>}
              />
            </Box>
            {renderMenuActionButtons()}
          </Box>
        );

      case 'Agents':
        return (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              👥 Agents Directory Action Permissions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.agents?.canCreateAgent !== false}
                    onChange={() => handleToggleAction('agents', 'canCreateAgent')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Add Agents</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.agents?.canEditAgent !== false}
                    onChange={() => handleToggleAction('agents', 'canEditAgent')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Edit / Reset</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={roleActions.agents?.canDeleteAgent !== false}
                    onChange={() => handleToggleAction('agents', 'canDeleteAgent')}
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Remove Agents</Typography>}
              />
            </Box>
            {renderMenuActionButtons()}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <PageHeader
        title="CRM Portal Customization Hub"
        subtitle="Manage navigation layout permissions, dashboard stats cards, and custom customer lifecycle stages."
      />

      <Box sx={{ width: '100%', mb: 3 }}>
        <Paper square sx={{ borderRadius: 3, borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={topTab}
            onChange={(e, val) => setTopTab(val)}
            textColor="secondary"
            indicatorColor="secondary"
            sx={{ px: 3 }}
          >
            <Tab label="👤 Role Permissions" sx={{ fontWeight: 800, px: 3, py: 2 }} />
            <Tab label="⚡ Lifecycle Stages Manager" sx={{ fontWeight: 800, px: 3, py: 2 }} />
            <Tab label="📂 Visa Document Checklists" sx={{ fontWeight: 800, px: 3, py: 2 }} />
            <Tab label="⚙️ Flow Settings" sx={{ fontWeight: 800, px: 3, py: 2 }} />
          </Tabs>
        </Paper>
      </Box>

      {/* ─── TAB 0: Role Permissions ─── */}
      {topTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mb: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RestartAltIcon />}
              onClick={handleResetDefaults}
              sx={{ fontWeight: 700 }}
            >
              Reset Permissions
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ fontWeight: 700 }}
            >
              Save Layout Config
            </Button>
            {(!['admin', 'operations', 'finance', 'consultant', 'super_admin', 'marketing'].includes(currentRoleId)) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteRole}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Delete Role
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setRoleDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Add New Role
            </Button>
          </Box>



          <Box sx={{ width: '100%', mb: 3 }}>
            <Paper square sx={{ borderRadius: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(e, val) => {
                  setActiveTab(val);
                  setTargetType('role');
                  setSelectedUserId('');
                }}
                variant="scrollable"
                scrollButtons="auto"
                textColor="secondary"
                indicatorColor="secondary"
              >
                {dynamicRoles.map((role) => (
                  <Tab key={role.id} label={role.label} sx={{ fontWeight: 700, px: 3 }} />
                ))}
              </Tabs>
            </Paper>
          </Box>

          {/* TARGET SELECTION UI */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Customization Target
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose whether to apply settings to all users in this role, or to override settings for a specific individual agent.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 4 }}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value);
                    if (e.target.value === 'role') setSelectedUserId('');
                  }}
                >
                  <FormControlLabel value="role" control={<Radio color="secondary" />} label={<Typography sx={{ fontWeight: 600 }}>All Users in Role</Typography>} />
                  <FormControlLabel value="individual" control={<Radio color="secondary" />} label={<Typography sx={{ fontWeight: 600 }}>Individual User</Typography>} />
                </RadioGroup>
              </FormControl>

              {targetType === 'individual' && (
                <FormControl sx={{ minWidth: 250 }} size="small">
                  <InputLabel>Select Agent</InputLabel>
                  <Select
                    value={selectedUserId}
                    label="Select Agent"
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    {allUsers.filter(u => u.role === currentRoleId).length > 0 ? (
                      allUsers.filter(u => u.role === currentRoleId).map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.fullName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No agents found in this role
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Paper>

          <Box className="grid grid-cols-12 gap-2">
            {/* Sidebar Menus Visibility & Nested Permissions */}
            <Box className="col-span-12">
              <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Sidebar Menus Visibility & Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Toggle the navigation tabs visible in the left sidebar for {dynamicRoles[activeTab]?.label || currentRoleId}, and expand each menu to configure detailed page-level actions and visible table columns.
                </Typography>
                <Divider sx={{ mb: 2.5 }} />

                {/* 2-Column Masonry-style Layout for Zero Vertical Spacing */}
                <Box className="grid grid-cols-12 gap-3 items-start">
                  {/* LEFT COLUMN */}
                  <Box className="col-span-12 md:col-span-6 flex flex-col gap-2">
                    {AVAILABLE_MENUS.filter((_, idx) => idx % 2 === 0).map((menu) => {
                      const isExpanded = !!expandedMenus[menu];
                      const hasSubsettings = ['Dashboard', 'Leads', 'Clients', 'Calendar', 'Finance', 'Refunds & Commissions', 'Marketing', 'Agents'].includes(menu);

                      return (
                        <Box
                          key={menu}
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: isExpanded ? 'action.hover' : 'transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', cursor: hasSubsettings ? 'pointer' : 'default' }}
                            onClick={() => hasSubsettings && toggleMenuExpanded(menu)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={roleMenus.includes(menu)}
                                    onChange={() => handleToggleMenu(menu)}
                                    color="secondary"
                                    size="small"
                                    sx={{ p: 0.5 }}
                                  />
                                }
                                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.primary' }}>{menu}</Typography>}
                              />
                              {roleMenus.includes(menu) && (
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={localSettings[currentTargetKey]?.viewOnlyMenus?.includes(menu) || false}
                                      onChange={() => handleToggleViewOnly(menu)}
                                      color="warning"
                                      size="small"
                                    />
                                  }
                                  label={<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'warning.main' }}>View Only</Typography>}
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>

                            {hasSubsettings && (
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); toggleMenuExpanded(menu); }}
                                sx={{ color: 'text.secondary', p: 0.5 }}
                              >
                                {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                              </IconButton>
                            )}
                          </Box>

                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            {getMenuDetails(menu)}
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* RIGHT COLUMN */}
                  <Box className="col-span-12 md:col-span-6 flex flex-col gap-2">
                    {AVAILABLE_MENUS.filter((_, idx) => idx % 2 === 1).map((menu) => {
                      const isExpanded = !!expandedMenus[menu];
                      const hasSubsettings = ['Dashboard', 'Leads', 'Clients', 'Calendar', 'Finance', 'Refunds & Commissions', 'Marketing', 'Agents'].includes(menu);

                      return (
                        <Box
                          key={menu}
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: isExpanded ? 'action.hover' : 'transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', cursor: hasSubsettings ? 'pointer' : 'default' }}
                            onClick={() => hasSubsettings && toggleMenuExpanded(menu)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={roleMenus.includes(menu)}
                                    onChange={() => handleToggleMenu(menu)}
                                    color="secondary"
                                    size="small"
                                    sx={{ p: 0.5 }}
                                  />
                                }
                                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.primary' }}>{menu}</Typography>}
                              />
                              {roleMenus.includes(menu) && (
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={localSettings[currentTargetKey]?.viewOnlyMenus?.includes(menu) || false}
                                      onChange={() => handleToggleViewOnly(menu)}
                                      color="warning"
                                      size="small"
                                    />
                                  }
                                  label={<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'warning.main' }}>View Only</Typography>}
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>

                            {hasSubsettings && (
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); toggleMenuExpanded(menu); }}
                                sx={{ color: 'text.secondary', p: 0.5 }}
                              >
                                {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                              </IconButton>
                            )}
                          </Box>

                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            {getMenuDetails(menu)}
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Feature-Level Security Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Grant or restrict specific actions and controls inside CRM settings and workflows for {dynamicRoles[activeTab]?.label || currentRoleId}.
                </Typography>
                <Divider sx={{ mb: 2.5 }} />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={roleFeatures.includes('canEditTranslationRates')}
                        onChange={() => handleToggleFeature('canEditTranslationRates')}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>Can Edit Sworn Translation Rates</Typography>
                        <Typography variant="caption" color="text.secondary">Allows this role to manually modify the per-word rates of English, French, Arabic, Spanish sworn translations in the general settings.</Typography>
                      </Box>
                    }
                    sx={{ mb: 2.5 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={roleFeatures.includes('canViewDependents')}
                        onChange={() => handleToggleFeature('canViewDependents')}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>Can View Dependents & Family Data</Typography>
                        <Typography variant="caption" color="text.secondary">Allows users under this role to view the client's dependents details and document verification cards.</Typography>
                      </Box>
                    }
                    sx={{ mb: 1.5 }}
                  />
                </FormGroup>
              </Paper>
            </Box>




            
            {/* Action Buttons for Current Role */}
            <Box className="col-span-12" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltIcon />}
                onClick={handleResetCurrentRole}
                sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
              >
                Reset Role
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
                disabled={saveSettingsMutation.isPending}
              >
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Role Config'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* ─── TAB 1: Lifecycle Stages Manager ─── */}
      {topTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', maxWidth: { xs: '100%', md: '60%' } }}>
              Create, rename, reorder, and configure custom lead pipeline & client stages. These changes apply globally.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltIcon />}
                onClick={handleResetStages}
                sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddStage}
                sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
              >
                Add Stage
              </Button>
            </Box>
          </Box>

          <Box className="grid grid-cols-12 gap-2">
            {/* Lead Categories */}
            {['lead', 'client'].map((category) => {
              const stagesFiltered = leadStages.filter(s => s.type === category);
              const getCategoryLabel = (cat) => {
                if (cat === 'lead') return '📋 Lead Pipeline Stages';
                return '👥 Client Lifecycle Stages';
              };

              return (
                <Box className="col-span-12 md:col-span-6" key={category}>
                  <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                      {getCategoryLabel(category)}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {stagesFiltered.length === 0 ? (
                      <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                        No stages defined for this category.
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {stagesFiltered.map((stage) => {
                          const globalIndex = leadStages.findIndex(s => s.id === stage.id);
                          return (
                            <Box
                              key={stage.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1,
                                px: 1.5,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: stage.color || '#2196F3',
                                  boxShadow: `0 1px 4px ${stage.color || '#2196F3'}10`
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Typography sx={{ fontSize: '1.1rem' }}>{stage.emoji || '🆕'}</Typography>
                                <Chip
                                  label={stage.name}
                                  size="small"
                                  sx={{
                                    bgcolor: (stage.color || '#2196F3') + '15',
                                    color: stage.color || '#2196F3',
                                    fontWeight: 700,
                                    border: '1px solid',
                                    borderColor: (stage.color || '#2196F3') + '30',
                                    borderRadius: 1,
                                    fontSize: '0.78rem',
                                    height: 22,
                                    px: 0.25
                                  }}
                                />
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <Tooltip title="Move Up">
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={globalIndex === 0}
                                      onClick={() => handleMoveStage(globalIndex, 'up')}
                                      sx={{ p: 0.5 }}
                                    >
                                      <ArrowUpwardIcon sx={{ fontSize: '0.9rem' }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Move Down">
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={globalIndex === leadStages.length - 1}
                                      onClick={() => handleMoveStage(globalIndex, 'down')}
                                      sx={{ p: 0.5 }}
                                    >
                                      <ArrowDownwardIcon sx={{ fontSize: '0.9rem' }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Rename / Edit">
                                  <IconButton size="small" onClick={() => handleOpenEditStage(stage)} sx={{ p: 0.5 }}>
                                    <EditIcon sx={{ fontSize: '0.9rem', color: 'primary.main' }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Stage">
                                  <IconButton size="small" onClick={() => handleDeleteStage(stage.id)} sx={{ p: 0.5 }}>
                                    <DeleteIcon sx={{ fontSize: '0.9rem', color: 'error.main' }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ─── TAB 2: Visa Document Checklists ─── */}
      {topTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                📂 Visa Document Checklists Editor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure required documents checklist globally by visa type. These rules will apply dynamically in the customer portals.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
                disabled={saveSettingsMutation.isPending}
              >
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save All Checklists'}
              </Button>
            </Box>
          </Box>

          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 4 }}>
            <FormControl size="small" sx={{ minWidth: 280, mb: 1 }}>
              <InputLabel id="visa-select-label">Select Visa Program</InputLabel>
              <Select
                labelId="visa-select-label"
                value={selectedVisaId}
                label="Select Visa Program"
                onChange={(e) => setSelectedVisaId(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="dnv">Digital Nomad Visa (DNV)</MenuItem>
                <MenuItem value="nlv">Non-Lucrative Visa (NLV)</MenuItem>
                <MenuItem value="study">Study Visa</MenuItem>
                <MenuItem value="property">Golden Visa</MenuItem>
                <MenuItem value="family">Partner & Family Reunification</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          <Box className="grid grid-cols-12 gap-3">
            {[
              { key: 'main', label: '👤 Main Applicant Requirements', color: '#3B82F6' },
              { key: 'spouse', label: '👩 Spouse Requirements', color: '#EC4899' },
              { key: 'minorChild', label: '👶 Minor Child Requirements (< 18)', color: '#10B981' },
              { key: 'adultChild', label: '👦 Adult Child Requirements (>= 18)', color: '#8B5CF6' },
              { key: 'parent', label: '🧓 Dependent Parent Requirements', color: '#F59E0B' },
              { key: 'other', label: '👥 Other Dependents Requirements', color: '#6B7280' }
            ].map((cat) => {
              const checklists = localSettings.documentChecklists || {};
              const serviceChecklist = checklists[selectedVisaId] || {};
              const docList = serviceChecklist[cat.key] || [];

              return (
                <Box className="col-span-12 md:col-span-6" key={cat.key}>
                  <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: cat.color, mb: 1.5 }}>
                        {cat.label}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {docList.length === 0 ? (
                          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                            No documents defined for this category.
                          </Typography>
                        ) : (
                          docList.map((doc) => (
                            <Chip
                              key={doc}
                              label={doc}
                              onDelete={() => handleRemoveDoc(cat.key, doc)}
                              sx={{ 
                                fontWeight: 600,
                                borderRadius: 1.5,
                                border: '1px solid rgba(0,0,0,0.06)'
                              }}
                            />
                          ))
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Add new document name"
                        value={newDocText[cat.key] || ''}
                        onChange={(e) => setNewDocText(prev => ({ ...prev, [cat.key]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDoc(cat.key);
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleAddDoc(cat.key)}
                        sx={{ minWidth: 80, fontWeight: 700, borderRadius: 2 }}
                      >
                        Add
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ─── TAB 3: Flow Automation Settings ─── */}
      {topTab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
              ⚙️ Flow Automation & Booking Settings
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 1 }}
            >
              Save Flow Settings
            </Button>
          </Box>

          <Box className="grid grid-cols-12 gap-3" sx={{ mt: 2 }}>
            {/* Column 1: Meeting & Booking limits */}
            <Box className="col-span-12 md:col-span-6" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Meeting Scheduler card */}
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#051A3B', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Outfit, sans-serif' }}>
                  📅 Meeting Scheduler Settings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    type="number"
                    label="Default Meeting Duration (Minutes)"
                    value={localSettings?.flowAutomationSettings?.defaultMeetingDuration || 30}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleUpdateFlowSetting('defaultMeetingDuration', isNaN(val) ? '' : val);
                    }}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    type="number"
                    label="Join Grace Period / Booking Expiry (Minutes)"
                    value={localSettings?.flowAutomationSettings?.joinGracePeriod || 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleUpdateFlowSetting('joinGracePeriod', isNaN(val) ? '' : val);
                    }}
                    fullWidth
                    size="small"
                    helperText="Grace period allocated to join zoom calls or lock timeslots."
                  />
                </Box>
              </Paper>

              {/* Age Limits and dependency card */}
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#051A3B', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Outfit, sans-serif' }}>
                  👶 Dependent Classification Rules
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    type="number"
                    label="Adult Dependent Age Threshold"
                    value={localSettings?.flowAutomationSettings?.adultAgeThreshold || 18}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleUpdateFlowSetting('adultAgeThreshold', isNaN(val) ? '' : val);
                    }}
                    fullWidth
                    size="small"
                    helperText="Dependents under this age are classified as minorChild, otherwise adultChild."
                  />
                </Box>
              </Paper>

              {/* Allowed booking hours card */}
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#051A3B', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Outfit, sans-serif' }}>
                  🕒 Allowed Booking Windows (Time Picker Bounds)
                </Typography>
                <Box className="grid grid-cols-12 gap-2">
                  <Box className="col-span-6">
                    <TextField
                      type="time"
                      label="Booking Start Time"
                      value={localSettings?.flowAutomationSettings?.bookingAllowedStart || '09:00'}
                      onChange={(e) => handleUpdateFlowSetting('bookingAllowedStart', e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <Box className="col-span-6">
                    <TextField
                      type="time"
                      label="Booking End Time"
                      value={localSettings?.flowAutomationSettings?.bookingAllowedEnd || '18:00'}
                      onChange={(e) => handleUpdateFlowSetting('bookingAllowedEnd', e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Restricts clients from scheduling assessments outside of these business hours in the self-fill booking forms.
                </Typography>
              </Paper>
            </Box>

            {/* Column 2: Welcome email editor */}
            <Box className="col-span-12 md:col-span-6">
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#051A3B', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Outfit, sans-serif' }}>
                  ✉️ Onboarding Welcome Email Customization
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
                  <TextField
                    label="Welcome Email Subject"
                    value={localSettings?.flowAutomationSettings?.welcomeEmailSubject || ''}
                    onChange={(e) => handleUpdateFlowSetting('welcomeEmailSubject', e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Welcome Email Template (HTML format)"
                    value={localSettings?.flowAutomationSettings?.welcomeEmailTemplate || ''}
                    onChange={(e) => handleUpdateFlowSetting('welcomeEmailTemplate', e.target.value)}
                    fullWidth
                    multiline
                    rows={20}
                    size="small"
                    sx={{ flex: 1, '& .MuiInputBase-root': { height: '100%' } }}
                    helperText="Supported placeholders: {client_name}, {portal_url}, {username}, {temp_password}"
                  />
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* ─── Add / Edit Stage Dialog ─── */}
      <Dialog open={stageDialogOpen} onClose={() => setStageDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingStage ? '✏️ Edit Lifecycle Stage' : '➕ Add Custom Stage'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          <TextField
            label="Stage Name"
            size="small"
            fullWidth
            value={stageForm.name}
            onChange={(e) => setStageForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. VIP Customer, Follow-up"
          />

          <Box className="grid grid-cols-12 gap-2">
            <Box className="col-span-6">
              <TextField
                label="Emoji Icon"
                size="small"
                fullWidth
                value={stageForm.emoji}
                onChange={(e) => setStageForm(prev => ({ ...prev, emoji: e.target.value }))}
                placeholder="e.g. ⭐, 🆕"
              />
            </Box>
            <Box className="col-span-6">
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={stageForm.type}
                  onChange={(e) => setStageForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="lead">Lead Stage</MenuItem>
                  <MenuItem value="client">Client Stage</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
              🎨 Select Theme Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {PRESET_COLORS.map((color) => (
                <Tooltip title={color.name} key={color.value}>
                  <Box
                    onClick={() => setStageForm(prev => ({ ...prev, color: color.value }))}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: color.value,
                      cursor: 'pointer',
                      border: stageForm.color === color.value ? '2px solid #000' : '2px solid transparent',
                      transform: stageForm.color === color.value ? 'scale(1.15)' : 'none',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {stageForm.color === color.value && <CheckCircleIcon sx={{ fontSize: '0.9rem', color: '#fff' }} />}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setStageDialogOpen(false)} variant="outlined" color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveStage} variant="contained" color="secondary" sx={{ fontWeight: 700 }}>
            Save Stage
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add New Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Role</DialogTitle>
        <Divider />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <TextField
            label="Role Name"
            variant="outlined"
            fullWidth
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g. HR Manager"
            autoFocus
          />
          <FormControl fullWidth>
            <InputLabel>Role Icon</InputLabel>
            <Select
              value={newRoleIcon}
              label="Role Icon"
              onChange={(e) => setNewRoleIcon(e.target.value)}
            >
              <MenuItem value="SupportAgentIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SupportAgentIcon fontSize="small" /> Support Agent</Box></MenuItem>
              <MenuItem value="SupervisorAccountIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SupervisorAccountIcon fontSize="small" /> Supervisor / Admin</Box></MenuItem>
              <MenuItem value="SettingsSuggestIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SettingsSuggestIcon fontSize="small" /> Operations / Settings</Box></MenuItem>
              <MenuItem value="AccountBalanceWalletIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccountBalanceWalletIcon fontSize="small" /> Finance / Wallet</Box></MenuItem>
              <MenuItem value="CampaignIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CampaignIcon fontSize="small" /> Marketing / Campaign</Box></MenuItem>
              <MenuItem value="FaceIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><FaceIcon fontSize="small" /> Face / Person</Box></MenuItem>
              <MenuItem value="GroupIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><GroupIcon fontSize="small" /> Group / People</Box></MenuItem>
              <MenuItem value="StarIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><StarIcon fontSize="small" /> Star / VIP</Box></MenuItem>
              <MenuItem value="VerifiedUserIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><VerifiedUserIcon fontSize="small" /> Verified User</Box></MenuItem>
              <MenuItem value="EmojiEventsIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmojiEventsIcon fontSize="small" /> Trophy / Award</Box></MenuItem>
              <MenuItem value="AssignmentIndIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AssignmentIndIcon fontSize="small" /> Assigner</Box></MenuItem>
              <MenuItem value="SecurityIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SecurityIcon fontSize="small" /> Security</Box></MenuItem>
              <MenuItem value="WorkIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WorkIcon fontSize="small" /> Work</Box></MenuItem>
              <MenuItem value="BusinessCenterIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><BusinessCenterIcon fontSize="small" /> Business Center</Box></MenuItem>
              <MenuItem value="GavelIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><GavelIcon fontSize="small" /> Legal / Gavel</Box></MenuItem>
              <MenuItem value="AssuredWorkloadIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AssuredWorkloadIcon fontSize="small" /> Compliance</Box></MenuItem>
              <MenuItem value="RecordVoiceOverIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><RecordVoiceOverIcon fontSize="small" /> Speaker</Box></MenuItem>
              <MenuItem value="LocalPoliceIcon"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LocalPoliceIcon fontSize="small" /> Official</Box></MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Note: Creating a new role will add it to the Tabs above, and you will be able to customize its permissions. It will also be instantly available on the login page as a quick login option.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setRoleDialogOpen(false)} variant="outlined" color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveNewRole} variant="contained" color="secondary" sx={{ fontWeight: 700 }} disabled={!newRoleName.trim()}>
            Create Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminCustomization;

