import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
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

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import AppTable from '../../components/AppTable';
import StatCard from '../../components/StatCard';
import { SERVICES, PACKAGES } from '../../constants/mockData';

export const InvoiceList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(() => {
    const savedFiltersStr = sessionStorage.getItem('invoiceList_filters');
    const savedFilters = savedFiltersStr ? JSON.parse(savedFiltersStr) : null;
    const isFromDashboard = location.state?.cardInfo !== undefined;

    const status = location.state?.filterStatus !== undefined
      ? location.state.filterStatus
      : (isFromDashboard ? '' : (savedFilters?.status || ''));

    return {
      serviceId: '',
      status,
      assignedConsultantId: ''
    };
  });
  const [cardInfo, setCardInfo] = useState(() => {
    const savedCardInfoStr = sessionStorage.getItem('invoiceList_cardInfo');
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
        sessionStorage.removeItem('invoiceList_filters');
        sessionStorage.removeItem('invoiceList_cardInfo');
        navigate(location.pathname, { replace: true, state: {} });
      } else if (
        location.state.filterStatus !== undefined ||
        location.state.cardInfo !== undefined ||
        location.state.startDate !== undefined
      ) {
        if (location.state.filterStatus !== undefined) {
          setFilters((prev) => {
            const nextFilters = { ...prev, status: location.state.filterStatus };
            sessionStorage.setItem('invoiceList_filters', JSON.stringify(nextFilters));
            return nextFilters;
          });
        }
        if (location.state.startDate !== undefined) {
          setStartDate(location.state.startDate);
        }
        if (location.state.endDate !== undefined) {
          setEndDate(location.state.endDate);
        }
        if (location.state.cardInfo) {
          setCardInfo(location.state.cardInfo);
          sessionStorage.setItem('invoiceList_cardInfo', JSON.stringify(location.state.cardInfo));
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

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments });

  const filteredInvoices = payments.filter((p) => {
    const dateToCheck = p.status === 'Paid' ? (p.paymentDate || p.dueDate) : p.dueDate;
    if (!filterByDate(dateToCheck, startDate, endDate)) return false;

    const matchSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filters.status ? p.status === filters.status : true;
    return matchSearch && matchStatus;
  });

  const paginatedInvoices = filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columns = [
    { id: 'id', label: 'Invoice ID', minWidth: 120 },
    { id: 'clientName', label: 'Client Name', sortable: true },
    {
      id: 'service',
      label: 'Pathway Service',
      render: (row) => SERVICES.find(s => s.id === row.serviceId)?.name || row.serviceId },
    {
      id: 'package',
      label: 'Relocation Package',
      render: (row) => PACKAGES.find(p => p.id === row.packageId)?.name || row.packageId || '-' },
    {
      id: 'total',
      label: 'Grand Total',
      render: (row) => `€${row.amount - row.discount}` },
    { id: 'billingDate', label: 'Billing Date', sortable: true },
    { id: 'dueDate', label: 'Due Date', sortable: true },
    { id: 'status', label: 'Payment Status', sortable: true },
  ];

  const statusOptions = ['Paid', 'Pending', 'Failed'];

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
        title="Account Invoices"
        subtitle="Manage billing transactions, client deposits, and VAT collections."
      />

      {cardInfo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            p: '12px 24px',
            borderRadius: 3,
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
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

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Search by client or invoice ID..."
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => {
                const nextFilters = { ...filters, status: e.target.value };
                setFilters(nextFilters);
                sessionStorage.setItem('invoiceList_filters', JSON.stringify(nextFilters));
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {(filters.status || startDate || endDate) && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => {
                setFilters({ status: '' });
                setStartDate('');
                setEndDate('');
                setCardInfo(null);
                sessionStorage.removeItem('invoiceList_filters');
                sessionStorage.removeItem('invoiceList_cardInfo');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <AppTable
          columns={columns}
          data={paginatedInvoices}
          count={filteredInvoices.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          loading={isLoading}
          maxHeight="calc(100vh - 250px)"
          onRowClick={(row) => navigate(`/payments/invoice-details/${row.id}`)}
          actions={(row) => (
            <Tooltip title="View Invoice Receipt">
              <IconButton size="small" onClick={() => navigate(`/payments/invoice-details/${row.id}`)} color="primary">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        />
      </Box>
    </Box>
  );
};

export default InvoiceList;

