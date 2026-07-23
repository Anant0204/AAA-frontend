import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import MessageIcon from '@mui/icons-material/Message';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WebIcon from '@mui/icons-material/Web';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LaptopIcon from '@mui/icons-material/Laptop';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import PaymentIcon from '@mui/icons-material/Payment';
import RouterIcon from '@mui/icons-material/Router';
import CellTowerIcon from '@mui/icons-material/CellTower';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import GTranslateIcon from '@mui/icons-material/GTranslate';

// Components & Services
import PageHeader from '../../components/PageHeader';
import AppCard from '../../components/AppCard';
import { useAlert } from '../../contexts/AlertContext';
import useAuth from '../../hooks/useAuth';

// General Form Schema
const generalSchema = yup.object().shape({
  companyName: yup.string().required('Company legal name is required'),
  phone: yup.string().required('WhatsApp phone is required'),
  email: yup.string().email('Invalid email').required('Client support email is required'),
  address: yup.string().required('Headquarters address is required'),
  vatRate: yup.number().typeError('Must be a number').min(0).max(100).required('VAT percentage is required'),
  vatId: yup.string().required('VAT/Tax ID is required'),
  website: yup.string().url('Must be a valid URL (starting with http/https)').required('Website link is required'),
  incorporationDate: yup.string().required('Incorporation Date is required') });

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    backgroundColor: 'rgba(244, 246, 249, 0.4)',
    transition: 'all 0.2s ease-in-out',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'primary.main',
    '&:hover': {
      backgroundColor: 'rgba(244, 246, 249, 0.85)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.light' } },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
        borderColor: 'secondary.main' } } },
  '& .MuiInputLabel-root': {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'text.secondary',
    '&.Mui-focused': {
      color: 'secondary.main' } },
  '& .MuiFormHelperText-root': {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.75rem' }
};

