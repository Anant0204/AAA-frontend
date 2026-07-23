import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NATIONALITIES } from '../../constants/nationalities';
import { LANGUAGES } from '../../constants/languages';
import SearchableDropdown from '../../components/SearchableDropdown';
import * as yup from 'yup';
import dayjs from 'dayjs';

// Icons
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import AppTable from '../../components/AppTable';
import AppModal from '../../components/AppModal';
import StatCard from '../../components/StatCard';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../hooks/useAuth';
import { SERVICES } from '../../constants/mockData';

const leadSchema = yup.object().shape({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  nationality: yup.string().required('Nationality is required'),
  preferredLanguage: yup.string().required('Preferred language is required'),
  serviceId: yup.string().required('Visa service is required'),
  applicantsCount: yup.number().typeError('Must be a number').min(1, 'At least 1 applicant').required(),
  source: yup.string().required('Lead source is required'),
  notes: yup.string() });

export const LeadList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { isAdmin, isOperations, currentUser } = useAuth();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(() => {
    const savedFiltersStr = sessionStorage.getItem('leadList_filters');
    const savedFilters = savedFiltersStr ? JSON.parse(savedFiltersStr) : null;

    const status = location.state?.filterStatus !== undefined
      ? location.state.filterStatus
      : (savedFilters?.status || '');

    const assignedConsultantId = location.state?.filterConsultantId !== undefined
      ? location.state.filterConsultantId
      : (savedFilters?.assignedConsultantId || '');

    const todayOnly = location.state?.filterToday !== undefined
      ? location.state.filterToday
      : (savedFilters?.todayOnly || false);

    return {
      serviceId: savedFilters?.serviceId || '',
      status,
      assignedConsultantId,
      todayOnly
    };
  });
  const [cardInfo, setCardInfo] = useState(() => {
    const savedCardInfoStr = sessionStorage.getItem('leadList_cardInfo');
    const savedCardInfo = savedCardInfoStr ? JSON.parse(savedCardInfoStr) : null;
    return location.state?.cardInfo || savedCardInfo || null;
  });

  useEffect(() => {
    if (location.state) {
      if (location.state.resetFilters) {
        setFilters({
          serviceId: '',
          status: '',
          assignedConsultantId: '',
          todayOnly: false
        });
        setCardInfo(null);
        sessionStorage.removeItem('leadList_filters');
        sessionStorage.removeItem('leadList_cardInfo');
        navigate(location.pathname, { replace: true, state: {} });
      } else if (
        location.state.filterStatus !== undefined ||
        location.state.filterConsultantId !== undefined ||
        location.state.filterToday !== undefined ||
        location.state.cardInfo !== undefined
      ) {
        setFilters((prev) => {
          const nextFilters = {
            ...prev,
            status: location.state.filterStatus !== undefined ? location.state.filterStatus : prev.status,
            assignedConsultantId: location.state.filterConsultantId !== undefined ? location.state.filterConsultantId : prev.assignedConsultantId,
            todayOnly: location.state.filterToday !== undefined ? location.state.filterToday : prev.todayOnly };
          sessionStorage.setItem('leadList_filters', JSON.stringify(nextFilters));
          return nextFilters;
        });
        if (location.state.cardInfo) {
          setCardInfo(location.state.cardInfo);
          sessionStorage.setItem('leadList_cardInfo', JSON.stringify(location.state.cardInfo));
        }
      }
    }
  }, [location.state, navigate, location.pathname]);

  const getCardIcon = (iconType) => {
    switch (iconType) {
      case 'PeopleAlt': return <PeopleAltIcon />;
      case 'Add': return <AddIcon />;
      case 'CalendarMonth': return <CalendarMonthIcon />;
      case 'Payments': return <PaymentsIcon />;
      case 'TrendingUp': return <TrendingUpIcon />;
      case 'Assignment': return <AssignmentIcon />;
      case 'CheckCircleOutlined': return <CheckCircleOutlinedIcon />;
      case 'WarningAmber': return <WarningAmberIcon />;
      case 'Receipt': return <ReceiptIcon />;
      case 'CreditCard': return <CreditCardIcon />;
      default: return null;
    }
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('createdDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [targetConsultantId, setTargetConsultantId] = useState('');

  // Fetch Leads
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: dbService.getLeads });

  // Fetch Agents dynamically
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents });

  // Mutations
  const createLeadMutation = useMutation({
    mutationFn: dbService.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showAlert('Lead created successfully', 'success');
      setAddModalOpen(false);
      reset();
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Error creating lead';
      showAlert(msg, 'error');
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: dbService.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showAlert('Lead deleted successfully', 'success');
    } });

  const assignAgentMutation = useMutation({
    mutationFn: ({ leadId, agentId }) => dbService.assignAgent(leadId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showAlert('Agent assigned successfully', 'success');
      setAssignModalOpen(false);
      setTargetConsultantId('');
    } });

  const updateLeadStatusMutation = useMutation({
    mutationFn: ({ leadId, status }) => dbService.updateLeadStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showAlert('Lead status adjusted successfully!', 'success');
    } });

  const handleStatusChange = (leadId, status) => {
    updateLeadStatusMutation.mutate({ leadId, status });
  };

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors } } = useForm({
    resolver: yupResolver(leadSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: '',
      preferredLanguage: 'English',
      serviceId: 'dnv',
      applicantsCount: 1,
      source: 'Google Ads',
      notes: '' } });

  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages });

  const watchServiceId = watch('serviceId');
  const watchSource = watch('source');

  // Handle forms
  const handleCreateLead = (data) => {
    const defaultStatus = leadStages[0]?.name || 'New Lead';
    createLeadMutation.mutate({
      ...data,
      status: defaultStatus,
      assignedConsultantId: '' });
  };

  const handleOpenAssignModal = (lead) => {
    setSelectedLead(lead);
    setTargetConsultantId(lead.assignedConsultantId || '');
    setAssignModalOpen(true);
  };

  const handleAssignAgentSubmit = () => {
    if (!targetConsultantId) return;
    assignAgentMutation.mutate({
      leadId: selectedLead.id,
      agentId: targetConsultantId });
  };

  const handleDeleteLead = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLeadMutation.mutate(id);
    }
  };

  // Filter & Search Logic
  const filteredLeads = leads
    .filter((lead) => {
      const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);

      // Role-based scoping: consultants only see their own assigned leads
      if (!isAdmin && !isOperations && currentUser && currentUser.role === 'consultant') {
        if (lead.assignedConsultantId !== currentUser.id) {
          return false;
        }
      }

      const matchService = filters.serviceId ? lead.serviceId === filters.serviceId : true;
      const matchStatus = filters.status ? lead.status === filters.status : true;
      const matchConsultant = filters.assignedConsultantId
        ? lead.assignedConsultantId === filters.assignedConsultantId
        : true;
      const matchToday = filters.todayOnly ? lead.createdDate?.startsWith('2026-06-18') : true;

      return matchSearch && matchService && matchStatus && matchConsultant && matchToday;
    })
    .sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];
      if (sortColumn === 'name') {
        valA = `${a.firstName} ${a.lastName}`;
        valB = `${b.firstName} ${b.lastName}`;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const paginatedLeads = filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (columnId) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const columns = [
    { id: 'id', label: 'Lead ID', minWidth: 90 },
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => `${row.firstName} ${row.lastName}` },
    { id: 'phone', label: 'Phone', sortable: false },
    { id: 'email', label: 'Email', sortable: false },
    { id: 'nationality', label: 'Nationality', sortable: true },
    {
      id: 'service',
      label: 'Service',
      render: (row) => SERVICES.find((s) => s.id === row.serviceId)?.name || row.serviceId },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <Select
          value={row.status || 'New Lead'}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          size="small"
          sx={{ fontSize: '0.78rem', height: 28, minWidth: 120, bgcolor: 'background.paper' }}
        >
          {leadStatuses.map((st) => (
            <MenuItem key={st} value={st} sx={{ fontSize: '0.78rem' }}>
              {st}
            </MenuItem>
          ))}
        </Select>
      )
    },
    {
      id: 'assignedConsultant',
      label: 'Agent',
      render: (row) => {
        const agent = agents.find((c) => c.id === row.assignedConsultantId);
        return agent ? agent.name : <Typography variant="caption" color="text.secondary">Unassigned</Typography>;
      } },
    { id: 'source', label: 'Source', sortable: true },
    {
      id: 'createdDate',
      label: 'Created Date',
      sortable: true,
      render: (row) => dayjs(row.createdDate).format('YYYY-MM-DD') },
  ];

  const leadStatuses = leadStages.map(s => s.name);

  return (
    <Box>
      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2, color: 'text.secondary', display: 'inline-flex' }}
      >
        Back to Dashboard
      </Button>
      <PageHeader
        title={(currentUser?.role === 'consultant' || currentUser?.role === 'agent') ? "Consultation Center" : "Lead Center"}
        subtitle={(currentUser?.role === 'consultant' || currentUser?.role === 'agent') ? "Manage your inbound consultation inquiries and qualification data." : "Manage inbound inquiries, lead qualification data, and consultant routing rules."}
        action={
          (isAdmin || isOperations) && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
            >
              Add New Lead
            </Button>
          )
        }
      />

      {cardInfo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            p: '8px 16px',
            borderRadius: 2,
            background: `linear-gradient(135deg, ${cardInfo.color}0D 0%, ${cardInfo.color}1E 100%)`,
            border: '1px solid',
            borderColor: `${cardInfo.color}25`,
            boxShadow: `0 4px 20px ${cardInfo.color}08`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              backgroundColor: cardInfo.color,
              borderRadius: '12px 0 0 12px' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: `${cardInfo.color}25`,
                color: cardInfo.color,
                '& svg': { fontSize: '1.25rem' }
              }}
            >
              {getCardIcon(cardInfo.iconType)}
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {cardInfo.title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {cardInfo.value}
            </Typography>
            {cardInfo.trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    p: '2px 8px',
                    borderRadius: '12px',
                    background: parseFloat(cardInfo.trend) >= 0
                      ? 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)'
                      : 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                >
                  {parseFloat(cardInfo.trend) >= 0 ? '↑' : '↓'} {cardInfo.trend}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.8 }}>
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap', width: '100%' }}>
          <Box sx={{ width: { xs: '100%', md: '320px' }, display: 'flex', alignItems: 'center' }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search leads..."
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <FilterPanel
              filters={filters}
              onFilterChange={(key, val) => setFilters((prev) => {
                const nextFilters = { ...prev, [key]: val };
                sessionStorage.setItem('leadList_filters', JSON.stringify(nextFilters));
                return nextFilters;
              })}
              onClearFilters={() => {
                setFilters({ serviceId: '', status: '', assignedConsultantId: '', todayOnly: false });
                setCardInfo(null);
                sessionStorage.removeItem('leadList_filters');
                sessionStorage.removeItem('leadList_cardInfo');
              }}
              statusOptions={leadStatuses}
            />
          </Box>
        </Box>

        <AppTable
          columns={columns}
          data={paginatedLeads}
          count={filteredLeads.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={isLoading}
          maxHeight="calc(100vh - 250px)"
          onRowClick={(row) => navigate(`/leads/details/${row.id}`)}
          actions={(row) => (
            <>
              <Tooltip title="View Lead Details">
                <IconButton size="small" onClick={() => navigate(`/leads/details/${row.id}`)} color="primary">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Recorded Video Link">
                <IconButton
                  size="small"
                  onClick={() => window.open(row.recordedMeetingLink || 'https://zoom.us/rec/play/mock-meeting-recording', '_blank')}
                  color="info"
                >
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {(isAdmin || isOperations) && (
                <Tooltip title={row.assignedConsultantId ? "Re-assign Agent" : "Assign Agent"}>
                  <IconButton size="small" onClick={() => handleOpenAssignModal(row)} color="secondary">
                    {row.assignedConsultantId ? <SwapHorizIcon fontSize="small" /> : <PersonAddIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}

              {(isAdmin || isOperations) && (
                <Tooltip title="Delete Lead">
                  <IconButton size="small" onClick={() => handleDeleteLead(row.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        />
      </Box>

      {/* MODAL 1: Add New Lead */}
      <AppModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Qualified Lead"
        maxWidth="md"
        actions={
          <>
            <Button onClick={() => setAddModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleCreateLead)}
              variant="contained"
              color="secondary"
              disabled={createLeadMutation.isPending}
            >
              Save Lead
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, width: '100%' }}>
            {/* Left Column: Personal Info */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ borderBottom: '2px solid', borderColor: 'secondary.main', pb: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Contact Information
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField {...register('firstName')} label="First Name" error={!!errors.firstName} helperText={errors.firstName?.message} sx={{ flex: 1 }} />
                <TextField {...register('lastName')} label="Last Name" error={!!errors.lastName} helperText={errors.lastName?.message} sx={{ flex: 1 }} />
              </Box>

              <TextField {...register('email')} label="Email Address" error={!!errors.email} helperText={errors.email?.message} fullWidth />

              <TextField {...register('phone')} label="Phone Number" error={!!errors.phone} helperText={errors.phone?.message} fullWidth />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Controller
                  control={control}
                  name="nationality"
                  render={({ field: { onChange, value } }) => (
                    <SearchableDropdown
                      value={value}
                      onChange={onChange}
                      error={!!errors.nationality}
                      helperText={errors.nationality?.message}
                      label="Nationality"
                      options={NATIONALITIES}
                      sx={{ flex: 1 }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="preferredLanguage"
                  render={({ field: { onChange, value } }) => (
                    <SearchableDropdown
                      value={value}
                      onChange={onChange}
                      error={!!errors.preferredLanguage}
                      helperText={errors.preferredLanguage?.message}
                      label="Preferred Language"
                      options={LANGUAGES}
                      sx={{ flex: 1 }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Right Column: Case Details */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ borderBottom: '2px solid', borderColor: 'secondary.main', pb: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Visa & Case Setup
                </Typography>
              </Box>

              <FormControl fullWidth size="small" error={!!errors.serviceId}>
                <InputLabel id="service-id-label">Visa Service</InputLabel>
                <Select
                  labelId="service-id-label"
                  {...register('serviceId')}
                  value={watchServiceId || ''}
                  label="Visa Service"
                >
                  {SERVICES.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.serviceId && (
                  <FormHelperText>{errors.serviceId.message}</FormHelperText>
                )}
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  {...register('applicantsCount')}
                  type="number"
                  label="Number of Applicants"
                  slotProps={{ htmlInput: { min: 1 } }}
                  inputProps={{ min: 1 }}
                  error={!!errors.applicantsCount}
                  helperText={errors.applicantsCount?.message}
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ flex: 1 }} size="small" error={!!errors.source}>
                  <InputLabel id="source-label">Lead Source Channel</InputLabel>
                  <Select
                    labelId="source-label"
                    {...register('source')}
                    value={watchSource || ''}
                    label="Lead Source Channel"
                  >
                    <MenuItem value="Google Ads">Google Ads</MenuItem>
                    <MenuItem value="Facebook Ads">Facebook Ads</MenuItem>
                    <MenuItem value="Instagram Ads">Instagram Ads</MenuItem>
                    <MenuItem value="WhatsApp Click Ads">WhatsApp Click Ads</MenuItem>
                    <MenuItem value="Website Forms">Website Forms</MenuItem>
                    <MenuItem value="Website Traffic">Website Traffic</MenuItem>
                    <MenuItem value="WeChat">WeChat</MenuItem>
                    <MenuItem value="Telegram">Telegram</MenuItem>
                    <MenuItem value="Manual">Manual</MenuItem>
                  </Select>
                  {errors.source && (
                    <FormHelperText>{errors.source.message}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <TextField
                {...register('notes')}
                label="Consultant Notes / Qualification Details"
                multiline
                rows={4}
                fullWidth
                placeholder="Enter initial client background details, passive income records, or relocation timeline notes..."
              />
            </Box>
          </Box>
        </Box>
      </AppModal>

      {/* MODAL 2: Assign Agent */}
      <AppModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Spain Visa Agent"
        actions={
          <>
            <Button onClick={() => setAssignModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleAssignAgentSubmit}
              variant="contained"
              color="secondary"
              disabled={assignAgentMutation.isPending}
            >
              Assign
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedLead && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Select the Spain Visa agent to handle the case for{' '}
              <strong>
                {selectedLead.firstName} {selectedLead.lastName}
              </strong>{' '}
              ({selectedLead.nationality}, preferred language: {selectedLead.preferredLanguage}).
            </Typography>
          )}
          <FormControl fullWidth size="small">
            <InputLabel id="agent-select-label">Select Agent</InputLabel>
            <Select
              labelId="agent-select-label"
              value={targetConsultantId}
              onChange={(e) => setTargetConsultantId(e.target.value)}
              label="Select Agent"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {agents.filter(c => c.role === 'consultant').map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({(c.languages || []).join('/')}) - {c.casesCount || 0} active cases
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </AppModal>
    </Box>
  );
};

export default LeadList;

