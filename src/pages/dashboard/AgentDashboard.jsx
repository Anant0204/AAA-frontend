import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';

import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import AppCard from '../../components/AppCard';
import AppTable from '../../components/AppTable';

// Custom icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Constants & Helpers
import { SERVICES } from '../../constants/mockData';

export const AgentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const { data: allLeads = [] } = useQuery({ queryKey: ['leads'], queryFn: dbService.getLeads });
  const { data: allClients = [] } = useQuery({ queryKey: ['clients'], queryFn: dbService.getClients });
  const { data: allConsultations = [] } = useQuery({ queryKey: ['consultations'], queryFn: dbService.getConsultations });
  const { data: allPayments = [] } = useQuery({ queryKey: ['payments'], queryFn: dbService.getPayments });
  const { data: customizationSettings } = useQuery({ queryKey: ['customization-settings'], queryFn: dbService.getCustomizationSettings });

  // Filter based on currently logged-in Agent ID
  const agentId = currentUser?.id || '';
  const agentName = currentUser?.name || 'Agent';

  const myLeads = allLeads.filter((l) => l.assignedToId === agentId);
  const myClients = allClients.filter((cl) => cl.assignedToId === agentId);
  const myConsultations = allConsultations.filter((c) => c.consultantId === agentId);

  // Stats Calculations
  const totalConsultations = myConsultations.length;

  const todayStr = '2026-06-18'; // Simulated current date
  const todayConsultations = myConsultations.filter((c) => c.meetingDate === todayStr).length;

  const upcomingConsultations = myConsultations.filter((c) => c.status === 'Scheduled').length;

  // Revenue & commission calculations
  const clientIds = myClients.map((cl) => cl.id);
  const myPayments = allPayments.filter((p) => clientIds.includes(p.clientId));

  const totalRevenuePaid = myPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + (p.totalPaid || 0), 0);

  const commissionRate = currentUser?.commissionRate !== undefined ? currentUser.commissionRate : 10;
  const commissionEarned = Math.round(
    myPayments
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => {
        const pRate = (p.commissionRate !== null && p.commissionRate !== undefined) ? p.commissionRate : commissionRate;
        return sum + ((p.totalPaid || p.amount || 0) * (pRate / 100));
      }, 0)
  );

  const activeCases = myClients.filter(
    (cl) => cl.visaStatus !== 'Approved' && cl.status !== 'Completed'
  ).length;

  const closedCases = myClients.filter(
    (cl) => cl.visaStatus === 'Approved' || cl.status === 'Completed'
  ).length;

  const performancePercent = totalConsultations > 0 ? Math.round((closedCases / totalConsultations) * 100) : 0;

  // Render stats list
  const statsList = [
    { title: 'My Total Consultations', value: totalConsultations, icon: <AssignmentIcon />, color: '#3F51B5', onClick: () => navigate('/agent/consultations', { state: { filterStatus: '', cardInfo: { title: 'My Total Consultations', value: totalConsultations, color: '#3F51B5', iconType: 'Assignment' } } }) },
    { title: "Today's Meetings", value: todayConsultations, icon: <CalendarMonthIcon />, color: '#14B8A6', onClick: () => navigate('/agent/consultations', { state: { filterStatus: 'Scheduled', startDate: '2026-06-18', endDate: '2026-06-18', cardInfo: { title: "Today's Meetings", value: todayConsultations, color: '#14B8A6', iconType: 'CalendarMonth' } } }) },
    { title: 'Upcoming Calls', value: upcomingConsultations, icon: <CalendarMonthIcon />, color: '#2563EB', onClick: () => navigate('/agent/consultations', { state: { filterStatus: 'Scheduled', cardInfo: { title: 'Upcoming Calls', value: upcomingConsultations, color: '#2563EB', iconType: 'CalendarMonth' } } }) },
    { title: 'My Performance (%)', value: `${performancePercent}%`, icon: <TrendingUpIcon />, color: '#10B981' },
    { title: 'Commission Earned', value: `€${commissionEarned.toLocaleString()}`, icon: <PaymentsIcon />, color: '#F59E0B' },
    { title: 'My Active Cases', value: activeCases, icon: <AssignmentIcon />, color: '#3B82F6', onClick: () => navigate('/agent/clients', { state: { filterStatus: 'Active', cardInfo: { title: 'My Active Cases', value: activeCases, color: '#3B82F6', iconType: 'Assignment' } } }) },
    { title: 'Closed Cases', value: closedCases, icon: <CheckCircleOutlinedIcon />, color: '#22C55E', onClick: () => navigate('/agent/clients', { state: { filterStatus: 'Closed', cardInfo: { title: 'Closed Cases', value: closedCases, color: '#22C55E', iconType: 'CheckCircleOutlined' } } }) },
    { title: 'My Assigned Leads', value: myLeads.length, icon: <WarningAmberIcon />, color: '#EF4444', onClick: () => navigate('/agent/leads', { state: { filterStatus: '', filterToday: false, cardInfo: { title: 'My Assigned Leads', value: myLeads.length, color: '#EF4444', iconType: 'WarningAmber' } } }) }
  ];

  // Assigned leads table config
  const recentLeads = myLeads.slice(0, 5);
  const leadsColumns = [
    { id: 'id', label: 'Lead ID', minWidth: 80 },
    {
      id: 'name',
      label: 'Name',
      render: (row) => `${row.firstName} ${row.lastName}` },
    {
      id: 'service',
      label: 'Visa Service',
      render: (row) => SERVICES.find((s) => s.id === row.serviceId)?.name || row.serviceId },
    { id: 'preferredLanguage', label: 'Language' },
    { id: 'status', label: 'Status' }
  ];

  // Personal upcoming meetings list
  const nextMeetings = myConsultations
    .filter((c) => c.status === 'Scheduled')
    .slice(0, 5);

  return (
    <Box>
      <PageHeader
        title={`Welcome Back, ${agentName}`}
        subtitle="Review your assigned leads, upcoming assessment calls, and dynamic commission performance."
      />

      {/* Grid of Statistical Cards */}
      <Box
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-3"
      >
        {statsList
          .filter(stat => {
            const cardTitle = stat.title === 'My Total Consultations' ? 'Total Consultations' :
              stat.title === "Today's Meetings" ? "Today's Consultations" :
                stat.title === 'Upcoming Calls' ? 'Upcoming Meetings' :
                  stat.title === 'My Active Cases' ? 'Active Cases' :
                    stat.title === 'Closed Cases' ? 'Completed Cases' :
                      stat.title;

            // If it's a personal/performance metric not present in the customizable cards catalog, always show it
            const customizableKeys = [
              'Total Clients',
              'Today\'s Clients',
              'Total Consultations',
              'Today\'s Consultations',
              'Upcoming Meetings',
              'Pending Payments',
              'Total Revenue',
              'Active Cases',
              'Completed Cases',
              'Lost Consultations',
              'Revenue Today',
              'Outstanding Revenue',
              'Refunded (50% Rejections)'
            ];

            if (!customizableKeys.includes(cardTitle)) {
              return true;
            }

            // 1. Individual user customization override (highest priority)
            if (customizationSettings && currentUser?.id && customizationSettings[currentUser.id]?.cards) {
              const allowedCards = customizationSettings[currentUser.id].cards || [];
              return allowedCards.includes(cardTitle);
            }

            // 2. Individual custom permissions override (legacy fallback)
            if (currentUser?.customPermissions?.enabled) {
              const allowedCards = currentUser.customPermissions.cards || [];
              return allowedCards.includes(cardTitle);
            }

            // 3. Role-level customization settings
            if (customizationSettings && customizationSettings.consultant) {
              const allowedCards = customizationSettings.consultant.cards || [];
              return allowedCards.includes(cardTitle);
            }
            return true;
          })
          .map((stat, idx) => (
            <StatCard
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              onClick={stat.onClick}
            />
          ))}
      </Box>

      {/* Commission Highlights Widget */}
      <Paper
        sx={{
          p: 2,
          bgcolor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2.5
        }}
      >
        <Box>
          <Typography variant="subtitle1" color="amber.900" sx={{ fontWeight: 800 }}>
            Personal Commission Performance Profile ({commissionRate}%)
          </Typography>
          <Typography variant="body2" color="amber.800" sx={{ mt: 0.5 }}>
            Your payouts are calculated dynamically based on invoice payments closed from your assigned cases.
          </Typography>
        </Box>
        <Typography variant="h3" color="amber.900" sx={{ fontWeight: 900 }}>
          €{commissionEarned.toLocaleString()}
        </Typography>
      </Paper>

      {/* Tables and Lists */}
      <Box className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* My Leads Table */}
        <Box className="col-span-12 lg:col-span-8">
          <AppCard
            title="My Assigned Leads Center"
            subheader="Overview of your active qualified client files"
            action={
              <Button size="small" variant="text" color="secondary" onClick={() => navigate('/leads')}>
                Open Leads List
              </Button>
            }
            noPadding
          >
            <AppTable
              columns={leadsColumns}
              data={recentLeads}
              onRowClick={(row) => navigate(`/leads/details/${row.id}`)}
            />
          </AppCard>
        </Box>

        {/* My Calendar calls */}
        <Box className="col-span-12 lg:col-span-4">
          <AppCard title="My Scheduled Meetings" subheader="Your upcoming zoom consultation calls">
            {nextMeetings.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No scheduled calls found.
              </Typography>
            ) : (
              <List disablePadding>
                {nextMeetings.map((mt, idx) => (
                  <React.Fragment key={mt.id}>
                    <ListItem sx={{ py: 1.5, px: 0 }}>
                      <ListItemText
                        slotProps={{
                          primary: { component: 'div' },
                          secondary: { component: 'div' }
                        }}
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {mt.clientName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                              {mt.meetingTime}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Visa: {SERVICES.find(s => s.id === mt.serviceId)?.name || 'Spain Visa'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {mt.meetingDate}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {idx < nextMeetings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/consultations/calendar')}
            >
              View My Calendar Scheduler
            </Button>
          </AppCard>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentDashboard;