export const Settings = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sworn Translation Rates State
  const [ratesForm, setRatesForm] = useState([
    { id: 'lang_en', name: 'English', rate: 0.12 },
    { id: 'lang_fr', name: 'French', rate: 0.14 },
    { id: 'lang_de', name: 'German', rate: 0.14 },
    { id: 'lang_ar', name: 'Arabic', rate: 0.16 },
    { id: 'lang_zh', name: 'Chinese', rate: 0.16 },
    { id: 'lang_ur', name: 'Urdu', rate: 0.15 }
  ]);

  // Form states to Add New Language
  const [newLangName, setNewLangName] = useState('');
  const [newLangRate, setNewLangRate] = useState('');
  const [showAddLang, setShowAddLang] = useState(false);

  const handleAddLanguage = () => {
    if (!newLangName.trim() || !newLangRate) {
      showAlert('Language name and rate are required.', 'warning');
      return;
    }
    const exists = ratesForm.some(r => r.name.toLowerCase() === newLangName.trim().toLowerCase());
    if (exists) {
      showAlert('This language pair is already added.', 'warning');
      return;
    }
    const newLang = {
      id: 'lang_' + Date.now(),
      name: newLangName.trim(),
      rate: Number(newLangRate) || 0.12
    };
    setRatesForm([...ratesForm, newLang]);
    setNewLangName('');
    setNewLangRate('');
    setShowAddLang(false);
    showAlert(`Added ${newLang.name} to translation rates. Please click Save to persist.`, 'success');
  };

  const handleDeleteLanguage = (id) => {
    setRatesForm(ratesForm.filter(r => r.id !== id));
    showAlert('Language removed. Please click Save to persist.', 'info');
  };

  const handleRateChange = (id, newRate) => {
    setRatesForm(ratesForm.map(r => 
      r.id === id ? { ...r, rate: parseFloat(newRate) || 0 } : r
    ));
  };

  // React Query Fetchers
  const { data: generalSettings = {} } = useQuery({
    queryKey: ['settings-general'],
    queryFn: dbService.getSettings });

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  useEffect(() => {
    if (generalSettings && generalSettings.swornTranslationRates) {
      setRatesForm(generalSettings.swornTranslationRates);
    }
  }, [generalSettings]);

  const canEditRates = () => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (customizationSettings && (customizationSettings[currentUser.id] || customizationSettings[currentUser.role])) {
      const features = (customizationSettings[currentUser.id] || customizationSettings[currentUser.role]).features || [];
      return features.includes('canEditTranslationRates');
    }
    return currentUser.role === 'admin';
  };

  const handleSaveTranslationRates = () => {
    if (!canEditRates()) {
      showAlert('You do not have permission to modify sworn translation rates.', 'error');
      return;
    }
    updateGeneralSettingsMutation.mutate({
      ...generalSettings,
      swornTranslationRates: ratesForm
    }, {
      onSuccess: () => {
        showAlert('Sworn translation per-word rates updated successfully!', 'success');
      }
    });
  };

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: dbService.getServices });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: dbService.getPackages });

  const { data: emailTemplates = [] } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: dbService.getEmailTemplates });

  const { data: whatsappTemplates = [] } = useQuery({
    queryKey: ['whatsappTemplates'],
    queryFn: dbService.getWhatsappTemplates });

  const { data: consultants = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents });

  const [recordingStorage, setRecordingStorage] = useState('cloud');

  // Mutations
  const updateGeneralSettingsMutation = useMutation({
    mutationFn: dbService.updateSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings-general'] }) });

  const updateServicesMutation = useMutation({
    mutationFn: dbService.updateServices,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }) });

  const updatePackagesMutation = useMutation({
    mutationFn: dbService.updatePackages,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }) });

  const updateEmailTemplatesMutation = useMutation({
    mutationFn: dbService.updateEmailTemplates,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emailTemplates'] }) });

  const updateWhatsappTemplatesMutation = useMutation({
    mutationFn: dbService.updateWhatsappTemplates,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsappTemplates'] }) });

  const handleToggleStorage = (e) => {
    const value = e.target.checked ? 'nas' : 'cloud';
    setRecordingStorage(value);
    updateGeneralSettingsMutation.mutate({ ...generalSettings, recordingStorage: value });
    showAlert(`Storage mode set to ${value === 'nas' ? 'Local PC / NAS Auto-Download' : 'AWS S3 Cloud'}`, 'success');
  };

  // Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch } = useForm({
    resolver: yupResolver(generalSchema),
    defaultValues: {
      companyName: 'AAA Business Consultancy LLC',
      phone: '+971 50 955 4142',
      email: 'info@aaabusinessconsultancy.com',
      address: 'Business Village, Block B, 4th Floor, Office F09, Deira, Dubai, UAE',
      vatRate: 5,
      vatId: 'VAT-AE-2026-9932',
      website: 'https://aaabusinessconsultancy.com',
      incorporationDate: '2018-05-12',
      autoAssignConsultant: true } });

  useEffect(() => {
    if (generalSettings && Object.keys(generalSettings).length > 0) {
      reset({
        companyName: generalSettings.companyName || '',
        phone: generalSettings.phone || '',
        email: generalSettings.email || '',
        address: generalSettings.address || '',
        vatRate: generalSettings.vatRate || 5,
        vatId: generalSettings.vatId || 'VAT-AE-2026-9932',
        website: generalSettings.website || 'https://aaabusinessconsultancy.com',
        incorporationDate: generalSettings.incorporationDate || '2018-05-12',
        autoAssignConsultant: generalSettings.autoAssignConsultant ?? true });
      setRecordingStorage(generalSettings.recordingStorage || 'cloud');
    }
  }, [generalSettings, reset]);

  const handleGeneralSubmit = (data) => {
    updateGeneralSettingsMutation.mutate(data);
    setIsEditModalOpen(false);
    showAlert('General corporate settings saved successfully', 'success');
  };

  const handleOpenEditModal = () => {
    reset({
      companyName: generalSettings.companyName || '',
      phone: generalSettings.phone || '',
      email: generalSettings.email || '',
      address: generalSettings.address || '',
      vatRate: generalSettings.vatRate || 5,
      vatId: generalSettings.vatId || 'VAT-AE-2026-9932',
      website: generalSettings.website || 'https://aaabusinessconsultancy.com',
      incorporationDate: generalSettings.incorporationDate || '2018-05-12',
      autoAssignConsultant: generalSettings.autoAssignConsultant ?? true
    });
    setIsEditModalOpen(true);
  };

  // Tab 1: Visa Services inline editor states
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editServiceCategory, setEditServiceCategory] = useState('');
  const [editServicePrice, setEditServicePrice] = useState('');

  // Add Visa Pathway state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Residency');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleStartEditService = (s) => {
    setEditingServiceId(s.id);
    setEditServiceName(s.name);
    setEditServiceCategory(s.category);
    setEditServicePrice(s.basePrice);
  };

  const handleSaveService = (id) => {
    if (!editServiceName.trim() || !editServicePrice) {
      showAlert('Service name and price are required', 'error');
      return;
    }
    const updated = services.map((s) =>
      s.id === id ? { ...s, name: editServiceName, category: editServiceCategory, basePrice: Number(editServicePrice) || 0 } : s
    );
    updateServicesMutation.mutate(updated);
    setEditingServiceId(null);
    showAlert('Visa service pathway pricing saved', 'success');
  };

  const handleToggleService = (id) => {
    const updated = services.map((s) =>
      s.id === id ? { ...s, active: s.active === undefined ? false : !s.active } : s
    );
    updateServicesMutation.mutate(updated);
    showAlert('Visa pathway status toggled', 'info');
  };

  const handleAddService = () => {
    if (!newServiceName.trim() || !newServicePrice) {
      showAlert('Pathway name and price are required', 'error');
      return;
    }
    const newService = {
      id: 'srv_' + Date.now(),
      name: newServiceName,
      category: newServiceCategory,
      basePrice: Number(newServicePrice) || 0,
      active: true };
    updateServicesMutation.mutate([...services, newService]);
    setNewServiceName('');
    setNewServicePrice('');
    setShowAddForm(false);
    showAlert('New Spain residency pathway added', 'success');
  };

  // Tab 2: Packages deliverables states
  const [selectedPkgToEdit, setSelectedPkgToEdit] = useState(null);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editPkgPrice, setEditPkgPrice] = useState(0);
  const [editPkgDesc, setEditPkgDesc] = useState('');
  const [editPkgIncludes, setEditPkgIncludes] = useState([]);
  const [newDeliverableVal, setNewDeliverableVal] = useState('');

  const handleOpenPkgEditModal = (pkg) => {
    setSelectedPkgToEdit(pkg);
    setEditPkgPrice(pkg.price || 0);
    setEditPkgDesc(pkg.description || '');
    setEditPkgIncludes([...(pkg.includes || [])]);
    setNewDeliverableVal('');
    setIsPkgModalOpen(true);
  };

  const handleSavePkgModal = () => {
    if (!selectedPkgToEdit) return;
    const updated = packages.map((p) =>
      p.id === selectedPkgToEdit.id
        ? { ...p, price: Number(editPkgPrice) || 0, description: editPkgDesc, includes: editPkgIncludes }
        : p
    );
    updatePackagesMutation.mutate(updated);
    setIsPkgModalOpen(false);
    showAlert(`${selectedPkgToEdit.name} updated successfully`, 'success');
  };

  const handleAddModalDeliverable = () => {
    const trimmed = newDeliverableVal.trim();
    if (!trimmed) return;
    if (editPkgIncludes.includes(trimmed)) {
      showAlert('Deliverable already exists in this package', 'warning');
      return;
    }
    setEditPkgIncludes([...editPkgIncludes, trimmed]);
    setNewDeliverableVal('');
  };

  const handleDeleteModalDeliverable = (itemToDelete) => {
    setEditPkgIncludes(editPkgIncludes.filter((item) => item !== itemToDelete));
  };

  // Tab 3: Template Studio State
  const [activeTemplate, setActiveTemplate] = useState({ type: 'email', id: 'et1' });
  const textareaRef = React.useRef(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editTemplateSubject, setEditTemplateSubject] = useState('');
  const [editTemplateBody, setEditTemplateBody] = useState('');


  const handleSaveTemplateModal = () => {
    if (activeTemplate.type === 'email') {
      const updated = emailTemplates.map((et) =>
        et.id === activeTemplate.id ? { ...et, subject: editTemplateSubject, body: editTemplateBody } : et
      );
      updateEmailTemplatesMutation.mutate(updated);
      showAlert('Email template saved successfully', 'success');
    } else {
      const updated = whatsappTemplates.map((wt) =>
        wt.id === activeTemplate.id ? { ...wt, body: editTemplateBody } : wt
      );
      updateWhatsappTemplatesMutation.mutate(updated);
      showAlert('WhatsApp template saved successfully', 'success');
    }
    setIsTemplateModalOpen(false);
  };

  const handleInsertTagInModal = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditTemplateBody((prev) => prev + tag);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    setEditTemplateBody(before + tag + after);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  };

  const renderBodyWithMockData = (bodyText) => {
    if (!bodyText) return '';
    return bodyText
      .replace(/{clientName}/g, 'Marcus Vance')
      .replace(/{meetingDate}/g, 'June 25, 2026')
      .replace(/{meetingTime}/g, '3:30 PM')
      .replace(/{meetingLink}/g, 'https://zoom.us/j/8839201928')
      .replace(/{rescheduleLink}/g, 'https://aaa-consultancy.com/reschedule?id=9928')
      .replace(/{bookingLink}/g, 'https://aaa-consultancy.com/book-assessment')
      .replace(/{invoiceId}/g, 'INV-2026-004')
      .replace(/{packageName}/g, 'Premium Relocation Package')
      .replace(/{amount}/g, '€2,500')
      .replace(/{dueDate}/g, 'June 30, 2026')
      .replace(/{consultantName}/g, 'Sofia Rodriguez')
      .replace(/\n/g, '<br />');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="CRM Settings Panel"
        subtitle="Manage company information, VAT rules, relocation services details, and notifications templates."
      />

      {/* HORIZONTAL TABS SYSTEM - Matches Reports Tabs aesthetics */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4, width: '100%' }}
      >
        <Tab icon={<BusinessIcon />} iconPosition="start" label="General Info" sx={{ fontWeight: 700, minHeight: 48 }} />
        <Tab icon={<MonetizationOnIcon />} iconPosition="start" label="Visa Settings" sx={{ fontWeight: 700, minHeight: 48 }} />
        <Tab icon={<CardMembershipIcon />} iconPosition="start" label="Relocation Packages" sx={{ fontWeight: 700, minHeight: 48 }} />
        <Tab icon={<MessageIcon />} iconPosition="start" label="Templates Editor" sx={{ fontWeight: 700, minHeight: 48 }} />
        <Tab icon={<PaymentIcon />} iconPosition="start" label="Stripe Config" sx={{ fontWeight: 700, minHeight: 48 }} />
        <Tab icon={<CellTowerIcon />} iconPosition="start" label="Multi-Channel" sx={{ fontWeight: 700, minHeight: 48 }} />
        <Tab icon={<RouterIcon />} iconPosition="start" label="Auto-Routing" sx={{ fontWeight: 700, minHeight: 48 }} />
        <Tab icon={<GTranslateIcon />} iconPosition="start" label="Sworn Translation" sx={{ fontWeight: 700, minHeight: 48 }} />
      </Tabs>

      {/* TAB 0: GENERAL INFO */}
      {activeTab === 0 && (
        <Box sx={{ width: '100%' }}>
          <AppCard
            title="Corporate Identity & Profile"
            subheader="Official branding credentials, contact channels, and headquarters registry."
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleOpenEditModal}
                size="small"
              >
                Edit Corporate Profile
              </Button>
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, mt: 1 }}>

              {/* BRAND IDENTITY */}
              <Box>
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Brand Identity & Logo
                </Typography>
                <Box className="grid grid-cols-12 gap-5" alignItems="center">
                  <Box className="">
                    <Box sx={{
                      width: 76,
                      height: 76,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #0A2540 0%, #C59B27 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.75rem',
                      border: '2px solid white',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                      A³
                    </Box>
                  </Box>
                  <Box className="col-span-12" sm>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {generalSettings.companyName || 'AAA Business Consultancy LLC'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                      Primary Brand: Dark Navy (#0A2540) | Accent Color: Rich Gold (#C59B27)
                    </Typography>
                    <Typography variant="caption" color="secondary.main" display="block" sx={{ fontWeight: 700, mt: 0.5, textTransform: 'uppercase' }}>
                      Spain Visa, Residency & Relocation Services Portal
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* LEGAL CREDENTIALS DISPLAY */}
              <Box>
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Organization Legal Credentials
                </Typography>
                <Box className="grid grid-cols-12 gap-2">
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <BusinessIcon color="secondary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Legal Entity Name</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {generalSettings.companyName || 'AAA Business Consultancy LLC'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <VpnKeyIcon color="secondary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">VAT Registration / Tax ID</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {generalSettings.vatId || 'VAT-AE-2026-9932'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarTodayIcon color="secondary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Incorporation Date</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {generalSettings.incorporationDate ? new Date(generalSettings.incorporationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'May 12, 2018'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden', minWidth: 0 }}>
                      <WebIcon color="secondary" sx={{ flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Official Website URL</Typography>
                        <Typography
                          variant="body2"
                          component="a"
                          href={generalSettings.website || 'https://aaabusinessconsultancy.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontWeight: 700,
                            color: 'secondary.main',
                            textDecoration: 'none',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            '&:hover': { textDecoration: 'underline' } }}
                        >
                          {generalSettings.website || 'https://aaabusinessconsultancy.com'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* CONTACTS AND HQ DISPLAY */}
              <Box>
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contact Channels & Headquarters
                </Typography>
                <Box className="grid grid-cols-12 gap-2">
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PhoneIcon color="secondary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">WhatsApp Hotline Contact</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {generalSettings.phone || '+971 50 955 4142'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden', minWidth: 0 }}>
                      <EmailIcon color="secondary" sx={{ flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Client Support Email</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {generalSettings.email || 'info@aaabusinessconsultancy.com'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                  <Box className="col-span-12">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <LocationOnIcon color="secondary" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Corporate Headquarters Address</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'pre-line' }}>
                          {generalSettings.address || 'Business Village, Block B, 4th Floor, Office F09, Deira, Dubai, UAE'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* FINANCIAL SETTINGS DISPLAY */}
              <Box>
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Portal Billing Rules
                </Typography>
                <Box className="grid grid-cols-12 gap-2">
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '1.2rem', width: 24, textAlign: 'center' }}>%</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Default Invoiced VAT Rate</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {generalSettings.vatRate || 5}%
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '1.2rem', width: 24, textAlign: 'center' }}>€</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Default Portal Currency</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          Euro (EUR)
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '1.2rem', width: 24, textAlign: 'center' }}>⚙️</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Lead Auto-Assignment</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {generalSettings.autoAssignConsultant ? 'Enabled (Language & Load Match)' : 'Disabled (Manual Assignment)'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              </Box>

            </Box>
          </AppCard>

          {/* Meeting & Assessment Recordings Storage Card */}
          <Box sx={{ mt: 3.5 }}>
            <AppCard
              title="Meeting & Assessment Recordings Storage"
              subheader="Configure how virtual Zoom and Google Meet assessment recordings are processed and hosted."
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Storage Target Mode
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 600 }}>
                      Choose between hosting recordings in the AWS S3 Cloud or setting up automated background downloads to your local PC or Network Area Storage (NAS) device.
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={recordingStorage === 'nas'}
                        onChange={handleToggleStorage}
                        color="secondary"
                      />
                    }
                    label={
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {recordingStorage === 'nas' ? 'Local NAS Storage (Auto-Download)' : 'AWS S3 Cloud Storage'}
                      </Typography>
                    }
                  />
                </Box>
                <Divider />
                <Box className="grid grid-cols-12 gap-5">
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: recordingStorage === 'cloud' ? 'rgba(37, 99, 235, 0.04)' : 'background.neutral', transition: 'all 0.2s' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        🌐 AWS S3 Cloud Hosting
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Store all video and audio files in our secure cloud storage environment. Recordings are available globally but incur incremental cloud bandwidth and hosting fees.
                      </Typography>
                    </Paper>
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: recordingStorage === 'nas' ? 'rgba(20, 184, 166, 0.04)' : 'background.neutral', transition: 'all 0.2s' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        💾 Local PC / NAS Auto-Download
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Automatically stream completed Zoom session files straight to your local disk storage or Amazon-sourced NAS server. Saves bandwidth and eliminates cloud bills entirely.
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            </AppCard>
          </Box>
        </Box>
      )}

      {/* TAB 1: VISA SETTINGS */}
      {activeTab === 1 && (
        <AppCard
          title="Visa Services & Pathway Pricing"
          subheader="Configure base processing and application fees for Spain residency and study visa streams."
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(!showAddForm)}
              size="small"
            >
              {showAddForm ? 'Hide Add Form' : 'Add Visa Pathway'}
            </Button>
          }
        >
          {/* Add New Service Pathway Collapse Area */}
          {showAddForm && (
            <Paper sx={{ p: 3, mb: 3.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                Add New Spain Visa Pathway
              </Typography>
              <Box className="grid grid-cols-12 gap-5" alignItems="center">
                <Box className="col-span-12 sm:col-span-4">
                  <TextField
                    label="Visa Pathway Name"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="e.g. Golden Visa Investment"
                    fullWidth
                  />
                </Box>
                <Box className="col-span-12 sm:col-span-3">
                  <FormControl fullWidth>
                    <InputLabel id="add-category-label">Category</InputLabel>
                    <Select
                      labelId="add-category-label"
                      value={newServiceCategory}
                      onChange={(e) => setNewServiceCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="Residency">Residency</MenuItem>
                      <MenuItem value="Study">Study</MenuItem>
                      <MenuItem value="Schengen">Schengen</MenuItem>
                      <MenuItem value="Investment">Investment</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box className="col-span-12 sm:col-span-3">
                  <TextField
                    label="Base Fee (€)"
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="3000"
                    fullWidth
                  />
                </Box>
                <Box className="col-span-12 sm:col-span-2" sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" color="secondary" fullWidth onClick={handleAddService} sx={{ height: 40 }}>
                    Add
                  </Button>
                  <Button variant="outlined" color="primary" onClick={() => setShowAddForm(false)} sx={{ height: 40 }}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Visa Services Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pathway ID</TableCell>
                  <TableCell>Visa Pathway Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Base Processing Fee</TableCell>
                  <TableCell align="center">Portal Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((s) => {
                  const isEditing = editingServiceId === s.id;
                  const isActive = s.active !== false;

                  return (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{s.id.toUpperCase()}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <TextField
                            size="small"
                            value={editServiceName}
                            onChange={(e) => setEditServiceName(e.target.value)}
                            fullWidth
                          />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select
                            size="small"
                            value={editServiceCategory}
                            onChange={(e) => setEditServiceCategory(e.target.value)}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="Residency">Residency</MenuItem>
                            <MenuItem value="Study">Study</MenuItem>
                            <MenuItem value="Schengen">Schengen</MenuItem>
                            <MenuItem value="Investment">Investment</MenuItem>
                          </Select>
                        ) : (
                          <Chip
                            label={s.category}
                            size="small"
                            color={s.category === 'Residency' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {isEditing ? (
                          <TextField
                            size="small"
                            type="number"
                            value={editServicePrice}
                            onChange={(e) => setEditServicePrice(e.target.value)}
                            sx={{ width: 100 }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                            €{s.basePrice.toLocaleString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Chip
                            label={isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={isActive ? 'success' : 'default'}
                          />
                          <Switch
                            size="small"
                            checked={isActive}
                            onChange={() => handleToggleService(s.id)}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {isEditing ? (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <IconButton color="secondary" size="small" onClick={() => handleSaveService(s.id)}>
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="error" size="small" onClick={() => setEditingServiceId(null)}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <IconButton color="primary" size="small" onClick={() => handleStartEditService(s)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AppCard>
      )}

      {/* TAB 2: PACKAGES */}
      {activeTab === 2 && (
        <AppCard title="Relocation Packages & Deliverables" subheader="Review pricing and client deliverables included in standard and premium relocation packages. Click configure to update details.">
          <Box className="grid grid-cols-12 gap-7" sx={{ mt: 0.5 }}>
            {packages.map((pkg) => (
              <Box className="col-span-12 md:col-span-6" key={pkg.id}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(180deg, #ffffff 0%, rgba(244, 246, 249, 0.4) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px -4px rgba(11, 27, 61, 0.1)',
                    borderColor: 'primary.light'
                  }
                }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'rgba(197, 155, 39, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'secondary.main'
                        }}>
                          <CardMembershipIcon />
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
                            {pkg.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                            Code: {pkg.id.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText',
                        px: 2.5,
                        py: 1,
                        borderRadius: 2.5,
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        boxShadow: '0 4px 10px rgba(197, 155, 39, 0.25)',
                        fontFamily: "'Outfit', sans-serif"
                      }}>
                        €{pkg.price?.toLocaleString() || 0}
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, mt: 1.5, minHeight: 48, lineHeight: 1.6, fontSize: '0.92rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {pkg.description}
                    </Typography>

                    <Divider sx={{ mb: 2.5 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', color: 'secondary.main', letterSpacing: '0.05em', fontSize: '0.78rem' }}>
                      Included Deliverables Checklist:
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3.5, flexGrow: 1 }}>
                      {pkg.includes.map((deliverable, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18, mt: 0.25 }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', fontSize: '0.88rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {deliverable}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenPkgEditModal(pkg)}
                    sx={{
                      borderRadius: 2.5,
                      py: 1.25,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        bgcolor: 'rgba(197, 155, 39, 0.05)',
                        color: 'secondary.main',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Configure Package Details
                  </Button>
                </Paper>
              </Box>
            ))}
          </Box>
        </AppCard>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === 3 && (() => {
        // Merge email and whatsapp templates for listing in a single table
        const allTemplates = [
          ...emailTemplates.map(et => ({ ...et, type: 'email' })),
          ...whatsappTemplates.map(wt => ({ ...wt, type: 'whatsapp' }))
        ];

        return (
          <AppCard
            title="Communications Template Studio"
            subheader="Review and configure automated email notifications and WhatsApp message templates dispatched by the Spain visa portal."
          >
            <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mt: 1, overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Template Name</TableCell>
                    <TableCell>Channel Type</TableCell>
                    <TableCell>Subject Line / Preview Snippet</TableCell>
                    <TableCell align="center">Active Trigger</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allTemplates.map((temp) => {
                    const isEmail = temp.type === 'email';
                    return (
                      <TableRow key={`${temp.type}-${temp.id}`} hover>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main', py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              bgcolor: isEmail ? 'rgba(11, 27, 61, 0.08)' : 'rgba(34, 197, 94, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isEmail ? 'primary.main' : 'success.main'
                            }}>
                              {isEmail ? <EmailIcon fontSize="small" /> : <SmartphoneIcon fontSize="small" />}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                              {temp.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isEmail ? 'Email' : 'WhatsApp'}
                            size="small"
                            color={isEmail ? 'primary' : 'success'}
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: 1.5 }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: isEmail ? 'normal' : 'italic', fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {isEmail ? `Subject: ${temp.subject}` : temp.body}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: 'background.neutral', px: 1.5, py: 0.5, borderRadius: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {isEmail ? 'Instant Email Trigger' : 'WhatsApp API Push'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              setActiveTemplate({ type: temp.type, id: temp.id });
                              // Open modal with this template's values
                              setEditTemplateSubject(isEmail ? temp.subject : '');
                              setEditTemplateBody(temp.body || '');
                              setIsTemplateModalOpen(true);
                            }}
                            sx={{
                              borderRadius: 1.5,
                              textTransform: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              fontFamily: "'Outfit', sans-serif",
                              py: 0.5,
                              px: 1.5,
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                borderColor: 'secondary.main',
                                bgcolor: 'rgba(197, 155, 39, 0.05)',
                                color: 'secondary.main'
                              }
                            }}
                          >
                            Configure
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </AppCard>
        );
      })()}

      {/* TAB 4: STRIPE ACCOUNTS CONFIG */}
      {activeTab === 4 && (
        <AppCard title="Stripe Payment Accounts Configuration" subheader="Toggle between 2 Stripe accounts for processing client payments. Configure primary and secondary accounts.">
          <Box className="grid grid-cols-12 gap-2" sx={{ mt: 0.5 }}>
            {[
              { id: 'stripe_primary', label: 'Primary Stripe Account', key: 'sk_live_AAA_primary_*****', status: 'Active', lastUsed: 'Today at 2:15 PM', volume: '€45,200', color: 'success' },
              { id: 'stripe_secondary', label: 'Secondary Stripe Account', key: 'sk_live_AAA_secondary_*****', status: 'Standby', lastUsed: '3 days ago', volume: '€12,800', color: 'warning' },
            ].map((acc) => (
              <Box className="col-span-12 md:col-span-6" key={acc.id}>
                <Paper sx={{ p: 3, borderRadius: 3, border: '2px solid', borderColor: acc.color + '.main', bgcolor: `rgba(${acc.color === 'success' ? '16,185,129' : '245,158,11'},0.04)` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{acc.label}</Typography>
                    <Switch defaultChecked={acc.status === 'Active'} color={acc.color} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">API Key</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{acc.key}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Status</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${acc.color}.main` }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{acc.status}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Last Transaction</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{acc.lastUsed}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Volume Processed</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>{acc.volume}</Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined" fullWidth sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 700 }} startIcon={<EditIcon />}>
                    Update Credentials
                  </Button>
                </Paper>
              </Box>
            ))}
          </Box>
          <Paper sx={{ mt: 3, p: 2, borderRadius: 2.5, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.neutral' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              <strong>⚠️ Important:</strong> Only ONE Stripe account can be Active at a time for payment processing. The standby account is kept for failover or region-specific transactions. Toggle the switch to activate/deactivate accounts.
            </Typography>
          </Paper>
        </AppCard>
      )}

      {/* TAB 5: MULTI-CHANNEL CONTACT CONFIG */}
      {activeTab === 5 && (
        <AppCard title="Multi-Channel Communication Accounts" subheader="Configure multiple communication channels: 2 Phone Numbers, 2 Facebook Pages, 2 Instagram Accounts, 2 WhatsApp Business Numbers.">
          <Box className="grid grid-cols-12 gap-2" sx={{ mt: 0.5 }}>
            {/* Phone Numbers */}
            <Box className="col-span-12 md:col-span-6">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PhoneIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Phone Numbers</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField defaultValue="+971 50 955 4142" label="Primary Hotline" fullWidth size="small" />
                  <TextField defaultValue="+971 52 888 3311" label="Secondary Hotline" fullWidth size="small" />
                </Box>
              </Paper>
            </Box>
            {/* WhatsApp Business */}
            <Box className="col-span-12 md:col-span-6">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WhatsAppIcon sx={{ color: '#25D366' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>WhatsApp Business Accounts</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField defaultValue="+971 50 955 4142" label="WA Business #1 (Sales)" fullWidth size="small" />
                  <TextField defaultValue="+971 52 888 3311" label="WA Business #2 (Support)" fullWidth size="small" />
                </Box>
              </Paper>
            </Box>
            {/* Facebook Pages */}
            <Box className="col-span-12 md:col-span-6">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FacebookIcon sx={{ color: '#1877F2' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Facebook Pages</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField defaultValue="https://facebook.com/AAABusinessConsultancy" label="FB Page #1 (Main Brand)" fullWidth size="small" />
                  <TextField defaultValue="https://facebook.com/SpainVisaExperts" label="FB Page #2 (Visa Community)" fullWidth size="small" />
                </Box>
              </Paper>
            </Box>
            {/* Instagram Accounts */}
            <Box className="col-span-12 md:col-span-6">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InstagramIcon sx={{ color: '#E4405F' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Instagram Accounts</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField defaultValue="@aaabusinessconsultancy" label="IG Account #1 (Official)" fullWidth size="small" />
                  <TextField defaultValue="@spainvisaguide" label="IG Account #2 (Content)" fullWidth size="small" />
                </Box>
              </Paper>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" color="secondary" startIcon={<SaveIcon />} sx={{ borderRadius: 2.5, px: 4, textTransform: 'none', fontWeight: 700 }}>
              Save Channel Configuration
            </Button>
          </Box>
        </AppCard>
      )}

      {/* TAB 6: AUTO-ROUTING RULES */}
      {activeTab === 6 && (() => {
        const defaultRules = [
          { id: 1, nationality: 'British', country: 'UK', consultant: 'David Vance', consultantId: 'c5' },
          { id: 2, nationality: 'American', country: 'US', consultant: 'David Vance', consultantId: 'c5' },
          { id: 3, nationality: 'Canadian', country: 'CA', consultant: 'David Vance', consultantId: 'c5' },
          { id: 4, nationality: 'Russian', country: 'RU', consultant: 'Elena Rostova', consultantId: 'c4' },
          { id: 5, nationality: 'Arabic-Speaking', country: 'GCC', consultant: 'Lucas Gomez', consultantId: 'c2' },
          { id: 6, nationality: 'Emirati', country: 'UAE', consultant: 'Wael Madi (CEO)', consultantId: 'c3' },
          { id: 7, nationality: 'Spanish-Speaking', country: 'LATAM', consultant: 'Sofia Rodriguez', consultantId: 'c1' },
        ];
        return (
          <AppCard title="Lead Auto-Routing Rules" subheader="Configure automatic consultant assignment based on client nationality or country of origin. When a new lead arrives, the system matches them to the appropriate consultant.">
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mt: 1, overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Rule #</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Client Nationality / Region</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Country Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Auto-Assigned Consultant</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {defaultRules.map((rule) => (
                    <TableRow key={rule.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>#{rule.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{rule.nationality}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={rule.country} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>
                            {rule.consultant.split(' ').map(w => w[0]).join('')}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{rule.consultant}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label="Active" size="small" color="success" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error"><DeleteOutlineIcon fontSize="small" /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, alignItems: 'center' }}>
              <Paper sx={{ p: 1.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.neutral', flex: 1, mr: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>How it works:</strong> When a new lead is created, the system checks nationality → matches against routing rules → auto-assigns the consultant. If no rule matches, the lead remains unassigned for manual assignment.
                </Typography>
              </Paper>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Add Routing Rule
              </Button>
            </Box>
          </AppCard>
        );
      })()}

      {/* TAB 7: SWORN TRANSLATION RATES */}
      {activeTab === 7 && (
        <AppCard 
          title="Sworn Translation Word Rates" 
          subheader="Configure per-word pricing for sworn translation documents based on source language. These rates are dynamically used by the client document counter."
          action={
            canEditRates() && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setShowAddLang(!showAddLang)}
                size="small"
              >
                {showAddLang ? 'Hide Add Form' : 'Add Language Pair'}
              </Button>
            )
          }
        >
          <Box sx={{ maxWidth: 700, mx: 'auto', mt: 1 }}>
            {!canEditRates() && (
              <Paper sx={{ p: 2.5, mb: 3.5, bgcolor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <Box>
                  <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>Read-Only Settings Mode</Typography>
                  <Typography variant="caption" color="text.secondary">Your role does not have administrative permission to modify sworn translation pricing rates. You can only view the active rates.</Typography>
                </Box>
              </Paper>
            )}

            {/* Add New Language Form */}
            {showAddLang && (
              <Paper sx={{ p: 3, mb: 3.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                  Add New Sworn Translation Language
                </Typography>
                <Box className="grid grid-cols-12 gap-3" alignItems="center">
                  <Box className="col-span-12 sm:col-span-5">
                    <TextField
                      label="Source Language Name"
                      value={newLangName}
                      onChange={(e) => setNewLangName(e.target.value)}
                      placeholder="e.g. Hindi, Italian"
                      fullWidth
                      size="small"
                    />
                  </Box>
                  <Box className="col-span-12 sm:col-span-4">
                    <TextField
                      label="Rate per Word (€)"
                      type="number"
                      value={newLangRate}
                      onChange={(e) => setNewLangRate(e.target.value)}
                      placeholder="0.12"
                      fullWidth
                      size="small"
                      inputProps={{ step: '0.01', min: '0' }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      }}
                    />
                  </Box>
                  <Box className="col-span-12 sm:col-span-3" sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" color="secondary" fullWidth onClick={handleAddLanguage} sx={{ height: 40, textTransform: 'none', fontWeight: 700 }}>
                      Add
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => setShowAddLang(false)} sx={{ height: 40, textTransform: 'none', fontWeight: 700 }}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}

            <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'background.neutral' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Language Pair</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Rate per Word (€)</TableCell>
                    {canEditRates() && <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ratesForm.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ py: 2, fontWeight: 600 }}>
                        {row.name} to Spanish
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <TextField
                          type="number"
                          value={row.rate}
                          disabled={!canEditRates()}
                          onChange={(e) => handleRateChange(row.id, e.target.value)}
                          size="small"
                          inputProps={{ step: '0.01', min: '0' }}
                          sx={{ 
                            width: 110,
                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">€</InputAdornment>,
                          }}
                        />
                      </TableCell>
                      {canEditRates() && (
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <IconButton color="error" size="small" onClick={() => handleDeleteLanguage(row.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {canEditRates() && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveTranslationRates}
                  sx={{ 
                    borderRadius: 2.5, 
                    px: 4.5, 
                    py: 1.25, 
                    fontWeight: 700,
                    textTransform: 'none',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  Save Translation Rates
                </Button>
              </Box>
            )}
          </Box>
        </AppCard>
      )}

      {/* EDIT CORPORATE PROFILE MODAL */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1.5,
            boxShadow: '0 24px 48px -12px rgba(11, 27, 61, 0.18)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <form onSubmit={handleSubmit(handleGeneralSubmit)}>
          <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', pb: 1, fontSize: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            Edit Corporate Settings
          </DialogTitle>
          <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Modify official company legal profiles, contact hotlines, headquarters address, and defaulted invoicing tax rates.
          </Typography>

          <DialogContent dividers sx={{ borderTop: '1px solid', borderColor: 'divider', borderBottom: '1px solid', px: 3, py: 2.5 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
                py: 1
              }}
            >
              <TextField
                {...register('companyName')}
                label="Company Legal Name"
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                fullWidth
                sx={fieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <BusinessIcon color="primary" sx={{ fontSize: 20, opacity: 0.85 }} />
                    </InputAdornment>
                  ) }}
              />
              <TextField
                {...register('vatId')}
                label="VAT Registration / Tax ID"
                error={!!errors.vatId}
                helperText={errors.vatId?.message}
                fullWidth
                placeholder="VAT-AE-2026-9932"
                sx={fieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <VpnKeyIcon color="primary" sx={{ fontSize: 20, opacity: 0.85 }} />
                    </InputAdornment>
                  ) }}
              />
              <TextField
                {...register('incorporationDate')}
                label="Incorporation Date"
                type="date"
                error={!!errors.incorporationDate}
                helperText={errors.incorporationDate?.message}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={fieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <CalendarTodayIcon color="primary" sx={{ fontSize: 18, opacity: 0.85 }} />
                    </InputAdornment>
                  ) }}
              />
              <TextField
                {...register('website')}
                label="Corporate Website URL"
                error={!!errors.website}
                helperText={errors.website?.message}
                fullWidth
                placeholder="https://aaabusinessconsultancy.com"
                sx={fieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <WebIcon color="primary" sx={{ fontSize: 20, opacity: 0.85 }} />
                    </InputAdornment>
                  ) }}
              />
              <TextField
                {...register('phone')}
                label="WhatsApp Hotline Contact"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                fullWidth
                sx={fieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <PhoneIcon color="primary" sx={{ fontSize: 20, opacity: 0.85 }} />
                    </InputAdornment>
                  ) }}
              />
              <TextField
                {...register('email')}
                label="Client Support Email"
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                sx={fieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <EmailIcon color="primary" sx={{ fontSize: 20, opacity: 0.85 }} />
                    </InputAdornment>
                  ) }}
              />
              <TextField
                {...register('vatRate')}
                type="number"
                label="Default Invoiced VAT Rate"
                error={!!errors.vatRate}
                helperText={errors.vatRate?.message}
                fullWidth
                sx={fieldStyle}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ pr: 1 }}>
                      <span style={{ fontWeight: 700, color: '#C59B27', fontSize: '0.95rem', fontFamily: "'Outfit', sans-serif" }}>%</span>
                    </InputAdornment>
                  ) }}
              />
              {/* Spacer cell on desktop to keep the layout clean, address spans full width below */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

              <TextField
                {...register('address')}
                label="Corporate Headquarters Physical Address"
                error={!!errors.address}
                helperText={errors.address?.message}
                fullWidth
                multiline
                rows={3}
                sx={{
                  ...fieldStyle,
                  gridColumn: { xs: 'span 1', sm: 'span 2' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1, mr: 1 }}>
                      <LocationOnIcon color="primary" sx={{ fontSize: 20, opacity: 0.85 }} />
                    </InputAdornment>
                  ) }}
              />
              <FormControlLabel
                control={
                  <Switch
                    {...register('autoAssignConsultant')}
                    checked={watch('autoAssignConsultant') || false}
                    color="secondary"
                  />
                }
                label="Enable automated lead consultant assignment (based on preferred language matching)"
                sx={{
                  gridColumn: { xs: 'span 1', sm: 'span 2' },
                  mt: 1,
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setIsEditModalOpen(false)}
              sx={{
                borderRadius: 2.5,
                px: 3.5,
                py: 1.25,
                borderColor: 'divider',
                color: 'text.secondary',
                fontFamily: "'Outfit', sans-serif",
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(11, 27, 61, 0.04)',
                  color: 'primary.main'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              sx={{
                borderRadius: 2.5,
                px: 4,
                py: 1.25,
                fontFamily: "'Outfit', sans-serif",
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #C59B27 0%, #A57F1E 100%)',
                boxShadow: '0 4px 14px 0 rgba(197, 155, 39, 0.3)',
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A57F1E 0%, #8A6916 100%)',
                  boxShadow: '0 6px 20px 0 rgba(197, 155, 39, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              Save Corporate Settings
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT RELOCATION PACKAGE MODAL */}
      <Dialog
        open={isPkgModalOpen}
        onClose={() => setIsPkgModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1.5,
            boxShadow: '0 24px 48px -12px rgba(11, 27, 61, 0.18)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        {selectedPkgToEdit && (
          <form onSubmit={(e) => { e.preventDefault(); handleSavePkgModal(); }}>
            <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', pb: 1, fontSize: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              Configure Relocation Package
            </DialogTitle>
            <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Update the base fee, client-facing description, and deliverables checklist for the <strong>{selectedPkgToEdit.name}</strong>.
            </Typography>

            <DialogContent dividers sx={{ borderTop: '1px solid', borderColor: 'divider', borderBottom: '1px solid', px: 3, py: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2.5 }}>
                  <TextField
                    label="Package Name"
                    value={selectedPkgToEdit.name}
                    disabled
                    fullWidth
                    sx={fieldStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <CardMembershipIcon color="disabled" sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ) }}
                  />
                  <TextField
                    label="Base Fee (€)"
                    type="number"
                    value={editPkgPrice}
                    onChange={(e) => setEditPkgPrice(e.target.value)}
                    fullWidth
                    sx={fieldStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.5 }}>
                          <span style={{ fontWeight: 700, color: '#C59B27', fontSize: '0.95rem' }}>€</span>
                        </InputAdornment>
                      ) }}
                  />
                </Box>

                <TextField
                  label="Client Description"
                  multiline
                  rows={3}
                  value={editPkgDesc}
                  onChange={(e) => setEditPkgDesc(e.target.value)}
                  fullWidth
                  sx={fieldStyle}
                />

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', color: 'secondary.main', letterSpacing: '0.05em', fontSize: '0.78rem' }}>
                    Deliverables Checklist Editor
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, minHeight: 48, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(244, 246, 249, 0.2)' }}>
                    {editPkgIncludes.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', m: 'auto' }}>
                        No deliverables in this package yet. Add one below.
                      </Typography>
                    ) : (
                      editPkgIncludes.map((item, idx) => (
                        <Chip
                          key={idx}
                          label={item}
                          onDelete={() => handleDeleteModalDeliverable(item)}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{
                            borderRadius: 1.5,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            borderColor: 'primary.light',
                            bgcolor: 'rgba(11, 27, 61, 0.02)',
                            '& .MuiChip-deleteIcon': {
                              color: 'primary.main',
                              '&:hover': {
                                color: 'error.main'
                              }
                            }
                          }}
                        />
                      ))
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      placeholder="Type a deliverable item and click Add..."
                      value={newDeliverableVal}
                      onChange={(e) => setNewDeliverableVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddModalDeliverable();
                        }
                      }}
                      fullWidth
                      sx={fieldStyle}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddModalDeliverable}
                      sx={{
                        minWidth: 44,
                        p: 0,
                        height: 40,
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #3F51B5 0%, #303F9F 100%)',
                        boxShadow: 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #303F9F 0%, #1A237E 100%)' }
                      }}
                    >
                      <AddIcon />
                    </Button>
                  </Box>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => setIsPkgModalOpen(false)}
                sx={{
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.25,
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontFamily: "'Outfit', sans-serif",
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(11, 27, 61, 0.04)',
                    color: 'primary.main'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                sx={{
                  borderRadius: 2.5,
                  px: 4,
                  py: 1.25,
                  fontFamily: "'Outfit', sans-serif",
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #C59B27 0%, #A57F1E 100%)',
                  boxShadow: '0 4px 14px 0 rgba(197, 155, 39, 0.3)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #A57F1E 0%, #8A6916 100%)',
                    boxShadow: '0 6px 20px 0 rgba(197, 155, 39, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* EDIT TEMPLATE MODAL */}
      <Dialog
        open={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1.5,
            boxShadow: '0 24px 48px -12px rgba(11, 27, 61, 0.18)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTemplateModal(); }}>
          <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', pb: 1, fontSize: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            Edit Template Configuration
          </DialogTitle>
          <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Configure template metadata, subject lines, and notifications message body. Pre-visualization will update live in the right panel.
          </Typography>

          <DialogContent dividers sx={{ borderTop: '1px solid', borderColor: 'divider', borderBottom: '1px solid', px: 3, py: 2.5 }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
              gap: 4,
              py: 1
            }}>
              {/* Left Column: Editor */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {activeTemplate.type === 'email' && (
                  <TextField
                    label="Email Subject Line"
                    value={editTemplateSubject}
                    onChange={(e) => setEditTemplateSubject(e.target.value)}
                    fullWidth
                    sx={fieldStyle}
                  />
                )}

                <TextField
                  inputRef={textareaRef}
                  label="Template Body Message"
                  value={editTemplateBody}
                  onChange={(e) => setEditTemplateBody(e.target.value)}
                  multiline
                  rows={activeTemplate.type === 'email' ? 12 : 9}
                  fullWidth
                  sx={fieldStyle}
                />

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1.5, letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                    Click to Inject Placeholders at Cursor Position:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['{clientName}', '{meetingDate}', '{meetingTime}', '{bookingLink}', '{invoiceId}', '{packageName}', '{amount}', '{dueDate}', '{consultantName}'].map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onClick={() => handleInsertTagInModal(tag)}
                        color="primary"
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          fontFamily: "'Courier New', Courier, monospace",
                          borderRadius: 1.5,
                          borderColor: 'primary.light',
                          bgcolor: 'rgba(11, 27, 61, 0.02)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'secondary.main',
                            color: '#ffffff',
                            borderColor: 'secondary.main'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Right Column: Pre-visualization */}
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start', pt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', color: 'secondary.main', letterSpacing: '0.05em', fontSize: '0.78rem', fontFamily: "'Outfit', sans-serif" }}>
                  Live Device Preview
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}>
                  {activeTemplate.type === 'email' ? (
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <Box sx={{ px: 2, py: 1.2, bgcolor: 'background.neutral', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#EF4444' }} />
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#22C55E' }} />
                        <Box sx={{ flexGrow: 1, mx: 1.5, py: 0.3, px: 1, bgcolor: 'background.paper', borderRadius: 1.2, fontSize: '0.65rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LaptopIcon sx={{ fontSize: 10 }} />
                          <span>mail.google.com/inbox</span>
                        </Box>
                      </Box>
                      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.75rem', bgcolor: 'background.paper' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          <strong>Subject:</strong> {editTemplateSubject ? editTemplateSubject.replace(/{clientName}/g, 'Marcus Vance').replace(/{invoiceId}/g, 'INV-2026-004') : '(No Subject)'}
                        </Typography>
                      </Box>
                      <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', color: '#334155', fontSize: '0.78rem', lineHeight: 1.5, minHeight: 220, maxHeight: 300, overflowY: 'auto' }}>
                        <div dangerouslySetInnerHTML={{ __html: renderBodyWithMockData(editTemplateBody) }} />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{
                      border: '8px solid #334155',
                      borderRadius: 5,
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                      maxWidth: 290,
                      mx: 'auto',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }}>
                      <Box sx={{ py: 1, px: 2, bgcolor: '#075E54', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif" }}>
                          AAA Consultancy Bot
                        </Typography>
                        <SmartphoneIcon sx={{ fontSize: 14 }} />
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: '#E5DDD5', minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                        <Box sx={{
                          alignSelf: 'flex-start',
                          bgcolor: '#DCF8C6',
                          color: '#303030',
                          p: 1.5,
                          borderRadius: '0px 10px 10px 10px',
                          maxWidth: '90%',
                          boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                          mb: 1
                        }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-line', lineHeight: 1.35, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {editTemplateBody ? editTemplateBody
                              .replace(/{clientName}/g, 'Marcus Vance')
                              .replace(/{meetingTime}/g, '3:30 PM')
                              .replace(/{bookingLink}/g, 'https://aaa-consultancy.com/book-assessment')
                              .replace(/{consultantName}/g, 'Sofia Rodriguez') : '(No body text)'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setIsTemplateModalOpen(false)}
              sx={{
                borderRadius: 2.5,
                px: 3.5,
                py: 1.25,
                borderColor: 'divider',
                color: 'text.secondary',
                fontFamily: "'Outfit', sans-serif",
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(11, 27, 61, 0.04)',
                  color: 'primary.main'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              sx={{
                borderRadius: 2.5,
                px: 4,
                py: 1.25,
                fontFamily: "'Outfit', sans-serif",
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #C59B27 0%, #A57F1E 100%)',
                boxShadow: '0 4px 14px 0 rgba(197, 155, 39, 0.3)',
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A57F1E 0%, #8A6916 100%)',
                  boxShadow: '0 6px 20px 0 rgba(197, 155, 39, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT TEMPLATE MODAL */}

    </Box>
  );
};

export default Settings;
