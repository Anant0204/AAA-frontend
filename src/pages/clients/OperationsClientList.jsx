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
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
import { SERVICES, PACKAGES } from '../../constants/mockData';

const clientSchema = yup.object().shape({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  nationality: yup.string().required('Nationality is required'),
  preferredLanguage: yup.string().required('Preferred language is required'),
  serviceId: yup.string().required('Visa service is required'),
  packageId: yup.string().required('Selected package is required'),
  applicantsCount: yup.number().typeError('Must be a number').min(1, 'At least 1 applicant').required(),
  assignedConsultantId: yup.string().required('Agent assignment is required'),
  status: yup.string().required('Billing status is required'),
  profileSummary: yup.string(),
});

export const OperationsClientList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { currentUser, isAdmin, isOperations, isViewOnlyMenu } = useAuth();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Clients');
  const roleConfig = (customizationSettings?.[currentUser?.id] || customizationSettings?.[currentUser?.role]) || {};
  const baseActions = roleConfig.actions?.clients || { 
    canChangeVisaStatus: true, 
    canVerifyDocs: true, 
    canDelete: true,
    canManageCredentials: true,
    canManageDependents: true,
    canAssignCaseManager: true,
    canSendMessages: true
  };
  const clientsActions = isViewOnly ? { canChangeVisaStatus: false, canVerifyDocs: false, canDelete: false, canManageCredentials: false, canManageDependents: false, canAssignCaseManager: false, canSendMessages: false } : baseActions;

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(() => {
    const savedFiltersStr = sessionStorage.getItem('operationsClientList_filters');
    const savedFilters = savedFiltersStr ? JSON.parse(savedFiltersStr) : null;
    const isFromDashboard = location.state?.cardInfo !== undefined;

    const status = location.state?.filterStatus !== undefined
      ? location.state.filterStatus
      : (isFromDashboard ? '' : (savedFilters?.status || ''));

    const assignedConsultantId = location.state?.filterConsultantId !== undefined
      ? location.state.filterConsultantId
      : (isFromDashboard ? '' : (savedFilters?.assignedConsultantId || ''));

    const serviceId = isFromDashboard ? '' : (savedFilters?.serviceId || '');

    return {
      serviceId,
      status,
      assignedConsultantId
    };
  });
  const [cardInfo, setCardInfo] = useState(() => {
    const savedCardInfoStr = sessionStorage.getItem('operationsClientList_cardInfo');
    const savedCardInfo = savedCardInfoStr ? JSON.parse(savedCardInfoStr) : null;
    return location.state?.cardInfo || savedCardInfo || null;
  });

  const [startDate, setStartDate] = useState(() => {
    return location.state?.startDate || '';
  });
  const [endDate, setEndDate] = useState(() => {
    return location.state?.endDate || '';
  });
  const mockToday = '2026-06-18'; // Mock current date

  const filterByDate = (dateStr, start, end) => {
    if (!start && !end) return true;
    if (!dateStr) return false;
    const formatted = dateStr.substring(0, 10);
    if (start && !end) return formatted === start;
    return formatted >= start && formatted <= end;
  };

  useEffect(() => {
    if (location.state) {
      if (location.state.resetFilters) {
        setFilters({
          serviceId: '',
          status: '',
          assignedConsultantId: ''
        });
        setStartDate('');
        setEndDate('');
        setCardInfo(null);
        sessionStorage.removeItem('operationsClientList_filters');
        sessionStorage.removeItem('operationsClientList_cardInfo');
        navigate(location.pathname, { replace: true, state: {} });
      } else if (
        location.state.filterStatus !== undefined ||
        location.state.filterConsultantId !== undefined ||
        location.state.cardInfo !== undefined ||
        location.state.startDate !== undefined
      ) {
        setFilters((prev) => {
          const isFromDashboard = location.state.cardInfo !== undefined;
          const nextFilters = {
            serviceId: isFromDashboard ? '' : prev.serviceId,
            status: location.state.filterStatus !== undefined ? location.state.filterStatus : (isFromDashboard ? '' : prev.status),
            assignedConsultantId: location.state.filterConsultantId !== undefined ? location.state.filterConsultantId : (isFromDashboard ? '' : prev.assignedConsultantId),
          };
          sessionStorage.setItem('operationsClientList_filters', JSON.stringify(nextFilters));
          return nextFilters;
        });
        if (location.state.startDate !== undefined) {
          setStartDate(location.state.startDate);
        }
        if (location.state.endDate !== undefined) {
          setEndDate(location.state.endDate);
        }
        if (location.state.cardInfo) {
          setCardInfo(location.state.cardInfo);
          sessionStorage.setItem('operationsClientList_cardInfo', JSON.stringify(location.state.cardInfo));
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
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortColumn, setSortColumn] = useState('onboardingDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Fetch Clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients,
  });

  // Fetch Consultants dynamically
  const { data: consultants = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants,
  });

  // Fetch dynamic lifecycle stages
  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages,
  });

  const clientStatuses = leadStages.map(s => s.name);

  // Mutation
  const createClientMutation = useMutation({
    mutationFn: dbService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Client onboarded successfully', 'success');
      setAddModalOpen(false);
      reset();
    },
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: '',
      preferredLanguage: 'English',
      serviceId: 'dnv',
      packageId: 'full_process',
      applicantsCount: 1,
      assignedConsultantId: 'c1',
      status: 'Waiting for Payment',
      profileSummary: '',
    },
  });

  const watchServiceId = watch('serviceId');
  const watchPackageId = watch('packageId');
  const watchConsultantId = watch('assignedConsultantId');
  const watchStatus = watch('status');

  const handleCreateClient = (data) => {
    createClientMutation.mutate(data);
  };

  const handleInvalid = (formErrors) => {
    console.log('Client Onboard Validation Errors:', formErrors);
    showAlert('Please fill in all required fields (including Agent assignment).', 'error');
  };

  // Filter Logic
  const filteredClients = clients
    .filter((client) => {
      if (!filterByDate(client.createdAt || client.onboardingDate, startDate, endDate)) return false;

      // Data Privacy: operations only see their assigned clients unless admin
      if (!isAdmin && client.assignedHandlerId !== currentUser?.id && client.assignedHandlerName !== currentUser?.name) {
        return false;
      }

      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.status && client.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.visaStatus && client.visaStatus.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.serviceId && client.serviceId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchService = filters.serviceId ? client.serviceId === filters.serviceId : true;
      const matchStatus = filters.status ? client.status === filters.status : true;
      const matchConsultant = filters.assignedConsultantId
        ? client.assignedConsultantId === filters.assignedConsultantId
        : true;

      return matchSearch && matchService && matchStatus && matchConsultant;
    })
    .sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const paginatedClients = filteredClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (columnId) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const columns = [
    { id: 'id', label: 'Client ID', minWidth: 90 },
    {
      id: 'name',
      label: 'Name',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { id: 'nationality', label: 'Nationality', sortable: true },
    {
      id: 'service',
      label: 'Target Visa',
      render: (row) => SERVICES.find((s) => s.id === row.serviceId)?.name || row.serviceId,
    },
    {
      id: 'package',
      label: 'Selected Package',
      render: (row) => PACKAGES.find((p) => p.id === row.packageId)?.name || row.packageId,
    },
    { id: 'status', label: 'Financial Status', sortable: true },
    { id: 'visaStatus', label: 'Case Status', sortable: true },
    {
      id: 'assignedConsultant',
      label: 'Case Manager',
      render: (row) => {
        const c = consultants.find((cons) => cons.id === row.assignedConsultantId);
        return c ? c.name : 'Unknown';
      },
    },
  ];



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
        title="Operations Client Registry"
        subtitle="Track onboarding contracts, payment schedules, and visa application submission lifecycles."
        action={
          !isViewOnly && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
            >
              Add New Client
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
              borderRadius: '12px 0 0 12px',
            }
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
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
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

      {/* Date Filter Row */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mr: 0.5 }}>Date Filter:</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 0.5, bgcolor: 'background.paper' }}>
          {[
            { label: 'Today', key: 'today' },
            { label: '7D', key: '7d' },
            { label: '30D', key: '30d' },
            { label: 'All', key: 'all' },
          ].map(preset => {
            const todayStr = new Date().toISOString().split('T')[0];
            const sevenDaysAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const isActive =
              preset.key === 'today' ? startDate === todayStr && endDate === todayStr :
              preset.key === '7d' ? startDate === sevenDaysAgoStr && endDate === todayStr :
              preset.key === '30d' ? startDate === thirtyDaysAgoStr && endDate === todayStr :
              preset.key === 'all' ? !startDate && !endDate : false;
            return (
              <Button
                key={preset.key}
                size="small"
                variant={isActive ? 'contained' : 'text'}
                color={isActive ? 'primary' : 'inherit'}
                onClick={() => {
                  if (preset.key === 'today') {
                    setStartDate(todayStr);
                    setEndDate(todayStr);
                  } else if (preset.key === '7d') {
                    setStartDate(sevenDaysAgoStr);
                    setEndDate(todayStr);
                  } else if (preset.key === '30d') {
                    setStartDate(thirtyDaysAgoStr);
                    setEndDate(todayStr);
                  } else {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                sx={{ minWidth: 0, px: 1.5, py: 0.5, fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5 }}
              >
                {preset.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap', width: '100%' }}>
          <Box sx={{ width: { xs: '100%', md: '320px' }, display: 'flex', alignItems: 'center' }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search by Name, ID, Visa, Status..."
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <FilterPanel
              filters={filters}
              onFilterChange={(key, val) => setFilters((prev) => {
                const nextFilters = { ...prev, [key]: val };
                sessionStorage.setItem('operationsClientList_filters', JSON.stringify(nextFilters));
                return nextFilters;
              })}
              onClearFilters={() => {
                setFilters({ serviceId: '', status: '', assignedConsultantId: '' });
                setStartDate('');
                setEndDate('');
                setCardInfo(null);
                sessionStorage.removeItem('operationsClientList_filters');
                sessionStorage.removeItem('operationsClientList_cardInfo');
              }}
              statusOptions={clientStatuses}
            />
          </Box>
        </Box>

        <AppTable
          columns={columns}
          context="clients"
          data={paginatedClients}
          count={filteredClients.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={isLoading}
          maxHeight="calc(100vh - 250px)"
          onRowClick={(row) => navigate(`/operations/clients/details/${row.id}`)}
          actions={(row) => (
            <Tooltip title="View Customer Profile">
              <IconButton size="small" onClick={() => navigate(`/operations/clients/details/${row.id}`)} color="primary">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        />
      </Box>

      {/* MODAL: Add New Client */}
      <AppModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Onboard New Client"
        maxWidth="md"
        actions={
          <>
            <Button onClick={() => setAddModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleCreateClient, handleInvalid)}
              variant="contained"
              color="secondary"
              disabled={createClientMutation.isPending}
            >
              Onboard Client
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
                <TextField {...register('nationality')} label="Nationality" error={!!errors.nationality} helperText={errors.nationality?.message} sx={{ flex: 1 }} />
                <TextField {...register('preferredLanguage')} label="Preferred Language" error={!!errors.preferredLanguage} helperText={errors.preferredLanguage?.message} sx={{ flex: 1 }} />
              </Box>
            </Box>

            {/* Right Column: Case / Package Info */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ borderBottom: '2px solid', borderColor: 'secondary.main', pb: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Visa & Contract Setup
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

              <FormControl fullWidth size="small" error={!!errors.packageId}>
                <InputLabel id="package-id-label">Select Package</InputLabel>
                <Select
                  labelId="package-id-label"
                  {...register('packageId')}
                  value={watchPackageId || ''}
                  label="Select Package"
                >
                  {PACKAGES.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.packageId && (
                  <FormHelperText>{errors.packageId.message}</FormHelperText>
                )}
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  {...register('applicantsCount')}
                  type="number"
                  label="Number of Applicants"
                  error={!!errors.applicantsCount}
                  helperText={errors.applicantsCount?.message}
                  sx={{ flex: 1 }}
                />

                <FormControl sx={{ flex: 1 }} size="small" error={!!errors.assignedConsultantId}>
                  <InputLabel id="consultant-label">Assigned Agent</InputLabel>
                  <Select
                    labelId="consultant-label"
                    {...register('assignedConsultantId')}
                    value={watchConsultantId || ''}
                    label="Assigned Agent"
                    disabled={clientsActions.canAssignCaseManager === false}
                  >
                    {consultants.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.assignedConsultantId && (
                    <FormHelperText>{errors.assignedConsultantId.message}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <FormControl fullWidth size="small" error={!!errors.status}>
                <InputLabel id="status-label">Billing / Onboarding Status</InputLabel>
                <Select
                  labelId="status-label"
                  {...register('status')}
                  value={watchStatus || ''}
                  label="Billing / Onboarding Status"
                >
                  {clientStatuses.map((st) => (
                    <MenuItem key={st} value={st}>
                      {st}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status.message}</FormHelperText>
                )}
              </FormControl>

            </Box>
          </Box>

          {/* Full-width row: Profile Summary spans both columns */}
          <TextField
            {...register('profileSummary')}
            label="Profile Summary & Notes"
            multiline
            rows={3}
            fullWidth
            placeholder="Enter client background details, immigration goals, contract/payment notes..."
          />
        </Box>
      </AppModal>
    </Box>
  );
};

export default OperationsClientList;
