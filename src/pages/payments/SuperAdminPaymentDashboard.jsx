import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Icons
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LinkIcon from '@mui/icons-material/Link';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Components & Services
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../hooks/useAuth';

export const SuperAdminPaymentDashboard = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser, isViewOnlyMenu } = useAuth();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages
  });

  const roleConfig = (customizationSettings?.[currentUser?.id] || customizationSettings?.[currentUser?.role]) || {};
  const financeActions = roleConfig.actions?.finance || { canGeneratePaymentLink: true, canUpdatePaymentStatus: true };
  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Finance');

  const [tabValue, setTabValue] = useState(0);

  // Modal triggers
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    serviceId: 'dnv',
    packageId: 'full_process',
    amount: '',
    discount: '0',
    status: 'Pending Payment',
    paymentMethod: '-',
    thirdPartyPayment: 'No'
  });

  const [linkForm, setLinkForm] = useState({
    clientName: '',
    amount: '',
    description: ''
  });

  const [generatedLink, setGeneratedLink] = useState('');

  // Queries
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: dbService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      showAlert('Invoice generated successfully', 'success');
      setInvoiceModalOpen(false);
      setInvoiceForm({
        clientId: '',
        serviceId: 'dnv',
        packageId: 'full_process',
        amount: '',
        discount: '0',
        status: 'Pending Payment',
        paymentMethod: '-',
        thirdPartyPayment: 'No'
      });
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ id, status, method, txId }) => dbService.updatePaymentStatus(id, status, method, txId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Payment status updated successfully', 'success');
    }
  });

  const backupFileMutation = useMutation({
    mutationFn: dbService.triggerAWSBackup,
    onSuccess: () => {
      showAlert('Document successfully archived to secure AWS storage bucket!', 'success');
    }
  });

  // Calculations
  const getRevenueStats = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Total paid, total refunded, total outstanding
    let totalPaid = 0;
    let totalRefunded = 0;
    let totalOutstanding = 0;
    let expectedRevenue = 0;

    let revenueToday = 0;
    let revenueThisWeek = 0;
    let revenueThisMonth = 0;
    let revenueThisYear = 0;

    const uniquePaidClients = new Set();

    payments.forEach(p => {
      const amt = p.amount - (p.discount || 0);
      expectedRevenue += amt;

      if (p.status === 'Paid') {
        totalPaid += p.totalPaid;
        uniquePaidClients.add(p.clientId);

        const pDate = p.billingDate;
        if (pDate === todayStr) {
          revenueToday += p.totalPaid;
        }

        // Month / Year approximations
        if (pDate.startsWith('2026-06')) {
          revenueThisMonth += p.totalPaid;
        }
        if (pDate.startsWith('2026')) {
          revenueThisYear += p.totalPaid;
        }

        // Simple week check (e.g. from June 20th onwards)
        if (new Date(pDate) >= new Date('2026-06-20')) {
          revenueThisWeek += p.totalPaid;
        }
      } else if (p.status === 'Refunded (50%)' || p.status === 'Refunded') {
        totalRefunded += Math.abs(p.totalPaid || p.amount);
      } else if (p.status === 'Pending' || p.status === 'Pending Payment' || p.status === 'Overdue') {
        totalOutstanding += amt;
      }
    });

    const netRevenue = totalPaid - totalRefunded;

    return {
      totalPaid,
      totalRefunded,
      totalOutstanding,
      expectedRevenue,
      netRevenue,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      revenueThisYear,
      totalPaidClients: uniquePaidClients.size
    };
  };

  const revenueStats = getRevenueStats();

  const stats = [
    { title: 'Total Collected Revenue', value: `€${revenueStats.totalPaid.toLocaleString()}`, icon: <CheckCircleIcon />, color: '#22C55E' },
    { title: 'Expected Revenue (Gross)', value: `€${revenueStats.expectedRevenue.toLocaleString()}`, icon: <PaymentsIcon />, color: '#2563EB' },
    { title: 'Outstanding Receivables', value: `€${revenueStats.totalOutstanding.toLocaleString()}`, icon: <RequestQuoteIcon />, color: '#F59E0B' },
    { title: 'Net Revenue (Excl. Refunds)', value: `€${revenueStats.netRevenue.toLocaleString()}`, icon: <HighlightOffIcon />, color: '#8B5CF6' }
  ];

  const timeStats = [
    { label: 'Revenue Today', value: `€${revenueStats.revenueToday.toLocaleString()}` },
    { label: 'Revenue This Week', value: `€${revenueStats.revenueThisWeek.toLocaleString()}` },
    { label: 'Revenue This Month', value: `€${revenueStats.revenueThisMonth.toLocaleString()}` },
    { label: 'Revenue This Year', value: `€${revenueStats.revenueThisYear.toLocaleString()}` },
    { label: 'Total Paid Clients', value: `${revenueStats.totalPaidClients}` }
  ];

  // Pie chart calculations (Payment method share)
  const methodDataMap = payments.reduce((acc, curr) => {
    if (curr.status !== 'Paid') return acc;
    const m = curr.paymentMethod || 'Visa';
    acc[m] = (acc[m] || 0) + curr.totalPaid;
    return acc;
  }, {});
  const methodData = Object.entries(methodDataMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444'];

  // Bar chart calculations (Revenue by service)
  const serviceDataMap = payments.reduce((acc, curr) => {
    if (curr.status !== 'Paid') return acc;
    const s = curr.serviceId === 'dnv' ? 'Digital Nomad' : curr.serviceId === 'nlv' ? 'NLV' : curr.serviceId === 'study' ? 'Study' : curr.serviceId === 'property' ? 'Golden Visa' : 'Others';
    acc[s] = (acc[s] || 0) + curr.totalPaid;
    return acc;
  }, {});
  const serviceData = Object.entries(serviceDataMap).map(([name, value]) => ({ name, value }));

  // Helper form submits
  const handleGenerateInvoice = () => {
    const client = clients.find(c => c.id === invoiceForm.clientId);
    if (!client) {
      showAlert('Please select a client', 'warning');
      return;
    }
    createInvoiceMutation.mutate({
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      serviceId: invoiceForm.serviceId,
      packageId: invoiceForm.packageId,
      amount: Number(invoiceForm.amount),
      discount: Number(invoiceForm.discount),
      status: invoiceForm.status,
      paymentMethod: invoiceForm.paymentMethod,
      thirdPartyPayment: invoiceForm.thirdPartyPayment
    });
  };

  const handleGeneratePaymentLink = () => {
    if (!linkForm.clientName || !linkForm.amount) {
      showAlert('Please enter client name and amount', 'warning');
      return;
    }
    const slug = Math.random().toString(36).substr(2, 6).toUpperCase();
    const link = `https://pay.aaabusinessconsultancy.com/checkout/${slug}`;
    setGeneratedLink(link);
    showAlert('Payment Link generated successfully', 'success');
  };

  const handleViewReceipt = (invoice) => {
    setSelectedInvoice(invoice);
    setReceiptModalOpen(true);
  };

  const handleAWSBackup = (invoice) => {
    backupFileMutation.mutate({
      name: `${invoice.id}_invoice.pdf`,
      size: '144 KB',
      category: 'Invoice Storage'
    });
  };

  return (
    <Box>
      <PageHeader
        title="Revenue Dashboard"
        subtitle="Review relocation revenues, outstanding balances, generated payment links, and receipts."
      />

      {/* Overview stats */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {stats.map((st, idx) => (
          <Box key={idx}>
            <StatCard title={st.title} value={st.value} icon={st.icon} color={st.color} />
          </Box>
        ))}
      </Box>

      {/* Time Breakdown Cards */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Box className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {timeStats.map((ts, idx) => (
            <Box key={idx} className="col-span-1 text-center" sx={{ borderRight: idx < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                {ts.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                {ts.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Tab panel controls */}
      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Charts & Visual Insights" />
        <Tab label="Billing & Payments List" />
        <Tab label="Client Financial Ledger" />
        <Tab label="Payment Link & Invoice Console" />
      </Tabs>

      {/* Tab 0: Charts */}
      {tabValue === 0 && (
        <Box className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <Box className="col-span-12 md:col-span-6">
            <ChartCard title="Revenue Share by Payment Method" subheader="Stripe, Tabby, Tamara, Visa etc.">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    fontSize={10}
                    fontWeight={600}
                  >
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip formatter={(value) => `€${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Box>

          <Box className="col-span-12 md:col-span-6">
            <ChartCard title="Revenue Share by Service" subheader="Digital Nomad, Golden Visa, Student visa revenues">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                  <YAxis fontSize={11} stroke="#94A3B8" />
                  <ChartTooltip formatter={(value) => `€${value}`} />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Box>
        </Box>
      )}

      {/* Tab 1: Billing & Payments */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Generated Invoices Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track client payments, payment methods, transaction reference keys, and initiate receipts generation or cloud storage backup.
          </Typography>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Invoice ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Due Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Paid Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Gateway Method</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => {
                  const dueAmt = p.amount - (p.discount || 0);
                  const formattedDueDate = p.dueDate ? (p.dueDate.includes('T') ? p.dueDate.split('T')[0] : p.dueDate) : 'N/A';
                  const displayInvoiceId = p.id ? `INV-${p.id.slice(0, 8)}` : 'INV-00000000';
                  return (
                    <TableRow key={p.id}>
                      <TableCell sx={{ fontWeight: 700, color: '#4F46E5', whiteSpace: 'nowrap' }} title={p.id}>{displayInvoiceId}</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{p.clientName}</TableCell>
                      <TableCell sx={{ textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{p.serviceId}</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>€{dueAmt.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 600, whiteSpace: 'nowrap' }}>€{p.totalPaid.toLocaleString()}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', color: '#475569', fontWeight: 500 }}>{formattedDueDate}</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{p.paymentMethod}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          label={p.status}
                          size="small"
                          color={p.status === 'Paid' ? 'success' : p.status === 'Refunded (50%)' ? 'error' : 'warning'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                          {!isViewOnly && p.status !== 'Paid' && p.status !== 'Refunded (50%)' && financeActions.canUpdatePaymentStatus !== false && (
                            <Button size="small" variant="contained" color="success" onClick={() => updatePaymentStatusMutation.mutate({ id: p.id, status: 'Paid', method: 'Visa', txId: 'TXN-' + Date.now() })}>
                              Mark Paid
                            </Button>
                          )}
                          {p.status === 'Paid' && (
                            <Button size="small" variant="outlined" color="primary" onClick={() => handleViewReceipt(p)}>
                              Receipt
                            </Button>
                          )}
                          <Button size="small" variant="text" color="secondary" onClick={() => handleAWSBackup(p)}>
                            AWS Backup
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 2: Client Financial Ledger */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Client Outstanding Balances Sheet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Monitor consultant assignments, package scopes, fee metrics, paid limits, outstanding totals, and case statuses.
          </Typography>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Client Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Consultant</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Package Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Total Fee</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Paid Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Remaining Balance</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Case Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((c) => {
                  const clientInvoices = payments.filter(p => p.clientId === c.id);
                  const totalFee = clientInvoices.reduce((acc, curr) => acc + curr.amount - (curr.discount || 0), 0);
                  const totalPaid = clientInvoices.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.totalPaid, 0);
                  const remaining = totalFee - totalPaid;
                  const agentName = agents.find(a => a.id === c.assignedConsultantId)?.name || 'Unassigned';

                  return (
                    <TableRow key={c.id}>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{c.firstName} {c.lastName}</TableCell>
                      <TableCell sx={{ textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{c.serviceId}</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{agentName}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{c.packageId ? c.packageId.replace('_', ' ') : 'Standard'}</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>€{totalFee.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 600, whiteSpace: 'nowrap' }}>€{totalPaid.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: remaining > 0 ? 'warning.main' : 'text.primary', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        €{remaining.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip label={c.status} variant="outlined" size="small" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 3: Billing link and Invoice form Console */}
      {tabValue === 3 && (
        <Box spacing={3}>
          {/* Invoice Generation Form */}
          <Box xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Invoice Generation Console
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate customized invoices for clients.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="client-select-label">Select Client</InputLabel>
                  <Select
                    labelId="client-select-label"
                    value={invoiceForm.clientId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                    label="Select Client"
                  >
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="service-select-label">Select Service</InputLabel>
                  <Select
                    labelId="service-select-label"
                    value={invoiceForm.serviceId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, serviceId: e.target.value })}
                    label="Select Service"
                  >
                    <MenuItem value="dnv">Digital Nomad Visa (DNV)</MenuItem>
                    <MenuItem value="nlv">Non-Lucrative Visa (NLV)</MenuItem>
                    <MenuItem value="study">Study Visa</MenuItem>
                    <MenuItem value="property">Golden Visa (Property Investment)</MenuItem>
                    <MenuItem value="family">Family Reunification</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="package-select-label">Select Package</InputLabel>
                  <Select
                    labelId="package-select-label"
                    value={invoiceForm.packageId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, packageId: e.target.value })}
                    label="Select Package"
                  >
                    <MenuItem value="standard">Standard Consultation</MenuItem>
                    <MenuItem value="full_process">Full Process Service</MenuItem>
                    <MenuItem value="premium">Premium Process Service</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Amount Fee (€)"
                  type="number"
                  fullWidth
                  size="small"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                />

                <TextField
                  label="Discount (€)"
                  type="number"
                  fullWidth
                  size="small"
                  value={invoiceForm.discount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })}
                />

                <Button variant="contained" color="primary" onClick={handleGenerateInvoice} disabled={isViewOnly || createInvoiceMutation.isPending || financeActions.canGeneratePaymentLink === false}>
                  Create Invoice
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Payment Link Generation Form */}
          <Box xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Payment Link Generator
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate rapid payment URLs for credit card processing or deposit collections.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Client Name"
                  fullWidth
                  size="small"
                  value={linkForm.clientName}
                  onChange={(e) => setLinkForm({ ...linkForm, clientName: e.target.value })}
                />

                <TextField
                  label="Deposit Amount (€)"
                  type="number"
                  fullWidth
                  size="small"
                  value={linkForm.amount}
                  onChange={(e) => setLinkForm({ ...linkForm, amount: e.target.value })}
                />

                <TextField
                  label="Payment Description / Category"
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  value={linkForm.description}
                  onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                />

                <Button variant="contained" color="secondary" startIcon={<LinkIcon />} onClick={handleGeneratePaymentLink} disabled={isViewOnly || financeActions.canGeneratePaymentLink === false}>
                  Generate Payment Link
                </Button>

                {generatedLink && (
                  <Box sx={{ p: 2, mt: 1, bgcolor: 'background.neutral', borderRadius: 2, border: '1px dotted', borderColor: 'primary.main', wordBreak: 'break-all' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      GENERATED CHECKOUT LINK:
                    </Typography>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                      {generatedLink}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Modal: Receipt View */}
      <AppModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Payment Receipt details"
      >
        {selectedInvoice && (
          <Box sx={{ p: 1 }}>
            <Typography variant="h6" align="center" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
              AAA BUSINESS CONSULTANCY
            </Typography>
            <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ mb: 3 }}>
              Calle Gran Via 45, Madrid, Spain | info@aaabusinessconsultancy.com
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box spacing={2} sx={{ mb: 3 }}>
              <Box xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>RECEIPT FOR:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedInvoice.clientName}</Typography>
              </Box>
              <Box xs={6} align="right">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>INVOICE ID:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedInvoice.id}</Typography>
              </Box>
              <Box xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PAYMENT DATE:</Typography>
                <Typography variant="subtitle2">{selectedInvoice.billingDate}</Typography>
              </Box>
              <Box xs={6} align="right">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TRANSACTION REFERENCE:</Typography>
                <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>{selectedInvoice.transactionId}</Typography>
              </Box>
            </Box>

            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'background.neutral' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ textTransform: 'uppercase' }}>
                      Residency processing fee ({selectedInvoice.serviceId}) - {selectedInvoice.packageId}
                    </TableCell>
                    <TableCell align="right">€{selectedInvoice.amount.toLocaleString()}</TableCell>
                  </TableRow>
                  {selectedInvoice.discount > 0 && (
                    <TableRow>
                      <TableCell sx={{ fontStyle: 'italic', color: 'error.main' }}>Discount Applied</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>-€{selectedInvoice.discount.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  <TableRow sx={{ bgcolor: 'background.neutral' }}>
                    <TableCell sx={{ fontWeight: 900 }}>Total Paid (Net)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, color: 'success.main' }}>
                      €{selectedInvoice.totalPaid.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="outlined" color="primary" onClick={() => showAlert('Downloading Receipt PDF...', 'info')}>
                Download PDF
              </Button>
              <Button variant="contained" color="success" startIcon={<CloudUploadIcon />} onClick={() => { handleAWSBackup(selectedInvoice); setReceiptModalOpen(false); }}>
                Backup to S3
              </Button>
            </Box>
          </Box>
        )}
      </AppModal>
    </Box>
  );
};

export default SuperAdminPaymentDashboard;
