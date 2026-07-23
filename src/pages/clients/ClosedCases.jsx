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

export const ClosedCases = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { isAdmin, isOperations, currentUser } = useAuth();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(() => {
    const savedFiltersStr = sessionStorage.getItem('adminClientList_filters');
    const savedFilters = savedFiltersStr ? JSON.parse(savedFiltersStr) : null;

    const status = location.state?.filterStatus !== undefined
      ? location.state.filterStatus
      : (savedFilters?.status || '');

    const assignedConsultantId = location.state?.filterConsultantId !== undefined
      ? location.state.filterConsultantId
      : (savedFilters?.assignedConsultantId || '');

    return {
      serviceId: savedFilters?.serviceId || '',
      status,
      assignedConsultantId
    };
  });
  const [cardInfo, setCardInfo] = useState(() => {
    const savedCardInfoStr = sessionStorage.getItem('adminClientList_cardInfo');
    const savedCardInfo = savedCardInfoStr ? JSON.parse(savedCardInfoStr) : null;
    return location.state?.cardInfo || savedCardInfo || null;
  });

  useEffect(() => {
    if (location.state) {
      if (location.state.resetFilters) {
        setFilters({
          serviceId: '',
          status: '',
          assignedConsultantId: ''
        });
        setCardInfo(null);
        sessionStorage.removeItem('adminClientList_filters');
        sessionStorage.removeItem('adminClientList_cardInfo');
        navigate(location.pathname, { replace: true, state: {} });
      } else if (
        location.state.filterStatus !== undefined ||
        location.state.filterConsultantId !== undefined ||
        location.state.cardInfo !== undefined
      ) {
        setFilters((prev) => {
          const nextFilters = {
            ...prev,
            status: location.state.filterStatus !== undefined ? location.state.filterStatus : prev.status,
            assignedConsultantId: location.state.filterConsultantId !== undefined ? location.state.filterConsultantId : prev.assignedConsultantId,
          };
          sessionStorage.setItem('adminClientList_filters', JSON.stringify(nextFilters));
          return nextFilters;
        });
        if (location.state.cardInfo) {
          setCardInfo(location.state.cardInfo);
          sessionStorage.setItem('adminClientList_cardInfo', JSON.stringify(location.state.cardInfo));
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

  // Filter Logic
  const filteredClients = clients
    .filter((client) => client.visaStatus === 'Closed' || client.visaStatus === 'Rejected' || client.status === 'Completed')
    .filter((client) => {
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());

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
      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2, color: 'text.secondary', display: 'inline-flex' }}
      >
        Back to Dashboard
      </Button>
      <PageHeader
        title="Closed Cases Archive"
        subtitle="View archived clients who have completed the process or have been rejected."
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
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
              onFilterChange={(key, val) => setFilters((prev) => {
                const nextFilters = { ...prev, [key]: val };
                sessionStorage.setItem('adminClientList_filters', JSON.stringify(nextFilters));
                return nextFilters;
              })}
              onClearFilters={() => {
                setFilters({ serviceId: '', status: '', assignedConsultantId: '' });
                setCardInfo(null);
                sessionStorage.removeItem('adminClientList_filters');
                sessionStorage.removeItem('adminClientList_cardInfo');
              }}
              statusOptions={clientStatuses}
            />
          </Box>
        </Box>

        <AppTable
          columns={columns}
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
          onRowClick={(row) => {
            if (isAdmin) navigate(`/admin/clients/details/${row.id}`);
            else if (isOperations) navigate(`/operations/clients/details/${row.id}`);
            else navigate(`/agent/clients/details/${row.id}`);
          }}
          actions={(row) => (
            <Tooltip title="View Customer Profile">
              <IconButton size="small" onClick={() => {
                if (isAdmin) navigate(`/admin/clients/details/${row.id}`);
                else if (isOperations) navigate(`/operations/clients/details/${row.id}`);
                else navigate(`/agent/clients/details/${row.id}`);
              }} color="primary">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        />
      </Box>

    </Box>
  );
};

export default ClosedCases;
