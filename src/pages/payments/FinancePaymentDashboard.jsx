import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { downloadLetterheadReceiptPDF } from '../../utils/receiptPdfGenerator';
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
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
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
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import useAuth from '../../hooks/useAuth';

export const FinancePaymentDashboard = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { isViewOnlyMenu } = useAuth();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

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
  // Queries
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: dbService.getRevenueAnalytics
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments
  });

  const { data: refundRequests = [] } = useQuery({
    queryKey: ['refundRequests'],
    queryFn: dbService.getRefundRequests
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents
  });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: dbService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-analytics'] });
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
      queryClient.invalidateQueries({ queryKey: ['revenue-analytics'] });
      showAlert('Payment status updated successfully', 'success');
    }
  });

  const backupFileMutation = useMutation({
    mutationFn: dbService.triggerAWSBackup,
    onSuccess: () => {
      showAlert('Document successfully archived to secure AWS storage bucket!', 'success');
    }
  });

  // Currency Formatter Helper
  const formatEUR = (val) => `€${(Number(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Core Revenue Metrics from Authoritative Backend Service
  const totalRevenue = analytics?.totalRevenue ?? 0;
  const revenueToday = analytics?.revenueToday ?? 0;
  const revenueThisWeek = analytics?.revenueThisWeek ?? 0;
  const revenueThisMonth = analytics?.revenueThisMonth ?? 0;
  const revenueThisYear = analytics?.revenueThisYear ?? 0;
  const outstandingRevenue = analytics?.outstandingRevenue ?? 0;
  const netRevenue = analytics?.netRevenue ?? 0;
  const totalRefunded = analytics?.totalRefunded ?? 0;
  const totalPaidClients = analytics?.totalPaidClients ?? 0;
  const revenueByService = analytics?.revenueByService || [];
  const revenueByConsultant = analytics?.revenueByConsultant || [];
  const revenueByPaymentMethod = analytics?.revenueByPaymentMethod || [];

  const stats = [
    { title: 'Total Revenue', value: formatEUR(totalRevenue), icon: <CheckCircleIcon />, color: '#22C55E' },
    { title: 'Outstanding Receivables', value: formatEUR(outstandingRevenue), icon: <RequestQuoteIcon />, color: '#F59E0B' },
    { title: 'Total Net Revenue', value: formatEUR(netRevenue), icon: <PaymentsIcon />, color: '#051A3B' }
  ];

  const timeStats = [
    { label: 'Revenue Today (Net)', value: formatEUR(revenueToday) },
    { label: 'Revenue This Week (Net)', value: formatEUR(revenueThisWeek) },
    { label: 'Revenue This Month (Net)', value: formatEUR(revenueThisMonth) },
    { label: 'Revenue This Year (Net)', value: formatEUR(revenueThisYear) },
    { label: 'Total Paid Clients', value: `${totalPaidClients}` }
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#64748B'];

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
      showAlert('Client Name and Amount are required', 'warning');
      return;
    }
    const mockUrl = `${window.location.origin}/#/portal/pay?client=${encodeURIComponent(linkForm.clientName)}&amt=${linkForm.amount}&ref=PL-${Date.now()}`;
    setGeneratedLink(mockUrl);
    showAlert('Payment Link generated successfully!', 'success');
  };

  const handleViewReceipt = (invoice) => {
    setSelectedInvoice(invoice);
    setReceiptModalOpen(true);
  };

  const handleDownloadReceiptPDF = (inv) => {
    downloadLetterheadReceiptPDF(inv, showAlert);
  };

  const handleAWSBackup = (invoice) => {
    backupFileMutation.mutate({
      id: invoice.id,
      title: `Invoice-Backup-${invoice.id}`,
      type: 'invoice_backup'
    });
  };

  return (
    <Box>
      <PageHeader
        title="Revenue Dashboard"
        subtitle="Review relocation revenues, outstanding balances, generated payment links, and receipts."
      />

      {/* Overview stats */}
      <Box className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3 mb-4">
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

      {/* Tab 0: Production-Ready Revenue Analytics */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Top Row: Revenue by Service & Revenue by Payment Method */}
          <Box className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* 1. Revenue by Service */}
            <Box className="col-span-12 lg:col-span-7">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Revenue by Service & Package
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Breakdown of recognized revenue and deal volume by service category
                    </Typography>
                  </Box>
                  <Chip label={`${revenueByService.length} Services`} size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9' }} />
                </Box>

                <Box sx={{ height: 220, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByService} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="service" fontSize={10} stroke="#64748B" tickFormatter={(val) => val.length > 14 ? val.slice(0, 14) + '…' : val} />
                      <YAxis fontSize={10} stroke="#64748B" tickFormatter={(val) => `€${val}`} />
                      <ChartTooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                <TableContainer sx={{ mt: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Deals</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 140 }}>Share</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {revenueByService.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            No service revenue data yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        revenueByService.map((s, idx) => (
                          <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{s.service}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#16A34A', fontSize: '0.85rem' }}>{formatEUR(s.revenue)}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{s.transactionsCount}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress variant="determinate" value={Math.min(100, s.percentage)} sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#4F46E5' } }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 32, textAlign: 'right' }}>{s.percentage}%</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>

            {/* 2. Revenue by Payment Method */}
            <Box className="col-span-12 lg:col-span-5">
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Revenue by Payment Method
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transaction gateways and checkout method distribution
                  </Typography>
                </Box>

                <Box sx={{ height: 220, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByPaymentMethod.map(m => ({ name: m.method, value: m.revenue }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {revenueByPaymentMethod.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <TableContainer sx={{ mt: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Txns</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Share</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {revenueByPaymentMethod.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            No payment method data recorded.
                          </TableCell>
                        </TableRow>
                      ) : (
                        revenueByPaymentMethod.map((m, idx) => (
                          <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[idx % COLORS.length] }} />
                                {m.method}
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#16A34A', fontSize: '0.85rem' }}>{formatEUR(m.revenue)}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{m.transactionsCount}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{m.percentage}%</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Box>

          {/* Bottom Row: Revenue by Consultant Performance Table */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Revenue by Consultant / Agent Performance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Attributed closed revenue and deal contribution per assigned team consultant
                </Typography>
              </Box>
              <Chip label={`${revenueByConsultant.length} Team Members`} size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9' }} />
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Consultant / Agent</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total Revenue Closed</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Successful Deals</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 220 }}>Revenue Share Contribution</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenueByConsultant.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No consultant-attributed revenue recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    revenueByConsultant.map((c, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={c.avatar}
                              alt={c.consultantName}
                              sx={{ width: 32, height: 32, bgcolor: '#4F46E5', fontSize: '0.8rem', fontWeight: 800 }}
                            >
                              {c.consultantName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.consultantName}</Typography>
                              <Typography variant="caption" color="text.secondary">{c.consultantId === 'unassigned' ? 'Unassigned Lead/Client' : 'Immigration Consultant'}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#16A34A', fontSize: '0.9rem' }}>{formatEUR(c.revenue)}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.transactionsCount}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, c.percentage)}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#10B981' } }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 42, textAlign: 'right' }}>{c.percentage}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
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
                  const formattedDueDate = p.dueDate ? (dayjs(p.dueDate).isValid() ? dayjs(p.dueDate).format('DD/MM/YYYY') : p.dueDate) : 'N/A';
                  const displayInvoiceId = p.invoiceNumber || (p.id ? `INV-${p.id.slice(0, 8)}` : 'INV-00000000');
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
                          color={p.status === 'Paid' ? 'success' : (p.status && p.status.includes('Refunded')) ? 'error' : 'warning'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                          {!isViewOnly && p.status !== 'Paid' && !(p.status && p.status.includes('Refunded')) && (
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
                  const agentName = agents.find(a => a.id === c.assignedToId)?.name || 'Unassigned';

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
        <Box className="grid grid-cols-12 gap-2">
          {/* Invoice Generation Form */}
          <Box className="col-span-12 md:col-span-6">
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

                <Button variant="contained" color="primary" onClick={handleGenerateInvoice} disabled={isViewOnly || createInvoiceMutation.isPending}>
                  Create Invoice
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Payment Link Generation Form */}
          <Box className="col-span-12 md:col-span-6">
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

                <Button variant="contained" color="secondary" startIcon={<LinkIcon />} onClick={handleGeneratePaymentLink} disabled={isViewOnly}>
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
              Business Village, Block B, 4th Floor, Office F09, Port Saeed, Deira, Dubai, UAE | info@aaabusinessconsultancy.com
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box className="grid grid-cols-12 gap-2" sx={{ mb: 3 }}>
              <Box className="col-span-6">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>RECEIPT FOR:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedInvoice.clientName}</Typography>
              </Box>
              <Box className="col-span-6" align="right">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>INVOICE ID:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedInvoice.invoiceNumber || selectedInvoice.id}</Typography>
              </Box>
              <Box className="col-span-6">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PAYMENT DATE:</Typography>
                <Typography variant="subtitle2">{selectedInvoice.billingDate ? (dayjs(selectedInvoice.billingDate).isValid() ? dayjs(selectedInvoice.billingDate).format('DD/MM/YYYY') : selectedInvoice.billingDate) : 'N/A'}</Typography>
              </Box>
              <Box className="col-span-6" align="right">
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
              <Button variant="outlined" color="primary" onClick={() => handleDownloadReceiptPDF(selectedInvoice)}>
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

export default FinancePaymentDashboard;
