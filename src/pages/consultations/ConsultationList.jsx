import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VideoCallIcon from '@mui/icons-material/VideoCall';

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import AppTable from '../../components/AppTable';


export const ConsultationList = () => {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ serviceId: '', status: '', assignedConsultantId: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch consultations
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations });

  // Fetch consultants dynamically
  const { data: consultants = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants });

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
    const nameMatch = cons.clientName ? cons.clientName.toLowerCase().includes(searchTerm.toLowerCase()) : true;

    let matchStatus = true;
    if (filters.status) {
      if (filters.status === 'Scheduled') {
        matchStatus = cons.status === 'Scheduled' || cons.status === 'Meeting Scheduled';
      } else if (filters.status === 'Completed') {
        matchStatus = cons.status === 'Completed' || cons.status === 'Meeting Completed';
      } else {
        matchStatus = cons.status === filters.status;
      }
    }

    const matchConsultant = filters.assignedConsultantId ? cons.assignedConsultantId === filters.assignedConsultantId : true;
    return nameMatch && matchStatus && matchConsultant;
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
        const c = consultants.find((cons) => cons.id === row.assignedConsultantId);
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

  const statusOptions = ['Scheduled', 'Completed', 'No Show', 'Cancelled'];

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
              onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
              onClearFilters={() => setFilters({ serviceId: '', status: '', assignedConsultantId: '' })}
              statusOptions={statusOptions}
              showServiceFilter={false}
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

export default ConsultationList;

