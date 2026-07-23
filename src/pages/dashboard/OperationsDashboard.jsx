import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../contexts/AlertContext';
import { dbService } from '../../services/dbService';

// Recharts components
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend } from 'recharts';

// Custom icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CancelIcon from '@mui/icons-material/Cancel';

// Custom components
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import AppCard from '../../components/AppCard';
import AppTable from '../../components/AppTable';

// Constants & Helpers
import { SERVICES } from '../../constants/mockData';

export const OperationsDashboard = () => {
  const navigate = useNavigate();
  const { isConsultant, isFinance, isAdmin, isOperations, currentUser, isViewOnlyMenu } = useAuth();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  // Lead Ingestion Simulator State
  const [fullName, setFullName] = useState('');
  const [source, setSource] = useState('WhatsApp');
  const [serviceId, setServiceId] = useState('dnv');
  const [nationality, setNationality] = useState('American');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const nationalityDetails = {
    American: { preferredLanguage: 'English', phonePrefix: '+1' },
    British: { preferredLanguage: 'English', phonePrefix: '+44' },
    Indian: { preferredLanguage: 'English', phonePrefix: '+91' },
    Canadian: { preferredLanguage: 'English', phonePrefix: '+1' },
    Chinese: { preferredLanguage: 'English', phonePrefix: '+86' },
    Russian: { preferredLanguage: 'English', phonePrefix: '+7' },
    French: { preferredLanguage: 'English', phonePrefix: '+33' },
    Spanish: { preferredLanguage: 'Spanish', phonePrefix: '+34' },
    Jordanian: { preferredLanguage: 'Arabic', phonePrefix: '+962' },
    Emirati: { preferredLanguage: 'Arabic', phonePrefix: '+971' },
    Lebanese: { preferredLanguage: 'Arabic', phonePrefix: '+961' } };

  const handleIngestLead = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showAlert('Please enter a candidate name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Doe';

      const details = nationalityDetails[nationality] || { preferredLanguage: 'English', phonePrefix: '+1' };
      const randomPhoneSuffix = Math.floor(100000000 + Math.random() * 900000000);
      const generatedEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;
      const generatedPhone = `${details.phonePrefix} ${randomPhoneSuffix}`;

      const payload = {
        firstName,
        lastName,
        email: generatedEmail,
        phone: generatedPhone,
        nationality,
        preferredLanguage: details.preferredLanguage,
        source,
        serviceId,
        applicantsCount: 1,
        status: 'New Lead',
        notes: `Simulated inbound lead from ${source} for ${SERVICES.find(s => s.id === serviceId)?.name || serviceId}.` };

      await dbService.createLead(payload);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showAlert(`Test lead for ${firstName} ${lastName} successfully ingested!`, 'success');

      // Reset form
      setFullName('');
      setSource('WhatsApp');
      setServiceId('dnv');
      setNationality('American');
    } catch (error) {
      console.error(error);
      showAlert('Failed to ingest lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: leads = [] } = useQuery({ queryKey: ['leads'], queryFn: dbService.getLeads });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: dbService.getClients });
  const { data: consultations = [] } = useQuery({ queryKey: ['consultations'], queryFn: dbService.getConsultations });
  const { data: payments = [] } = useQuery({ queryKey: ['payments'], queryFn: dbService.getPayments });
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications'], queryFn: dbService.getNotifications });
  const { data: agentsList = [] } = useQuery({ queryKey: ['agents'], queryFn: dbService.getAgents });
  const { data: customizationSettings } = useQuery({ queryKey: ['customization-settings'], queryFn: dbService.getCustomizationSettings });
  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Dashboard');

  // Compute key stats
  const totalLeads = leads.length;
  const todayDateStr = '2026-06-18'; // Mock current date
  const todayLeadsCount = leads.filter((l) => l.createdDate?.startsWith(todayDateStr)).length;
  const upcomingMeetingsCount = consultations.filter((c) => c.status === 'Scheduled').length;
  const pendingPaymentsCount = payments.filter((p) => p.status === 'Pending').length;

  const revenueTotal = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + (p.totalPaid || 0), 0);

  // Revenue Today
  const revenueTodayTotal = payments
    .filter((p) => p.status === 'Paid' && (p.paymentDate || '').startsWith(todayDateStr))
    .reduce((sum, p) => sum + (p.totalPaid || 0), 0);

  // Outstanding Revenue
  const outstandingRevenue = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + (p.amount || p.totalPaid || 0), 0);

  // Refunded
  const refundedTotal = payments
    .filter((p) => p.status === 'Refunded' || p.status === 'Refunded (50%)')
    .reduce((sum, p) => sum + (p.totalPaid || p.amount || 0), 0);

  const activeCasesCount = clients.filter((c) => c.status === 'Under Process').length;
  const completedCasesCount = clients.filter((c) => c.status === 'Completed').length;
  const lostLeadsCount = leads.filter((l) => l.status === 'Lost Lead').length;

  const clientsTodayCount = clients.filter((c) => c.onboardingDate?.startsWith(todayDateStr)).length;

  // Render quick stats data — titles must exactly match AVAILABLE_CARDS keys
  const statsList = [
    { title: 'Total Clients', value: clients.length, icon: <PeopleAltIcon />, color: '#3F51B5', trend: '12%', onClick: () => navigate('/operations/clients', { state: { filterStatus: '', cardInfo: { title: 'Total Clients', value: clients.length, color: '#3F51B5', trend: '12%', iconType: 'PeopleAlt' } } }) },
    { title: "Today's Clients", value: clientsTodayCount, icon: <AddIcon />, color: '#14B8A6', trend: '24%', onClick: () => navigate('/operations/clients', { state: { filterStatus: '', cardInfo: { title: "Today's Clients", value: clientsTodayCount, color: '#14B8A6', trend: '24%', iconType: 'Add' } } }) },
    { title: 'Total Consultations', value: totalLeads, icon: <PeopleAltIcon />, color: '#8B5CF6', trend: '12%', onClick: () => navigate('/operations/leads', { state: { filterToday: false, filterStatus: '', cardInfo: { title: 'Total Consultations', value: totalLeads, color: '#8B5CF6', trend: '12%', iconType: 'PeopleAlt' } } }) },
    { title: "Today's Consultations", value: todayLeadsCount, icon: <AddIcon />, color: '#EC4899', trend: '24%', onClick: () => navigate('/operations/leads', { state: { filterToday: true, filterStatus: '', cardInfo: { title: "Today's Consultations", value: todayLeadsCount, color: '#EC4899', trend: '24%', iconType: 'Add' } } }) },
    { title: 'Upcoming Meetings', value: upcomingMeetingsCount, icon: <CalendarMonthIcon />, color: '#2563EB', trend: '8%', onClick: () => navigate('/operations/consultations', { state: { filterStatus: 'Scheduled', cardInfo: { title: 'Upcoming Meetings', value: upcomingMeetingsCount, color: '#2563EB', trend: '8%', iconType: 'CalendarMonth' } } }) },
    { title: 'Pending Payments', value: pendingPaymentsCount, icon: <PaymentsIcon />, color: '#F59E0B', trend: '-5%' },
    { title: 'Total Revenue', value: `€${revenueTotal.toLocaleString()}`, icon: <TrendingUpIcon />, color: '#22C55E', trend: '18%' },
    { title: 'Active Cases', value: activeCasesCount, icon: <AssignmentIcon />, color: '#3B82F6', trend: '14%', onClick: () => navigate('/operations/clients', { state: { filterStatus: 'Under Process', cardInfo: { title: 'Active Cases', value: activeCasesCount, color: '#3B82F6', trend: '14%', iconType: 'Assignment' } } }) },
    { title: 'Completed Cases', value: completedCasesCount, icon: <CheckCircleOutlinedIcon />, color: '#10B981', trend: '20%', onClick: () => navigate('/operations/clients', { state: { filterStatus: 'Completed', cardInfo: { title: 'Completed Cases', value: completedCasesCount, color: '#10B981', trend: '20%', iconType: 'CheckCircleOutlined' } } }) },
    { title: 'Lost Consultations', value: lostLeadsCount, icon: <WarningAmberIcon />, color: '#EF4444', trend: '2%', onClick: () => navigate('/operations/leads', { state: { filterStatus: 'Lost Lead', filterToday: false, cardInfo: { title: 'Lost Consultations', value: lostLeadsCount, color: '#EF4444', trend: '2%', iconType: 'WarningAmber' } } }) },
    { title: 'Revenue Today', value: `€${revenueTodayTotal.toLocaleString()}`, icon: <TrendingUpIcon />, color: '#14B8A6', trend: '8%' },
    { title: 'Outstanding Revenue', value: `€${outstandingRevenue.toLocaleString()}`, icon: <AccountBalanceWalletIcon />, color: '#F59E0B', trend: '-2%' },
    { title: 'Refunded (50% Rejections)', value: `€${refundedTotal.toLocaleString()}`, icon: <CancelIcon />, color: '#EF4444', trend: '4%' },
  ];

  // CHART 1: Lead Source Chart
  const sourcesData = leads.reduce((acc, curr) => {
    const existing = acc.find((item) => item.name === curr.source);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.source, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#2563EB', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6'];

  // CHART 2: Revenue Chart
  const revenueData = [
    { name: 'Jan', revenue: 12000, target: 10000 },
    { name: 'Feb', revenue: 15500, target: 12000 },
    { name: 'Mar', revenue: 19800, target: 15000 },
    { name: 'Apr', revenue: 22000, target: 18000 },
    { name: 'May', revenue: 31000, target: 22000 },
    { name: 'Jun', revenue: revenueTotal, target: 25000 },
  ];

  // CHART 3: Monthly Conversion Chart
  const conversionData = [
    { name: 'Jan', rate: 45 },
    { name: 'Feb', rate: 52 },
    { name: 'Mar', rate: 58 },
    { name: 'Apr', rate: 61 },
    { name: 'May', rate: 68 },
    { name: 'Jun', rate: 71 },
  ];

  // CHART 4: Consultant Performance Chart
  const performanceData = agentsList.map((c) => ({
    name: c.name.split(' ')[0],
    cases: c.casesCount || 0,
    rate: c.conversionRate || 0 }));

  // Leads table configuration
  const recentLeads = leads.slice(0, 5);
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
    { id: 'source', label: 'Source' },
    { id: 'status', label: 'Status' },
  ];

  // Upcoming meetings configuration
  const upcomingMeetings = consultations
    .filter((c) => c.status === 'Scheduled')
    .slice(0, 4);

  return (
    <Box>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Operational metrics tracking for AAA Business Consultancy Spain Visa Operations."
        action={
          !isViewOnly && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/operations/leads')}>
              Add New Lead
            </Button>
          )
        }
      />

      {/* Grid of Statistical Cards */}
      <Box
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-3"
      >
        {statsList
          .filter(stat => {
            // Use title directly — titles now exactly match AVAILABLE_CARDS keys
            const cardTitle = stat.title;

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
            const roleKey = currentUser?.role;
            if (customizationSettings && roleKey && customizationSettings[roleKey]) {
              const allowedCards = customizationSettings[roleKey].cards || [];
              return allowedCards.includes(cardTitle);
            }

            // 4. Fallback: show all
            return true;
          })
          .map((stat, idx) => (
            <StatCard
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendDirection={parseFloat(stat.trend) >= 0 ? 'up' : 'down'}
              color={stat.color}
              onClick={stat.onClick}
            />
          ))}
      </Box>

      {/* Charts Grid */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {/* Revenue Chart */}
        <Box className="col-span-1">
          <ChartCard title="Revenue Growth Trends" subheader="Target vs Actual monthly generated payments">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <ChartTooltip formatter={(value) => [`€${value}`, 'Revenue']} />
                <Legend iconSize={8} iconType="circle" />
                <Area type="monotone" dataKey="revenue" name="Actual Revenue (€)" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="target" name="Target Revenue (€)" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        {/* Lead Source Pie Chart */}
        <Box className="col-span-1">
          <ChartCard title="Lead Registration Channels" subheader="Distribution of inbound leads by acquisition channel">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourcesData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                  fontSize={10}
                  fontWeight={500}
                >
                  {sourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip formatter={(value) => [value, 'Leads Count']} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        {/* Monthly Conversion Rate */}
        <Box className="col-span-1">
          <ChartCard title="Visa Conversion Efficiency" subheader="Percentage of leads successfully onboarding as clients">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <ChartTooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                <Area type="monotone" dataKey="rate" name="Conversion Rate (%)" stroke="#14B8A6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        {/* Consultant Performance Chart */}
        <Box className="col-span-1">
          <ChartCard title="Agent Leaderboard" subheader="Active cases handled vs conversion efficiency">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <ChartTooltip />
                <Legend iconSize={8} iconType="circle" />
                <Bar dataKey="cases" name="Cases Handled" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="rate" name="Conversion Rate (%)" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>
      </Box>

      {/* Tables and Widgets Grid */}
      <Box className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Recent Leads Table */}
        <Box className="col-span-12">
          <AppCard
            title="Recent Lead registrations"
            subheader="Overview of the latest qualified inquiries"
            action={
              <Button size="small" variant="text" color="secondary" onClick={() => navigate('/operations/leads')}>
                View All Leads
              </Button>
            }
            noPadding
          >
            <AppTable
              columns={leadsColumns}
              data={recentLeads}
              onRowClick={(row) => navigate(`/operations/leads/details/${row.id}`)}
            />
          </AppCard>
        </Box>

        {/* Sidebar widgets */}
        <Box className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Upcoming Meetings widget */}
          <Box className="col-span-1">
              <AppCard title="Upcoming Meetings" subheader="Scheduled assessment meetings">
                {upcomingMeetings.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No meetings scheduled today.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {upcomingMeetings.map((mt, idx) => {
                      const consName = agentsList.find(c => c.id === mt.assignedConsultantId)?.name || 'Agent';
                      return (
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
                                    Host: {consName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {mt.meetingDate}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {idx < upcomingMeetings.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
                <Button
                variant="outlined"
                size="small"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/operations/consultations/calendar')}
              >
                Open Calendar Scheduler
              </Button>
              </AppCard>
            </Box>

            {/* Recent activity timeline log */}
            <Box className="col-span-1">
              <AppCard title="Recent Live Activities" subheader="System audit log tracking">
                <List disablePadding>
                  {notifications.slice(0, 4).map((notif, idx) => (
                    <React.Fragment key={notif.id}>
                      <ListItem sx={{ py: 1.2, px: 0 }}>
                        <ListItemText
                          slotProps={{
                            primary: { component: 'div' },
                            secondary: { component: 'div' }
                          }}
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {notif.title}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {notif.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {notif.time}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < 3 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </AppCard>
            </Box>
          </Box>
        </Box>
    </Box>
  );
};

export default OperationsDashboard;
