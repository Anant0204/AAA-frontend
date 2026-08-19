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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Chip from '@mui/material/Chip';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
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
import useAuth from '../../hooks/useAuth';
import { useAlert } from '../../contexts/AlertContext';

export const AdminConsultationList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isViewOnlyMenu } = useAuth();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Consultations');

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

    const cardTitle = location.state?.cardInfo?.title;
    const fallbackStatus = cardTitle === 'Upcoming Meetings' ? 'Scheduled' : (cardTitle === 'Completed Meetings' ? 'Completed' : '');

    const status = location.state?.filterStatus !== undefined
      ? location.state.filterStatus
      : (fallbackStatus || (savedFilters?.status || 'Scheduled'));

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

  const toUAEDateStr = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts).substring(0, 10);
    const uaeOffset = 4 * 60; // UTC+4 in minutes
    const localMs = d.getTime() + uaeOffset * 60 * 1000;
    const localDate = new Date(localMs);
    const y = localDate.getUTCFullYear();
    const m = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const filterByDate = (dateStr, start, end) => {
    if (!start && !end) return true;
    if (!dateStr) return false;
    const formatted = toUAEDateStr(dateStr);
    if (start && !end) return formatted === start;
    return formatted >= start && formatted <= end;
  };

  useEffect(() => {
    if (location.state) {
      if (location.state.resetFilters) {
        setFilters({
          serviceId: '',
          status: 'Scheduled',
          assignedConsultantId: ''
        });
        setStartDate('');
        setEndDate('');
        setCardInfo(null);
        sessionStorage.removeItem('consultationList_filters');
        sessionStorage.removeItem('consultationList_cardInfo');
      } else if (
        location.state.filterStatus !== undefined ||
        location.state.filterConsultantId !== undefined ||
        location.state.cardInfo !== undefined ||
        location.state.startDate !== undefined
      ) {
        const cardTitle = location.state?.cardInfo?.title;
        const targetStatus = location.state.filterStatus || (cardTitle === 'Completed Meetings' ? 'Completed' : (cardTitle === 'Upcoming Meetings' || cardTitle === 'Upcoming Calls' ? 'Scheduled' : 'Scheduled'));
        
        const nextFilters = {
          serviceId: '',
          status: targetStatus,
          assignedConsultantId: location.state.filterConsultantId || ''
        };
        
        setFilters(nextFilters);
        const isCompletedView = targetStatus === 'Completed';
        setStartDate(isCompletedView ? '' : (location.state.startDate !== undefined ? location.state.startDate : ''));
        setEndDate(isCompletedView ? '' : (location.state.endDate !== undefined ? location.state.endDate : ''));
        
        if (location.state.cardInfo) {
          setCardInfo(location.state.cardInfo);
          sessionStorage.setItem('consultationList_cardInfo', JSON.stringify(location.state.cardInfo));
        } else {
          setCardInfo(null);
          sessionStorage.removeItem('consultationList_cardInfo');
        }

        sessionStorage.setItem('consultationList_filters', JSON.stringify(nextFilters));
      }
    }
  }, [location.key, location.state]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Fetch consultations
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations
  });

  // Fetch consultants dynamically
  const { data: consultantsList = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants
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

  // Helper for Smart Chronological Sorting (Upcoming Active Meetings First)
  const getSortableTimestamp = (row) => {
    const dStr = row.meetingDate || row.date;
    const tStr = row.meetingTime || row.timeSlot;
    if (!dStr) return 999999999999999;
    
    const isoDate = dStr.includes('T') ? dStr.split('T')[0] : dStr;
    const todayStr = dayjs().format('YYYY-MM-DD');

    let timePart = '23:59';
    if (tStr && typeof tStr === 'string' && !tStr.toLowerCase().includes('tbd') && !tStr.toLowerCase().includes('flexible')) {
      const raw = tStr.split('-')[0].trim();
      const match = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        let hrs = parseInt(match[1], 10);
        const mins = parseInt(match[2], 10);
        const ampm = match[3] ? match[3].toUpperCase() : null;
        if (ampm === 'PM' && hrs < 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        timePart = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      }
    }

    const d = new Date(`${isoDate}T${timePart}:00`);
    const timeMs = isNaN(d.getTime()) ? 9999999999999 : d.getTime();

    const isCompletedOrCancelled = row.status === 'Completed' || row.status === 'Cancelled';
    const isUpcomingActive = isoDate >= todayStr && !isCompletedOrCancelled;

    return isUpcomingActive ? timeMs : (100000000000000 + timeMs);
  };

  // Filters & Chronological Sorting (Earlier appointments first)
  const filteredConsultations = consultations.filter((cons) => {
    if (!filterByDate(cons.date || cons.meetingDate, startDate, endDate)) return false;

    const nameMatch = cons.clientName ? cons.clientName.toLowerCase().includes(searchTerm.toLowerCase()) : true;

    let effectiveStatus = filters.status;
    if (!effectiveStatus) {
      const activeCardTitle = cardInfo?.title || location.state?.cardInfo?.title;
      if (activeCardTitle === 'Completed Meetings') {
        effectiveStatus = 'Completed';
      } else {
        effectiveStatus = 'Scheduled';
      }
    }

    let matchStatus = true;
    if (effectiveStatus === 'ALL') {
      matchStatus = true;
    } else if (effectiveStatus === 'Scheduled') {
      matchStatus = cons.status === 'Scheduled' || cons.status === 'Meeting Scheduled' || cons.status === 'Pending Assignment';
    } else if (effectiveStatus === 'Completed') {
      matchStatus = cons.status === 'Completed' || cons.status === 'Meeting Completed';
    } else if (effectiveStatus) {
      matchStatus = cons.status === effectiveStatus;
    }

    const matchConsultant = filters.assignedConsultantId ? cons.assignedConsultantId === filters.assignedConsultantId : true;
    const matchService = filters.serviceId ? cons.serviceId === filters.serviceId : true;
    return nameMatch && matchStatus && matchConsultant && matchService;
  }).sort((a, b) => getSortableTimestamp(a) - getSortableTimestamp(b));

  const paginatedConsultations = filteredConsultations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columns = [
    {
      id: 'visaType',
      label: 'Visa Type',
      render: (row) => (
        <Chip
          label={row.visaType || row.serviceType || 'Spain Visa'}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
      )
    },
    {
      id: 'clientName',
      label: 'Client Name',
      sortable: true,
      render: (row) => <Typography sx={{ fontWeight: 700, color: '#051A3B' }}>{row.clientName}</Typography>
    },
    {
      id: 'nationality',
      label: 'Nationality',
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{row.nationality || 'N/A'}</Typography>
    },
    {
      id: 'countryOfResidence',
      label: 'Country of Residence',
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{row.countryOfResidence || 'N/A'}</Typography>
    },
    {
      id: 'meetingDate',
      label: 'Date & Time',
      sortable: true,
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B' }}>
            📅 {(row.meetingDate || row.date) ? dayjs(row.meetingDate || row.date).format('DD/MM/YYYY') : 'TBD'}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563EB' }}>
            ⏰ {row.meetingTime || row.timeSlot || ''} {row.durationMinutes ? `(${row.durationMinutes} min)` : ''}
          </Typography>
        </Box>
      )
    },
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
        return c ? c.name : 'Unknown';
      }
    },
    {
      id: 'meetingLink',
      label: 'Video Meeting Link',
      render: (row) => (
        <Link href={row.meetingLink} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
          <VideoCallIcon fontSize="small" /> Join Meeting
        </Link>
      )
    },
    { id: 'status', label: 'Status', sortable: true },
  ];

  const getPageTitle = () => {
    let status = filters.status;
    if (!status && cardInfo?.title) {
      if (cardInfo.title === 'Completed Meetings') status = 'Completed';
      if (cardInfo.title === 'Upcoming Meetings' || cardInfo.title === 'Upcoming Calls') status = 'Scheduled';
    }
    if (status === 'Completed') return 'Completed Meetings';
    if (status === 'Scheduled') return 'Upcoming Meetings';
    if (status === 'Cancelled') return 'Cancelled Meetings';
    if (status === 'No Show' || status === 'NO_SHOW') return 'No Show Meetings';
    if (status === 'ALL') return 'All Meetings';
    if (cardInfo?.title) return cardInfo.title;
    return 'Upcoming Meetings';
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
        title={getPageTitle()}
        subtitle="Track Spain Visa assessments, eligibility consultations, and virtual meeting links."
        action={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CalendarTodayIcon />}
            onClick={() => navigate('/consultations/calendar')}
          >
            Open Scheduler
          </Button>
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
            const todayStr = toUAEDateStr(new Date());
            const isCompletedView = filters.status === 'Completed' || cardInfo?.title === 'Completed Meetings';
            const sevenDaysStr = isCompletedView
              ? toUAEDateStr(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
              : toUAEDateStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            const thirtyDaysStr = isCompletedView
              ? toUAEDateStr(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
              : toUAEDateStr(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

            const isActive =
              preset.key === 'today' ? startDate === todayStr && endDate === todayStr :
              preset.key === '7d' ? (isCompletedView ? (startDate === sevenDaysStr && endDate === todayStr) : (startDate === todayStr && endDate === sevenDaysStr)) :
              preset.key === '30d' ? (isCompletedView ? (startDate === thirtyDaysStr && endDate === todayStr) : (startDate === todayStr && endDate === thirtyDaysStr)) :
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
                    if (isCompletedView) {
                      setStartDate(sevenDaysStr);
                      setEndDate(todayStr);
                    } else {
                      setStartDate(todayStr);
                      setEndDate(sevenDaysStr);
                    }
                  } else if (preset.key === '30d') {
                    if (isCompletedView) {
                      setStartDate(thirtyDaysStr);
                      setEndDate(todayStr);
                    } else {
                      setStartDate(todayStr);
                      setEndDate(thirtyDaysStr);
                    }
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
              onFilterChange={(key, val) => {
                if (key === 'status') {
                  setCardInfo(null);
                  sessionStorage.removeItem('consultationList_cardInfo');
                }
                setFilters((prev) => {
                  const nextFilters = { ...prev, [key]: val };
                  sessionStorage.setItem('consultationList_filters', JSON.stringify(nextFilters));
                  return nextFilters;
                });
              }}
              onClearFilters={() => {
                setFilters({ serviceId: '', status: 'Scheduled', assignedConsultantId: '' });
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
            <Tooltip title="View Meeting Outcomes">
              <IconButton size="small" onClick={() => navigate(`/consultations/details/${row.id}`)} color="primary">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        />
      </Box>
    </Box>
  );
};

export default AdminConsultationList;

