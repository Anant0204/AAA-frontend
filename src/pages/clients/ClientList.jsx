import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Icons
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import AppTable from '../../components/AppTable';
import AppModal from '../../components/AppModal';
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

export const ClientList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { isAdmin, isOperations, currentUser, isViewOnlyMenu } = useAuth();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Clients');

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ serviceId: '', status: '', assignedConsultantId: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Role-based scoping: consultants only see their own assigned clients
      if (!isAdmin && !isOperations && currentUser && currentUser.role === 'consultant') {
        if (client.assignedConsultantId !== currentUser.id) {
          return false;
        }
      }

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
    { id: 'status', label: 'Billing Status', sortable: true },
    { id: 'visaStatus', label: 'Immigration Progress', sortable: true },
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
      <PageHeader
        title="Client Registry"
        subtitle="Track onboarding contracts, payment schedules, and visa application submission lifecycles."
        action={
          (!isViewOnly && (isAdmin || isOperations)) && (
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap', width: '100%' }}>
          <Box sx={{ width: { xs: '100%', md: '320px' }, display: 'flex', alignItems: 'center' }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search clients..."
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <FilterPanel
              filters={filters}
              onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
              onClearFilters={() => setFilters({ serviceId: '', status: '', assignedConsultantId: '' })}
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
          actions={(row) => (
            <Tooltip title="View Customer Profile">
              <IconButton size="small" onClick={() => navigate(`/clients/details/${row.id}`)} color="primary">
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

export default ClientList;

