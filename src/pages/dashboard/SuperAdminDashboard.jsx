import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

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
import CancelIcon from '@mui/icons-material/Cancel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';


// Custom components
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import AppCard from '../../components/AppCard';
import AppTable from '../../components/AppTable';

// Constants & Helpers
import { SERVICES } from '../../constants/mockData';

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { isConsultant, isFinance, isAdmin, isOperations, currentUser, isViewOnlyMenu } = useAuth();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // AI CEO Dashboard states & handlers
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [briefText, setBriefText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleBriefMyDay = async () => {
    setLoadingBrief(true);
    try {
      const data = await dbService.getCeoBrief();
      if (data && data.success) {
        setBriefText(data.brief);
        setSuggestions(data.suggestions || []);
        showAlert('AI Daily briefing compiled successfully!', 'success');
      } else {
        showAlert('Failed to generate daily brief.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Server error compiling briefing.', 'error');
    } finally {
      setLoadingBrief(false);
    }
  };

  const renderFormattedBrief = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lines.map((line, idx) => {
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const cleanLine = line.replace(/^[•-]\s*/, '');
            // Highlight bold text markdown **text**
            const parts = cleanLine.split('**');
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#8B5CF6', fontSize: '1.2rem', lineHeight: '1.2' }}>•</span>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                  {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: '#fff', fontWeight: 700 }}>{part}</strong> : part)}
                </Typography>
              </div>
            );
          }
          // Normal greeting or text
          const parts = line.split('**');
          return (
            <Typography key={idx} variant="body2" sx={{ color: '#fff', fontWeight: 600, mb: 1, fontSize: '0.98rem' }}>
              {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: '#14B8A6', fontWeight: 800 }}>{part}</strong> : part)}
            </Typography>
          );
        })}
      </div>
    );
  };
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const mockToday = new Date().toISOString().split('T')[0]; // Real current date

  const applyPreset = (preset) => {
    const now = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    if (preset === 'today') {
      setStartDate(fmt(now));
      setEndDate(fmt(now));
    } else if (preset === '7d') {
      const d7 = new Date(now); d7.setDate(now.getDate() - 7);
      setStartDate(fmt(d7));
      setEndDate(fmt(now));
    } else if (preset === '30d') {
      const d30 = new Date(now); d30.setDate(now.getDate() - 30);
      setStartDate(fmt(d30));
      setEndDate(fmt(now));
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // REVENUE DASHBOARD — computed from real payment data
  // (computed after payments query, defined inline in JSX below)

  // LEAD SOURCE — computed from real leads data after query (defined after queries below)

  // COMMISSION MANAGEMENT — computed from real agents/payments (defined after queries)

  // CLIENT FINANCIAL VIEW TABLE
  const financialColumns = [
    { id: 'client', label: 'Client Name' },
    { id: 'service', label: 'Service Type' },
    { id: 'consultant', label: 'Consultant' },
    { id: 'totalFee', label: 'Total Fee' },
    { id: 'paid', label: 'Paid Amount' },
    { id: 'balance', label: 'Balance' },
    { id: 'paymentStatus', label: 'Payment Status' },
  ];
  // financialRows computed from real data after queries


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

  // Dynamic Date Range Calculation
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayDateStr = new Date().toISOString().split('T')[0]; // Real current date
  const revenueTotal = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.totalPaid || 0), 0);

  const getPeriodRange = (startStr, endStr) => {
    // All Time mode: both empty
    if (!startStr && !endStr) {
      return {
        start: null,
        end: null,
        prevStart: null,
        prevEnd: null,
        trendLabel: 'all time',
        isAllTime: true,
      };
    }

    const start = parseDate(startStr);
    const end = parseDate(endStr || startStr); // if only start given, treat as single day

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const prevEnd = new Date(start);
    prevEnd.setDate(start.getDate() - 1);

    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevEnd.getDate() - (diffDays - 1));

    return {
      start: startStr,
      end: endStr || startStr,
      prevStart: formatDate(prevStart),
      prevEnd: formatDate(prevEnd),
      trendLabel: `vs prev ${diffDays}d`,
      isAllTime: false,
    };
  };

  const period = getPeriodRange(startDate, endDate);

  // When All Time: pass all records. Otherwise filter by date range.
  const filterByDate = (dateStr, start, end) => {
    if (!start && !end) return true; // All Time — show everything
    if (!dateStr) return false;
    const formatted = dateStr.substring(0, 10);
    if (start && !end) return formatted === start; // single day
    return formatted >= start && formatted <= end;
  };

  const getTrend = (current, previous) => {
    if (!period.prevStart) return null;
    if (previous === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    const pct = Math.round(((current - previous) / previous) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  // 1. Total Clients
  const clientsInRange = clients.filter(c => filterByDate(c.onboardingDate, period.start, period.end));
  const clientsInPrevRange = period.prevStart ? clients.filter(c => filterByDate(c.onboardingDate, period.prevStart, period.prevEnd)) : [];

  // 2. Today's Clients
  const clientsToday = clients.filter(c => c.onboardingDate?.startsWith(todayDateStr));
  const clientsYesterday = clients.filter(c => c.onboardingDate?.startsWith('2026-06-17'));

  // 3. Total Consultations (Leads)
  const leadsInRange = leads.filter(l => filterByDate(l.createdDate, period.start, period.end));
  const leadsInPrevRange = period.prevStart ? leads.filter(l => filterByDate(l.createdDate, period.prevStart, period.prevEnd)) : [];

  // 4. Today's Consultations
  const leadsToday = leads.filter(l => l.createdDate?.startsWith(todayDateStr));
  const leadsYesterday = leads.filter(l => l.createdDate?.startsWith('2026-06-17'));

  // 5. Upcoming Meetings
  const meetingsInRange = consultations.filter(c => c.status === 'Scheduled' && filterByDate(c.meetingDate, period.start, period.end));
  const meetingsInPrevRange = period.prevStart ? consultations.filter(c => c.status === 'Scheduled' && filterByDate(c.meetingDate, period.prevStart, period.prevEnd)) : [];

  // 6. Pending Payments
  const pendingPaymentsInRange = payments.filter(p => p.status === 'Pending' && filterByDate(p.dueDate, period.start, period.end));
  const pendingPaymentsInPrevRange = period.prevStart ? payments.filter(p => p.status === 'Pending' && filterByDate(p.dueDate, period.prevStart, period.prevEnd)) : [];

  // 7. Total Revenue
  const revenueInRange = payments.filter(p => p.status === 'Paid' && filterByDate(p.paymentDate || p.dueDate, period.start, period.end)).reduce((sum, p) => sum + (p.totalPaid || 0), 0);
  const revenueInPrevRange = period.prevStart ? payments.filter(p => p.status === 'Paid' && filterByDate(p.paymentDate || p.dueDate, period.prevStart, period.prevEnd)).reduce((sum, p) => sum + (p.totalPaid || 0), 0) : 0;

  // 8. Active Cases
  const activeCasesInRange = clients.filter(c => c.status === 'Under Process' && filterByDate(c.onboardingDate, period.start, period.end));
  const activeCasesInPrevRange = period.prevStart ? clients.filter(c => c.status === 'Under Process' && filterByDate(c.onboardingDate, period.prevStart, period.prevEnd)) : [];

  // 9. Completed Cases
  const completedCasesInRange = clients.filter(c => c.status === 'Completed' && filterByDate(c.onboardingDate, period.start, period.end));
  const completedCasesInPrevRange = period.prevStart ? clients.filter(c => c.status === 'Completed' && filterByDate(c.onboardingDate, period.prevStart, period.prevEnd)) : [];

  // 10. Lost Consultations
  const lostLeadsInRange = leads.filter(l => l.status === 'Lost Lead' && filterByDate(l.createdDate, period.start, period.end));
  const lostLeadsInPrevRange = period.prevStart ? leads.filter(l => l.status === 'Lost Lead' && filterByDate(l.createdDate, period.prevStart, period.prevEnd)) : [];

  // Render quick stats data
  const statsList = [
    {
      title: 'Total Clients',
      value: clientsInRange.length,
      icon: <PeopleAltIcon />,
      color: '#3F51B5',
      trend: getTrend(clientsInRange.length, clientsInPrevRange.length),
      trendLabel: period.trendLabel,
      onClick: () => navigate('/super_admin/clients', { state: { filterStatus: '', startDate: period.start, endDate: period.end, cardInfo: { title: 'Total Clients', value: clientsInRange.length, color: '#3F51B5', trend: getTrend(clientsInRange.length, clientsInPrevRange.length), iconType: 'PeopleAlt' } } })
    },
    {
      title: "Today's Clients",
      value: clientsToday.length,
      icon: <AddIcon />,
      color: '#14B8A6',
      trend: getTrend(clientsToday.length, clientsYesterday.length),
      trendLabel: 'vs yesterday',
      onClick: () => navigate('/super_admin/clients', { state: { filterStatus: '', startDate: todayDateStr, endDate: todayDateStr, cardInfo: { title: "Today's Clients", value: clientsToday.length, color: '#14B8A6', trend: getTrend(clientsToday.length, clientsYesterday.length), iconType: 'Add' } } })
    },
    {
      title: 'Total Consultations',
      value: leadsInRange.length,
      icon: <PeopleAltIcon />,
      color: '#8B5CF6',
      trend: getTrend(leadsInRange.length, leadsInPrevRange.length),
      trendLabel: period.trendLabel,
      onClick: () => navigate('/super_admin/leads', { state: { filterToday: false, filterStatus: '', startDate: period.start, endDate: period.end, cardInfo: { title: 'Total Consultations', value: leadsInRange.length, color: '#8B5CF6', trend: getTrend(leadsInRange.length, leadsInPrevRange.length), iconType: 'PeopleAlt' } } })
    },
    {
      title: "Today's Consultations",
      value: leadsToday.length,
      icon: <AddIcon />,
      color: '#EC4899',
      trend: getTrend(leadsToday.length, leadsYesterday.length),
      trendLabel: 'vs yesterday',
      onClick: () => navigate('/super_admin/leads', { state: { filterToday: true, filterStatus: '', startDate: todayDateStr, endDate: todayDateStr, cardInfo: { title: "Today's Consultations", value: leadsToday.length, color: '#EC4899', trend: getTrend(leadsToday.length, leadsYesterday.length), iconType: 'Add' } } })
    },
    {
      title: 'Upcoming Meetings',
      value: meetingsInRange.length,
      icon: <CalendarMonthIcon />,
      color: '#2563EB',
      trend: getTrend(meetingsInRange.length, meetingsInPrevRange.length),
      trendLabel: period.trendLabel,
      onClick: () => navigate('/super_admin/consultations', { state: { filterStatus: 'Scheduled', startDate: period.start, endDate: period.end, cardInfo: { title: 'Upcoming Meetings', value: meetingsInRange.length, color: '#2563EB', trend: getTrend(meetingsInRange.length, meetingsInPrevRange.length), iconType: 'CalendarMonth' } } })
    },
    {
      title: 'Pending Payments',
      value: pendingPaymentsInRange.length,
      icon: <PaymentsIcon />,
      color: '#F59E0B',
      trend: getTrend(pendingPaymentsInRange.length, pendingPaymentsInPrevRange.length),
      trendLabel: period.trendLabel,
      onClick: () => navigate('/payments/invoices', { state: { filterStatus: 'Pending', startDate: period.start, endDate: period.end, cardInfo: { title: 'Pending Payments', value: pendingPaymentsInRange.length, color: '#F59E0B', trend: getTrend(pendingPaymentsInRange.length, pendingPaymentsInPrevRange.length), iconType: 'Payments' } } })
    },
    {
      title: 'Total Revenue',
      value: `€${revenueInRange.toLocaleString()}`,
      icon: <TrendingUpIcon />,
      color: '#22C55E',
      trend: getTrend(revenueInRange, revenueInPrevRange),
      trendLabel: period.trendLabel,
      onClick: () => navigate('/payments/invoices', { state: { filterStatus: 'Paid', startDate: period.start, endDate: period.end, cardInfo: { title: 'Total Revenue', value: `€${revenueInRange.toLocaleString()}`, color: '#22C55E', trend: getTrend(revenueInRange, revenueInPrevRange), iconType: 'TrendingUp' } } })
    },
    {
      title: 'Active Cases',
      value: activeCasesInRange.length,
      icon: <AssignmentIcon />,
      color: '#3B82F6',
      trend: getTrend(activeCasesInRange.length, activeCasesInPrevRange.length),
      trendLabel: period.trendLabel,
      onClick: () => navigate('/super_admin/clients', { state: { filterStatus: 'Under Process', startDate: period.start, endDate: period.end, cardInfo: { title: 'Active Cases', value: activeCasesInRange.length, color: '#3B82F6', trend: getTrend(activeCasesInRange.length, activeCasesInPrevRange.length), iconType: 'Assignment' } } })
    },
    {
      title: 'Completed Cases',
      value: completedCasesInRange.length,
      icon: <CheckCircleOutlinedIcon />,
      color: '#10B981',
      trend: getTrend(completedCasesInRange.length, completedCasesInPrevRange.length),
      trendLabel: period.trendLabel,
      onClick: () => navigate('/super_admin/clients', { state: { filterStatus: 'Completed', startDate: period.start, endDate: period.end, cardInfo: { title: 'Completed Cases', value: completedCasesInRange.length, color: '#10B981', trend: getTrend(completedCasesInRange.length, completedCasesInPrevRange.length), iconType: 'CheckCircleOutlined' } } })
    },
    {
      title: 'Lost Consultations',
      value: lostLeadsInRange.length,
      icon: <WarningAmberIcon />,
      color: '#EF4444',
      trend: getTrend(lostLeadsInRange.length, lostLeadsInPrevRange.length),
      trendLabel: period.trendLabel,
      onClick: () => navigate('/super_admin/leads', { state: { filterStatus: 'Lost Lead', filterToday: false, startDate: period.start, endDate: period.end, cardInfo: { title: 'Lost Consultations', value: lostLeadsInRange.length, color: '#EF4444', trend: getTrend(lostLeadsInRange.length, lostLeadsInPrevRange.length), iconType: 'WarningAmber' } } })
    },
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

  // CHART 2: Revenue Chart — computed from real payments grouped by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth = payments
    .filter(p => p.status === 'Paid' && (p.paymentDate || p.dueDate))
    .reduce((acc, p) => {
      const d = new Date(p.paymentDate || p.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!acc[key]) acc[key] = { name: `${monthNames[d.getMonth()]} ${d.getFullYear()}`, revenue: 0, target: 25000 };
      acc[key].revenue += (p.totalPaid || p.amount || 0);
      return acc;
    }, {});
  const revenueData = Object.values(revenueByMonth).slice(-6);
  // Fallback if no payment data yet
  const revenueDataFinal = revenueData.length > 0 ? revenueData : [
    { name: 'Month 1', revenue: 0, target: 25000 }
  ];

  // CHART 3: Monthly Conversion Chart — computed from real leads vs clients
  const conversionByMonth = leads.reduce((acc, l) => {
    if (!l.createdDate) return acc;
    const d = new Date(l.createdDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!acc[key]) acc[key] = { name: monthNames[d.getMonth()], total: 0, converted: 0 };
    acc[key].total += 1;
    if (l.clientId) acc[key].converted += 1;
    return acc;
  }, {});
  const conversionData = Object.values(conversionByMonth).slice(-6).map(m => ({
    name: m.name,
    rate: m.total > 0 ? Math.round((m.converted / m.total) * 100) : 0
  }));

  // CHART 4: Consultant Performance Chart — from real agents
  const performanceData = agentsList.map((c) => ({
    name: (c.name || c.fullName || 'Agent').split(' ')[0],
    cases: c.casesCount || 0,
    rate: c.conversionRate || 0
  }));

  // REVENUE STATS — computed from real payments
  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.totalPaid || p.amount || 0), 0);
  const revenueToday = payments.filter(p => p.status === 'Paid' && (p.paymentDate || p.dueDate || '').startsWith(todayDateStr)).reduce((s, p) => s + (p.totalPaid || p.amount || 0), 0);
  const outstandingRevenue = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + (p.amount || 0), 0);
  const refundedRevenue = payments.filter(p => p.status === 'Refunded').reduce((s, p) => s + (p.totalPaid || p.amount || 0), 0);
  const revenueStats = [
    { title: 'Total Revenue', value: `€${totalRevenue.toLocaleString()}`, icon: <AccountBalanceWalletIcon />, color: '#3F51B5', trend: null },
    { title: 'Revenue Today', value: `€${revenueToday.toLocaleString()}`, icon: <TrendingUpIcon />, color: '#14B8A6', trend: null },
    { title: 'Outstanding Revenue', value: `€${outstandingRevenue.toLocaleString()}`, icon: <AccountBalanceWalletIcon />, color: '#F59E0B', trend: null },
    { title: 'Refunded (50% Rejections)', value: `€${refundedRevenue.toLocaleString()}`, icon: <CancelIcon />, color: '#EF4444', trend: null },
  ];

  // FINANCIAL TABLE — from real clients + payments
  const financialRows = clients.slice(0, 10).map((c, i) => {
    const clientPmts = payments.filter(p => p.clientId === c.id);
    const totalFee = clientPmts.reduce((s, p) => s + (p.amount || 0), 0);
    const paid = clientPmts.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.totalPaid || p.amount || 0), 0);
    const balance = Math.max(0, totalFee - paid);
    const hasPending = clientPmts.some(p => p.status === 'Pending');
    const hasRefund = clientPmts.some(p => p.status === 'Refunded');
    const paymentStatus = paid === totalFee && totalFee > 0 ? 'Fully Paid' : hasRefund ? 'Refunded' : hasPending ? 'Pending Payment' : paid > 0 ? 'Partially Paid' : 'No Invoice';
    return {
      id: c.id || i,
      client: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
      service: c.serviceType || c.serviceId || '—',
      consultant: c.assignedTo?.fullName || '—',
      totalFee: `€${totalFee.toLocaleString()}`,
      paid: `€${paid.toLocaleString()}`,
      balance: `€${balance.toLocaleString()}`,
      paymentStatus
    };
  });

  // GATEWAY DATA — from real payments grouped by method
  const gatewayDataMap = payments.filter(p => p.status === 'Paid').reduce((acc, p) => {
    const method = p.paymentMethod || p.gateway || 'Other';
    if (!acc[method]) acc[method] = { name: method, revenue: 0 };
    acc[method].revenue += (p.totalPaid || p.amount || 0);
    return acc;
  }, {});
  const gatewayData = Object.values(gatewayDataMap).length > 0 ? Object.values(gatewayDataMap) : [{ name: 'No Data', revenue: 0 }];

  // COMMISSION DATA — from real agents
  const commissionData = agentsList.slice(0, 6).map(a => ({
    name: `${(a.name || a.fullName || 'Agent').split(' ')[0]} (${a.commissionRate || 0}%)`,
    earned: a.totalCommissionEarned || 0,
    paid: a.totalCommissionPaid || 0
  }));

  // LEAD SOURCE — computed from real leads
  const leadSourceData = leads.reduce((acc, l) => {
    const src = l.source || 'Unknown';
    const existing = acc.find(x => x.name === src);
    if (existing) existing.value += 1;
    else acc.push({ name: src, value: 1 });
    return acc;
  }, []);

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
        title="Super Admin Dashboard"
        subtitle={`Welcome back, ${currentUser?.name || 'Super Admin'}. Executive overview of CRM operations.`}
        action={
          !isViewOnly && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/super_admin/leads')}>
              Add New Lead
            </Button>
          )
        }
      />

      {/* AI CEO Dashboard Section */}
      <Box sx={{
        mb: 4,
        p: 3,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(30, 27, 58, 0.75) 0%, rgba(15, 12, 38, 0.85) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>✨</span> AI CEO Dashboard
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
              Get a personalized executive summary based on live CRM data.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleBriefMyDay}
            disabled={loadingBrief}
            sx={{
              background: 'linear-gradient(45deg, #FF512F 0%, #DD2476 50%, #8E2DE2 100%)',
              backgroundSize: '200% auto',
              color: '#fff',
              fontWeight: 800,
              px: 3,
              py: 1,
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(221, 36, 118, 0.4)',
              transition: 'all 0.3s ease',
              animation: loadingBrief ? 'none' : 'pulse-gold 2s infinite',
              '&:hover': {
                backgroundPosition: 'right center',
                boxShadow: '0 6px 20px rgba(221, 36, 118, 0.6)',
                transform: 'translateY(-2px)'
              },
              '@keyframes pulse-gold': {
                '0%': { boxShadow: '0 0 0 0 rgba(221, 36, 118, 0.7)' },
                '70%': { boxShadow: '0 0 0 10px rgba(221, 36, 118, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(221, 36, 118, 0)' }
              }
            }}
          >
            {loadingBrief ? '🤖 Briefing Your Day...' : '💼 Brief My Day'}
          </Button>
        </Box>

        {/* Expandable briefing area */}
        {(briefText || loadingBrief) && (
          <Box sx={{
            mt: 2,
            p: 2.5,
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 3
          }}>
            {/* Left side: AI Greeting and Summary */}
            <Box sx={{ flex: 1.5 }}>
              <Typography variant="subtitle2" sx={{ color: '#14B8A6', fontWeight: 800, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Daily Briefing
              </Typography>
              {loadingBrief ? (
                <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite' }}>🔄</span> Scanning active leads, consultations, and payment logs...
                  </Typography>
                  <style>
                    {`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}
                  </style>
                </Box>
              ) : (
                <Box sx={{
                  color: '#fff',
                  lineHeight: 1.6,
                  fontFamily: 'Outfit, sans-serif',
                  '& p': { mb: 2, fontSize: '0.95rem' },
                  '& ul': { pl: 2, mb: 0 },
                  '& li': { mb: 1, fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.9)' }
                }}>
                  {renderFormattedBrief(briefText)}
                </Box>
              )}
            </Box>

            {/* Divider */}
            {!isMobile && <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />}

            {/* Right side: Suggestions Checklist */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#EC4899', fontWeight: 800, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Assistant Recommendations
              </Typography>
              {loadingBrief ? (
                <Box sx={{ py: 3 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
                    Compiling action items...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {suggestions.map((sug, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.2s',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.04)'
                        }
                      }}
                    >
                      <span style={{ color: '#F59E0B', fontSize: '1.1rem', marginTop: '-2px' }}>💡</span>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500, lineHeight: 1.4 }}>
                        {sug}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: isMobile ? '100%' : 'auto', mb: 3 }}>
            {/* Row 1: Presets + Custom toggle */}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 0.5, bgcolor: 'background.paper' }}>
                {[
                  { label: 'Today', key: 'today' },
                  { label: '7D', key: '7d' },
                  { label: '30D', key: '30d' },
                  { label: 'All', key: 'all' },
                ].map(preset => {
                  const isActive =
                    preset.key === 'today' ? startDate === endDate && startDate !== '' :
                    preset.key === '7d' ? (startDate !== '' && endDate !== '' && startDate !== endDate && !(!startDate && !endDate)) && (() => { try { const diff = Math.round((new Date(endDate) - new Date(startDate)) / 86400000); return diff >= 6 && diff <= 8; } catch(e) { return false; } })() :
                    preset.key === '30d' ? (startDate !== '' && endDate !== '' && startDate !== endDate) && (() => { try { const diff = Math.round((new Date(endDate) - new Date(startDate)) / 86400000); return diff >= 28 && diff <= 32; } catch(e) { return false; } })() :
                    preset.key === 'all' ? !startDate && !endDate : false;
                  return (
                    <Button
                      key={preset.key}
                      size="small"
                      variant={isActive ? 'contained' : 'text'}
                      color={isActive ? 'primary' : 'inherit'}
                      onClick={() => applyPreset(preset.key)}
                      sx={{ minWidth: 0, px: isMobile ? 1 : 1.5, py: 0.5, fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5 }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </Box>
              {/* Custom Date Toggle on mobile */}
              {isMobile ? (
                <Button
                  size="small"
                  variant={showCustomDate ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setShowCustomDate(!showCustomDate)}
                  sx={{ minWidth: 0, px: 1, py: 0.5, fontSize: '0.7rem', fontWeight: 700, borderRadius: 1.5 }}
                >
                  Custom
                </Button>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TextField
                    type={startDate || fromFocused ? 'date' : 'text'}
                    placeholder="From"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onFocus={() => setFromFocused(true)}
                    onBlur={() => setFromFocused(false)}
                    sx={{ bgcolor: 'background.paper', width: 130 }}
                    slotProps={{ htmlInput: { style: { fontWeight: 600, fontSize: '0.8rem' } } }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>—</Typography>
                  <TextField
                    type={endDate || toFocused ? 'date' : 'text'}
                    placeholder="To"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onFocus={() => setToFocused(true)}
                    onBlur={() => setToFocused(false)}
                    sx={{ bgcolor: 'background.paper', width: 130 }}
                    slotProps={{ htmlInput: { style: { fontWeight: 600, fontSize: '0.8rem' } } }}
                  />
                </Box>
              )}
            </Box>
            {/* Mobile custom date row */}
            {isMobile && showCustomDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  type={startDate || fromFocused ? 'date' : 'text'}
                  placeholder="From"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onFocus={() => setFromFocused(true)}
                  onBlur={() => setFromFocused(false)}
                  sx={{ bgcolor: 'background.paper', flexGrow: 1 }}
                  inputProps={{ style: { fontWeight: 600, fontSize: '0.78rem' } }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>—</Typography>
                <TextField
                  type={endDate || toFocused ? 'date' : 'text'}
                  placeholder="To"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onFocus={() => setToFocused(true)}
                  onBlur={() => setToFocused(false)}
                  sx={{ bgcolor: 'background.paper', flexGrow: 1 }}
                  inputProps={{ style: { fontWeight: 600, fontSize: '0.78rem' } }}
                />
              </Box>
            )}
          </Box>

      {/* Grid of Statistical Cards — 2-per-row on mobile, 4 on desktop */}
      <Box
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-3"
      >
        {statsList.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={parseFloat(stat.trend) >= 0 ? 'up' : 'down'}
            color={stat.color}
            onClick={stat.onClick}
            trendLabel={stat.trendLabel}
          />
        ))}
      </Box>

      <Divider sx={{ my: isMobile ? 2 : 4 }} />

      {/* REVENUE DASHBOARD WIDGETS */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, mt: 0.5, fontWeight: 700, textTransform: 'uppercase', fontSize: isMobile ? '0.65rem' : undefined }}>
        Revenue Dashboard Overview
      </Typography>
<Box className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {revenueStats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={parseFloat(stat.trend) >= 0 ? 'up' : 'down'}
            color={stat.color}
          />
        ))}
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
        {/* LEAD SOURCE REVENUE TRACKING */}
        <Box className="col-span-12 md:col-span-6">
          <ChartCard title="Lead Source Revenue Tracking" subheader="Revenue distributed by marketing acquisition channel">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        {/* COMMISSION MANAGEMENT */}
        <Box className="col-span-12 md:col-span-6">
          <ChartCard title="Consultant Commission Management" subheader="Track Agents Commission Earned vs Paid">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commissionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="earned" name="Commission Earned (€)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Commission Paid (€)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        {/* PAYMENT GATEWAYS */}
        <Box className="col-span-12">
          <ChartCard title="Payment Gateways Volume" subheader="Revenue generated via Stripe, Apple Pay, Tabby, etc." height={250}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gatewayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <ChartTooltip />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorPv)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>
      </Box>

      {/* CLIENT FINANCIAL VIEW */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>
        Client Financial View
      </Typography>
      <AppCard title="Global Client Accounts" noPadding sx={{ height: 'auto' }}>
        <AppTable columns={financialColumns} data={financialRows} maxHeight={320} />
      </AppCard>

      <Divider sx={{ my: isMobile ? 2 : 4 }} />

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        General Admin Controls & Operations
      </Typography>

      {/* Charts Grid */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {/* Revenue Chart */}
        <Box className="col-span-1">
          <ChartCard title="Revenue Growth Trends" subheader="Target vs Actual monthly generated payments">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueDataFinal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            title="Recent Inbound Leads"
            subheader="Overview of the latest qualified inquiries"
            action={
              <Button size="small" variant="text" color="secondary" onClick={() => navigate('/super_admin/leads')}>
                View All Leads
              </Button>
            }
            noPadding
          >
            <AppTable
              columns={leadsColumns}
              data={recentLeads}
              onRowClick={(row) => navigate(`/super_admin/leads/details/${row.id}`)}
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
                  onClick={() => navigate('/super_admin/consultations/calendar')}
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

export default SuperAdminDashboard;
