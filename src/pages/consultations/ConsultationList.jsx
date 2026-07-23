import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

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

  const filteredConsultations = consultations.filter((cons) => {
    const nameMatch = cons.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filters.status ? cons.status === filters.status : true;
    const matchConsultant = filters.assignedConsultantId ? cons.assignedConsultantId === filters.assignedConsultantId : true;
    return nameMatch && matchStatus && matchConsultant;
  });

  const paginatedConsultations = filteredConsultations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columns = [
    { id: 'id', label: 'Meeting ID', minWidth: 100 },
    { id: 'clientName', label: 'Client / Lead Name', sortable: true },
    {
      id: 'meetingDate',
      label: 'Date & Time',
      sortable: true,
      render: (row) => `${row.meetingDate} at ${row.meetingTime} (${row.durationMinutes} min)` },
    {
      id: 'consultant',
      label: 'Assigned Agent',
      render: (row) => {
        const c = consultants.find((cons) => cons.id === row.assignedConsultantId);
        return c ? c.name : 'Unknown';
      } },
    {
      id: 'meetingLink',
      label: 'Video Meeting Link',
      render: (row) => (
        <Link href={row.meetingLink} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
          <VideoCallIcon fontSize="small" /> Join Meeting
        </Link>
      ) },
    { id: 'status', label: 'Status', sortable: true },
  ];

  const statusOptions = ['Scheduled', 'Completed', 'No Show', 'Cancelled'];

  return (
    <Box>
      <PageHeader
        title="Meeting / Consultation Pipeline"
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

