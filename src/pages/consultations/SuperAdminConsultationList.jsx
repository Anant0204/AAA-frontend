import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import useAuth from '../../hooks/useAuth';

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import StatusBadge from '../../components/StatusBadge';
import AppTable from '../../components/AppTable';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';

export const SuperAdminConsultationList = () => {
  const { currentUser, isViewOnlyMenu } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Consultations');

  const getRolePrefix = () => {
    if (!currentUser) return 'super_admin';
    if (currentUser.role === 'consultant') return 'agent';
    return currentUser.role;
  };

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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(() => {
    const savedFiltersStr = sessionStorage.getItem('consultationList_filters');
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
    const savedCardInfoStr = sessionStorage.getItem('consultationList_cardInfo');
    const savedCardInfo = savedCardInfoStr ? JSON.parse(savedCardInfoStr) : null;
    return location.state?.cardInfo || savedCardInfo || null;
  });

  const [startDate, setStartDate] = useState(() => {
    return location.state?.startDate || '';
  });
  const [endDate, setEndDate] = useState(() => {
    return location.state?.endDate || '';
  });
  const mockToday = dayjs().format('YYYY-MM-DD'); // Mock current date

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
        sessionStorage.removeItem('consultationList_filters');
        sessionStorage.removeItem('consultationList_cardInfo');
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
          sessionStorage.setItem('consultationList_filters', JSON.stringify(nextFilters));
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
          sessionStorage.setItem('consultationList_cardInfo', JSON.stringify(location.state.cardInfo));
        }
      }
    }
  }, [location.state, navigate, location.pathname]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Fetch consultations
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations });

  // Fetch consultants dynamically
  const { data: consultantsList = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents });

  // Fetch dynamic stages
  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages
  });

  // Fetch Auto-Assign Toggle Setting
  const { data: autoAssignEnabled = true } = useQuery({
    queryKey: ['auto-assign-setting'],
    queryFn: dbService.getAutoAssignSetting
  });

  // Mutations
  const toggleAutoAssignMutation = useMutation({
    mutationFn: dbService.toggleAutoAssignSetting,
    onSuccess: (newVal) => {
      queryClient.invalidateQueries({ queryKey: ['auto-assign-setting'] });
      showAlert(`Auto-Assignment toggle is now ${newVal ? 'ENABLED' : 'DISABLED'}`, 'info');
    }
  });

  const assignAgentMutation = useMutation({
    mutationFn: ({ id, agentId }) => dbService.assignAgentToConsultation(id, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Consultant successfully assigned to meeting.', 'success');
      setAssignModalOpen(false);
      setSelectedAgentId('');
    }
  });

  const completeMeetingMutation = useMutation({
    mutationFn: dbService.completeConsultationAndUnlockDocs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Consultation marked completed. Client document portal unlocked!', 'success');
    }
  });

  // Filters
  const filteredConsultations = consultations.filter((cons) => {
    if (!filterByDate(cons.date || cons.meetingDate, startDate, endDate)) return false;

    const nameMatch = cons.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filters.status ? cons.status === filters.status : true;
    const matchConsultant = filters.assignedConsultantId ? cons.assignedConsultantId === filters.assignedConsultantId : true;
    const matchService = filters.serviceId ? cons.serviceId === filters.serviceId : true;
    return nameMatch && matchStatus && matchConsultant && matchService;
  });

  const paginatedConsultations = filteredConsultations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenAssignModal = (meetingId) => {
    setSelectedMeetingId(meetingId);
    setAssignModalOpen(true);
  };

  const handleAssignAgent = () => {
    if (!selectedAgentId) {
      showAlert('Please select an agent.', 'warning');
      return;
    }
    assignAgentMutation.mutate({ id: selectedMeetingId, agentId: selectedAgentId });
  };

  const columns = [
    { id: 'id', label: 'Meeting ID', minWidth: 90 },
    { id: 'clientName', label: 'Client / Lead Name', sortable: true, render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.clientName}</Typography> },
    {
      id: 'meetingDate',
      label: 'Date & Time',
      sortable: true,
      render: (row) => `${row.meetingDate} at ${row.meetingTime} (${row.durationMinutes} min)` },
    {
      id: 'consultant',
      label: 'Assigned Agent',
      render: (row) => {
        const canEdit = !isViewOnly && ['super_admin', 'admin', 'operations'].includes(currentUser?.role);
        if (canEdit) {
          return (
            <Select
              value={row.assignedConsultantId === 'unassigned' ? '' : row.assignedConsultantId}
              onChange={(e) => {
                const newAgentId = e.target.value;
                if (newAgentId) {
                  assignAgentMutation.mutate({ id: row.id, agentId: newAgentId });
                }
              }}
              displayEmpty
              size="small"
              sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                minWidth: 150,
                bgcolor: 'background.paper',
                borderRadius: 1.5,
              }}
            >
              <MenuItem value="" disabled>
                <em>Awaiting Agent</em>
              </MenuItem>
              {consultantsList.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.casesCount || 0} cases)
                </MenuItem>
              ))}
            </Select>
          );
        }
        const c = consultantsList.find((cons) => cons.id === row.assignedConsultantId);
        return c ? <Typography sx={{ fontWeight: 600 }}>{c.name}</Typography> : 'Unknown';
      } },
    {
      id: 'meetingLink',
      label: 'Video Meeting Link',
      render: (row) => {
        if (row.status === 'Pending Assignment') {
          return <Typography variant="caption" color="text.secondary">Waiting for assignment</Typography>;
        }
        return row.meetingLink ? (
          <Link href={row.meetingLink} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
            <VideoCallIcon fontSize="small" /> Join Call
          </Link>
        ) : '-';
      } },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.status} />
      )
    },
  ];

  const consultationStages = leadStages.filter(s => s.type === 'consultation').map(s => s.name);
  const statusOptions = ['Pending Assignment', ...(consultationStages.length > 0 ? consultationStages : ['Scheduled', 'Completed', 'No Show', 'Cancelled'])];

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
        title="Meeting / Consultation Pipeline"
        subtitle="Manage client schedules, configure auto-agent assignment switches, and confirm document portal access."
        action={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {!isViewOnly && (
              <Paper variant="outlined" sx={{ px: 2, py: 0.5, borderRadius: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoAssignEnabled}
                      onChange={() => toggleAutoAssignMutation.mutate()}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>AUTO-ASSIGN AGENTS</Typography>}
                />
              </Paper>
            )}
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CalendarTodayIcon />}
              onClick={() => navigate('/consultations/calendar')}
            >
              Open Scheduler
            </Button>
          </Box>
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
                  vs yesterday
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap', width: '100%' }}>
          <Box sx={{ width: { xs: '100%', md: '320px' }, display: 'flex', alignItems: 'center' }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search meetings..."
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <FilterPanel
              filters={filters}
              onFilterChange={(key, val) => setFilters((prev) => {
                const nextFilters = { ...prev, [key]: val };
                sessionStorage.setItem('consultationList_filters', JSON.stringify(nextFilters));
                return nextFilters;
              })}
              onClearFilters={() => {
                setFilters({ serviceId: '', status: '', assignedConsultantId: '' });
                setStartDate('');
                setEndDate('');
                setCardInfo(null);
                sessionStorage.removeItem('consultationList_filters');
                sessionStorage.removeItem('consultationList_cardInfo');
              }}
              statusOptions={statusOptions}
            />
          </Box>
        </Box>

        <AppTable
          columns={columns}
          data={paginatedConsultations}
          count={filteredConsultations.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          loading={isLoading}
          maxHeight="calc(100vh - 250px)"
          actions={(row) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {row.status === 'Pending Assignment' && (
                <Tooltip title="Assign Consultant Manual">
                  <IconButton size="small" onClick={() => handleOpenAssignModal(row.id)} color="warning">
                    <AssignmentIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {row.status === 'Scheduled' && (
                <Tooltip title="Mark Completed & Unlock Portal Uploads">
                  <IconButton size="small" onClick={() => completeMeetingMutation.mutate(row.id)} color="success">
                    <LockOpenIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="View Meeting Outcomes">
                <IconButton size="small" onClick={() => navigate(`/${getRolePrefix()}/consultations/details/${row.id}`)} color="primary">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        />
      </Box>

      {/* Modal: Manual Agent Assignment */}
      <AppModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Agent to Consultation Call"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="agent-assignment-label">Select Agent</InputLabel>
            <Select
              labelId="agent-assignment-label"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              label="Select Agent"
            >
              {consultantsList.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name} ({(a.languages || []).join('/')}) | {a.casesCount || 0} active cases
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handleAssignAgent}>
            Assign Agent
          </Button>
        </Box>
      </AppModal>
    </Box>
  );
};

export default SuperAdminConsultationList;
