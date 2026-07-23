import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';


import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import AppTable from '../../components/AppTable';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { SERVICES, PACKAGES } from '../../constants/mockData';

export const AdminClosedCases = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isOperations } = useAuth();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    serviceId: '',
    status: '',
    assignedConsultantId: ''
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('onboardingDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeFilterStatus, setActiveFilterStatus] = useState(null);

  // Fetch Clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients
  });

  // Fetch Consultants dynamically
  const { data: consultants = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants
  });

  // The 5 Closed Case Statuses
  const CLOSED_STATUSES = [
    'Visa Approved',
    'Visa Rejected',
    'Client Withdrawn',
    'Refund Completed',
    'Case Cancelled'
  ];

  // Map old mock data to new statuses for demo purposes if they don't exactly match
  const getNormalizedStatus = (client) => {
    if (client.visaStatus === 'Visa Approved') return 'Visa Approved';
    if (client.visaStatus === 'Rejected' || client.status === 'Rejected' || client.visaStatus === 'Visa Rejected') return 'Visa Rejected';
    if (client.visaStatus === 'Client Withdraw' || client.visaStatus === 'Client Withdrawn') return 'Client Withdrawn';
    if (client.visaStatus === 'Refund Completed') return 'Refund Completed';
    if (client.visaStatus === 'Case Canceled' || client.visaStatus === 'Case Cancelled') return 'Case Cancelled';
    if (client.status === 'Completed' && client.visaStatus !== 'Visa Approved') return 'Visa Approved';
    if (CLOSED_STATUSES.includes(client.visaStatus)) return client.visaStatus;
    if (CLOSED_STATUSES.includes(client.status)) return client.status;

    if (client.visaStatus === 'Closed') return 'Case Cancelled';

    return null;
  };

  const allClosedCases = clients.filter(client => {
    const status = getNormalizedStatus(client);
    return status !== null;
  }).map(client => ({
    ...client,
    displayStatus: getNormalizedStatus(client)
  }));

  const stats = {
    'Visa Approved': allClosedCases.filter(c => c.displayStatus === 'Visa Approved').length,
    'Visa Rejected': allClosedCases.filter(c => c.displayStatus === 'Visa Rejected').length,
    'Client Withdrawn': allClosedCases.filter(c => c.displayStatus === 'Client Withdrawn').length,
    'Refund Completed': allClosedCases.filter(c => c.displayStatus === 'Refund Completed').length,
    'Case Cancelled': allClosedCases.filter(c => c.displayStatus === 'Case Cancelled').length
  };

  // Filter Logic
  const filteredClients = allClosedCases
    .filter((client) => {
      // If a card is clicked, filter by that status
      if (activeFilterStatus && client.displayStatus !== activeFilterStatus) return false;

      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchService = filters.serviceId ? client.serviceId === filters.serviceId : true;
      const matchStatus = filters.status ? client.displayStatus === filters.status : true;
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
      render: (row) => `${row.firstName} ${row.lastName}`
    },
    { id: 'nationality', label: 'Nationality', sortable: true },
    {
      id: 'service',
      label: 'Target Visa',
      render: (row) => SERVICES.find((s) => s.id === row.serviceId)?.name || row.serviceId
    },
    { id: 'displayStatus', label: 'Closed Status', sortable: true },
    {
      id: 'assignedConsultant',
      label: 'Case Manager',
      render: (row) => {
        const c = consultants.find((cons) => cons.id === row.assignedConsultantId);
        return c ? c.name : 'Unknown';
      }
    },
  ];

  const handleCardClick = (status) => {
    if (activeFilterStatus === status) {
      setActiveFilterStatus(null); // toggle off
    } else {
      setActiveFilterStatus(status);
    }
  };

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

      <Box className="grid grid-cols-2 md:grid-cols-5 gap-3" sx={{ mb: 4 }}>
        <Box className="col-span-1" onClick={() => handleCardClick('Visa Approved')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transform: activeFilterStatus === 'Visa Approved' ? 'scale(1.02)' : 'none', transition: 'all 0.2s', opacity: activeFilterStatus && activeFilterStatus !== 'Visa Approved' ? 0.5 : 1 }}>
          <StatCard title="Visa Approved" value={stats['Visa Approved']} icon={<CheckCircleOutlinedIcon />} color="#10B981" />
        </Box>
        <Box className="col-span-1" onClick={() => handleCardClick('Visa Rejected')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transform: activeFilterStatus === 'Visa Rejected' ? 'scale(1.02)' : 'none', transition: 'all 0.2s', opacity: activeFilterStatus && activeFilterStatus !== 'Visa Rejected' ? 0.5 : 1 }}>
          <StatCard title="Visa Rejected" value={stats['Visa Rejected']} icon={<CancelOutlinedIcon />} color="#EF4444" />
        </Box>
        <Box className="col-span-1" onClick={() => handleCardClick('Client Withdrawn')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transform: activeFilterStatus === 'Client Withdrawn' ? 'scale(1.02)' : 'none', transition: 'all 0.2s', opacity: activeFilterStatus && activeFilterStatus !== 'Client Withdrawn' ? 0.5 : 1 }}>
          <StatCard title="Client Withdrawn" value={stats['Client Withdrawn']} icon={<PersonRemoveOutlinedIcon />} color="#F59E0B" />
        </Box>
        <Box className="col-span-1" onClick={() => handleCardClick('Refund Completed')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transform: activeFilterStatus === 'Refund Completed' ? 'scale(1.02)' : 'none', transition: 'all 0.2s', opacity: activeFilterStatus && activeFilterStatus !== 'Refund Completed' ? 0.5 : 1 }}>
          <StatCard title="Refund Completed" value={stats['Refund Completed']} icon={<CurrencyExchangeOutlinedIcon />} color="#3B82F6" />
        </Box>
        <Box className="col-span-2 md:col-span-1" onClick={() => handleCardClick('Case Cancelled')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transform: activeFilterStatus === 'Case Cancelled' ? 'scale(1.02)' : 'none', transition: 'all 0.2s', opacity: activeFilterStatus && activeFilterStatus !== 'Case Cancelled' ? 0.5 : 1 }}>
          <StatCard title="Case Cancelled" value={stats['Case Cancelled']} icon={<BlockOutlinedIcon />} color="#6B7280" />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap', width: '100%' }}>
          <Box sx={{ width: { xs: '100%', md: '320px' }, display: 'flex', alignItems: 'center' }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search by ID, Name, Email..."
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <FilterPanel
              filters={filters}
              onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
              onClearFilters={() => {
                setFilters({ serviceId: '', status: '', assignedConsultantId: '' });
                setActiveFilterStatus(null);
              }}
              statusOptions={CLOSED_STATUSES}
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

export default AdminClosedCases;
