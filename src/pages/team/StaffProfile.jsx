import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

// Icons
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import AppCard from '../../components/AppCard';
import AppTable from '../../components/AppTable';
import StatusBadge from '../../components/StatusBadge';
import { SERVICES } from '../../constants/mockData';

export const StaffProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch consultants dynamically
  const { data: consultants = [], isLoading: isConsultantsLoading } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants });

  // Find consultant details
  const c = consultants.find((cons) => cons.id === id);

  // Fetch clients & leads
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients });

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations });

  if (!c) {
    if (isConsultantsLoading || isClientsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      );
    }
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Consultant not found</Typography>
        <Button startIcon={<KeyboardArrowLeftIcon />} onClick={() => navigate('/team')} sx={{ mt: 2 }}>
          Back to Team List
        </Button>
      </Box>
    );
  }

  // Linked cases
  const assignedClients = clients.filter((client) => client.assignedConsultantId === c.id);
  const assignedConsultations = consultations.filter((cons) => cons.assignedConsultantId === c.id);

  const clientColumns = [
    { id: 'id', label: 'Client ID', minWidth: 95 },
    { id: 'name', label: 'Client Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { id: 'nationality', label: 'Nationality' },
    {
      id: 'service',
      label: 'Target Visa',
      render: (row) => SERVICES.find((s) => s.id === row.serviceId)?.name || row.serviceId },
    { id: 'visaStatus', label: 'Visa Progress' },
  ];

  return (
    <Box>
      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate('/consultants')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Consultants
      </Button>

      <PageHeader
        title={`${c.name}`}
        subtitle="Review staff performance metrics, cases load, and linguistic capabilities."
      />

      <Box className="grid grid-cols-12 gap-2" sx={{ mb: 4 }}>
        {/* Profile Card left */}
        <Box className="col-span-12 md:col-span-4">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', textAlign: 'center' }}>
            <Avatar src={c.avatar} sx={{ width: 100, height: 100, mx: 'auto', mb: 2, flexShrink: 0 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{c.name}</Typography>
            <Typography
              variant="body2"
              component="a"
              href={`mailto:${c.email}`}
              title={c.email}
              sx={{
                mb: 2,
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
                px: 1,
                boxSizing: 'border-box',
                color: 'secondary.main',
                textDecoration: 'none',
                display: 'block',
                '&:hover': {
                  textDecoration: 'underline' } }}
            >
              {c.email}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
              {c.languages.map((l) => (
                <Chip key={l} label={l} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" align="left" sx={{ fontStyle: 'italic', color: 'text.secondary', p: 1 }}>
              "{c.bio}"
            </Typography>
          </Paper>
        </Box>

        {/* Stats and assigned cases right */}
        <Box className="col-span-12 md:col-span-8">
          <Box className="grid grid-cols-12 gap-2" sx={{ mb: 3 }}>
            <Box className="col-span-12 sm:col-span-6">
              <Paper 
                sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => navigate('/clients')}
              >
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.neutral', color: 'secondary.main' }}>
                  <AssignmentTurnedInIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Cases Handled</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{c.casesCount} Active</Typography>
                </Box>
              </Paper>
            </Box>

            <Box className="col-span-12 sm:col-span-6">
              <Paper 
                sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => navigate('/consultations')}
              >
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.neutral', color: 'accent.main' }}>
                  <EmojiEventsIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Conversion Rate</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{c.conversionRate}% Success</Typography>
                </Box>
              </Paper>
            </Box>

            <Box className="col-span-12 sm:col-span-6">
              <Paper 
                sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => navigate('/payments')}
              >
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.neutral', color: 'success.main' }}>
                  <PaymentsIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Monthly Agent Commission Earned</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>€{Math.round(c.revenueGenerated * 0.1 * 0.25).toLocaleString()}</Typography>
                </Box>
              </Paper>
            </Box>

            <Box className="col-span-12 sm:col-span-6">
              <Paper 
                sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => navigate('/payments')}
              >
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.neutral', color: 'warning.main' }}>
                  <PaymentsIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Total Commission Since Joining</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>€{Math.round(c.revenueGenerated * 0.1).toLocaleString()}</Typography>
                </Box>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AppCard title="Active Client Portfolio" noPadding>
              <AppTable
                columns={clientColumns}
                data={assignedClients}
                onRowClick={(row) => navigate(`/clients/details/${row.id}`)}
              />
            </AppCard>

            <AppCard title="Assigned Consultation schedule">
              {assignedConsultations.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                  No consultations booked for this officer.
                </Typography>
              ) : (
                assignedConsultations.map((cons) => (
                  <Paper
                    key={cons.id}
                    sx={{
                      p: 1.8,
                      mb: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{cons.clientName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cons.meetingDate} at {cons.meetingTime} | Status: {cons.status}
                      </Typography>
                    </Box>
                    <Button size="small" onClick={() => navigate(`/consultations/details/${cons.id}`)}>
                      Session Outcome
                    </Button>
                  </Paper>
                ))
              )}
            </AppCard>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StaffProfile;
