import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

// Services & Components
import PageHeader from '../../components/PageHeader';
import AppTable from '../../components/AppTable';
import { dbService } from '../../services/dbService';

export const AllAgentsPerformance = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents,
  });

  const { data: allClients = [] } = useQuery({ queryKey: ['clients'], queryFn: dbService.getClients });
  const { data: allConsultations = [] } = useQuery({ queryKey: ['consultations'], queryFn: dbService.getConsultations });
  const { data: allPayments = [] } = useQuery({ queryKey: ['payments'], queryFn: dbService.getPayments });

  // Table Column Definitions
  const columns = [
    {
      id: 'agent',
      label: 'Agent Details',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={row.avatar} alt={row.name} size="small" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { id: 'role', label: 'Role', render: (row) => row.role === 'admin' ? 'Management' : 'Agent' },
    {
      id: 'activeCases',
      label: 'Active Cases',
      render: (row) => {
        const clientCases = allClients.filter((c) => c.assignedConsultantId === row.id);
        const activeCount = clientCases.filter((c) => c.status !== 'Completed' && c.visaStatus !== 'Approved').length;
        return activeCount;
      },
    },
    {
      id: 'closedCases',
      label: 'Closed Cases',
      render: (row) => {
        const clientCases = allClients.filter((c) => c.assignedConsultantId === row.id);
        const closedCount = clientCases.filter((c) => c.status === 'Completed' || c.visaStatus === 'Approved').length;
        return closedCount;
      },
    },
    {
      id: 'totalMeetings',
      label: 'Total Meetings',
      render: (row) => {
        const meetingsCount = allConsultations.filter((c) => c.assignedConsultantId === row.id).length;
        return meetingsCount;
      },
    },
    {
      id: 'conversion',
      label: 'Conv. Rate (%)',
      render: (row) => {
        const meetings = allConsultations.filter((c) => c.assignedConsultantId === row.id);
        const clientCases = allClients.filter((c) => c.assignedConsultantId === row.id);
        const closed = clientCases.filter((c) => c.status === 'Completed' || c.visaStatus === 'Approved').length;
        const rate = meetings.length > 0 ? Math.round((closed / meetings.length) * 100) : 0;
        return `${rate}%`;
      },
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      render: (row) => {
        const clientIds = allClients.filter((c) => c.assignedConsultantId === row.id).map((c) => c.id);
        const paidPayments = allPayments.filter((p) => clientIds.includes(p.clientId) && p.status === 'Paid');
        const revenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        return `€${revenue.toLocaleString()}`;
      },
    },
    {
      id: 'commission',
      label: 'Commission (10%)',
      render: (row) => {
        const clientIds = allClients.filter((c) => c.assignedConsultantId === row.id).map((c) => c.id);
        const paidPayments = allPayments.filter((p) => clientIds.includes(p.clientId) && p.status === 'Paid');
        const revenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const commission = Math.round(revenue * 0.1);
        return `€${commission.toLocaleString()}`;
      },
    },
  ];

  // Filter agents by search term and role
  const filteredAgents = agents.filter((agent) =>
    agent.role === 'consultant' && (
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <PageHeader
        title="Agents Performance Leaderboard"
        subtitle="Compare business metrics, cases closed, total meetings completed, and earned commission percentages."
      />

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Performance Metrics Leaderboard
          </Typography>

          <TextField
            size="small"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 260 }}
          />
        </Box>

        <AppTable
          columns={columns}
          data={filteredAgents}
          isLoading={isLoading}
          maxHeight="calc(100vh - 280px)"
        />
      </Paper>
    </Box>
  );
};

export default AllAgentsPerformance;
