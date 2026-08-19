import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Components
import PageHeader from '../../components/PageHeader';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import useAuth from '../../hooks/useAuth';
import { validateIBAN, normalizeIBAN, maskIBAN, formatIBAN } from '../../utils/ibanValidator';
const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return String(dateStr);
  }
};

export const SuperAdminRefundCommissionHub = () => {
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser, isViewOnlyMenu } = useAuth();

  React.useEffect(() => {
    const hash = window.location.hash || window.location.search;
    if (hash.includes('tab=coupons') || hash.includes('tab=2')) {
      setTabValue(2);
    }
  }, []);

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Finance');

  // Modals state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [activeAuditRefund, setActiveAuditRefund] = useState(null);
  const [auditAmount, setAuditAmount] = useState('');
  const [auditPayoutMethod, setAuditPayoutMethod] = useState('Manual Bank Transfer');
  const [auditTransactionRef, setAuditTransactionRef] = useState('');
  const [auditNotes, setAuditNotes] = useState('');

  React.useEffect(() => {
    if (activeAuditRefund) {
      setAuditAmount(activeAuditRefund.amount !== undefined ? activeAuditRefund.amount : '');
      setAuditPayoutMethod('Manual Bank Transfer');
    }
  }, [activeAuditRefund]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingPayoutAction, setPendingPayoutAction] = useState(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyAgentId, setHistoryAgentId] = useState(null);
  const [historyAgentName, setHistoryAgentName] = useState('');

  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [refundCategory, setRefundCategory] = useState('Visa Rejection');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundBankName, setRefundBankName] = useState('');
  const [refundBankIban, setRefundBankIban] = useState('');
  const [refundBankSwift, setRefundBankSwift] = useState('');
  const [refundFile, setRefundFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [commissionType, setCommissionType] = useState('10%');
  const [commissionValue, setCommissionValue] = useState('10');

  // Queries
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: dbService.getClients });
  const { data: refunds = [], isLoading: loadingRefunds } = useQuery({ queryKey: ['refundRequests'], queryFn: dbService.getRefundRequests });
  const { data: commissionReport = [], isLoading: loadingReport } = useQuery({ queryKey: ['commissionsReport'], queryFn: dbService.getCommissionsReport });
  const { data: commissionRates = [], isLoading: loadingRates } = useQuery({ queryKey: ['commission-rates'], queryFn: dbService.getCommissionRates });
  const { data: agents = [] } = useQuery({ queryKey: ['agents'], queryFn: dbService.getAgents });

  const { data: commissionHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['commission-history', historyAgentId],
    queryFn: () => dbService.getCommissionHistory(historyAgentId),
    enabled: !!historyAgentId
  });

  // Coupon Management State & Queries
  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ['coupons'],
    queryFn: dbService.getCoupons
  });

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountPercent, setNewDiscountPercent] = useState('10');

  const createCouponMutation = useMutation({
    mutationFn: ({ code, discountPercent }) => dbService.createCoupon(code, discountPercent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showAlert('Coupon created successfully!', 'success');
      setNewCouponCode('');
      setNewDiscountPercent('10');
    },
    onError: (err) => {
      showAlert(err?.response?.data?.message || 'Failed to create coupon', 'error');
    }
  });

  const deactivateCouponMutation = useMutation({
    mutationFn: (id) => dbService.deactivateCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showAlert('Coupon deactivated successfully!', 'success');
    },
    onError: (err) => {
      showAlert(err?.response?.data?.message || 'Failed to deactivate coupon', 'error');
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id) => dbService.deleteCouponPermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showAlert('Coupon permanently deleted!', 'success');
    },
    onError: (err) => {
      showAlert(err?.response?.data?.message || 'Failed to delete coupon', 'error');
    }
  });

  // Mutations
  const createRefundMutation = useMutation({
    mutationFn: dbService.createRefundRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['refundRequests'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      showAlert('Refund request created successfully', 'success');
      setRefundModalOpen(false);
      setSelectedClientId('');
      setRefundReason('');
      setRefundAmount('');
      setRefundBankName('');
      setRefundBankIban('');
      setRefundBankSwift('');
      setRefundFile(null);
    }
  });

  const updateRefundStatusMutation = useMutation({
    mutationFn: ({ refundId, status, payoutMethod, transactionRef, adminNotes, amount }) =>
      dbService.updateRefundStatus(refundId, status, payoutMethod, transactionRef, adminNotes, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['refundRequests'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      showAlert('Refund status updated successfully!', 'success');
      setAuditModalOpen(false);
      setActiveAuditRefund(null);
    }
  });

  const updateCommissionRateMutation = useMutation({
    mutationFn: ({ agentId, type, value }) => dbService.updateCommissionRate(agentId, type, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rates'] });
      queryClient.invalidateQueries({ queryKey: ['commission-report'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showAlert('Commission rate modified successfully', 'success');
      setRateModalOpen(false);
    }
  });

  // Helpers
  const handleCreateRefund = async () => {
    if (!selectedClientId || !refundReason) {
      showAlert('Please select a client and provide a reason', 'warning');
      return;
    }

    let proofUrl = null;
    if (refundFile) {
      try {
        setUploadingProof(true);
        const uploadedDoc = await dbService.uploadDocument({
          file: refundFile,
          clientId: selectedClientId,
          category: 'Visa Rejection Letter',
          fileName: refundFile.name
        });
        proofUrl = uploadedDoc?.fileUrl || null;
      } catch (err) {
        console.error('Failed to upload proof document:', err);
        showAlert('Warning: Proof document upload failed. Submitting refund request without attachment.', 'warning');
      } finally {
        setUploadingProof(false);
      }
    }

    let normalizedIban = undefined;
    if (refundBankIban && refundBankIban.trim()) {
      const ibanCheck = validateIBAN(refundBankIban);
      if (!ibanCheck.valid) {
        showAlert(`Invalid IBAN: ${ibanCheck.error || 'Please provide a valid IBAN'}`, 'error');
        return;
      }
      normalizedIban = ibanCheck.normalizedIBAN;
    }

    createRefundMutation.mutate({
      clientId: selectedClientId,
      category: refundCategory,
      reason: refundReason,
      amount: refundCategory === 'Visa Rejection' ? undefined : Number(refundAmount),
      bankAccountName: refundBankName || undefined,
      bankIban: normalizedIban,
      bankSwift: refundBankSwift || undefined,
      proofUrl: proofUrl || undefined
    });
  };

  const handleUpdateRefundStatus = (id, status) => {
    updateRefundStatusMutation.mutate({ refundId: id, status });
  };

  const handleOpenRateModal = (agent) => {
    setSelectedAgentId(agent.id);
    const existingType = agent.commissionType || '10%';
    const existingValue = agent.commissionRate !== undefined && agent.commissionRate !== null ? agent.commissionRate : 10;
    setCommissionType(existingType);
    setCommissionValue(String(existingValue));
    setRateModalOpen(true);
  };

  const handleOpenHistoryModal = (agent) => {
    setHistoryAgentId(agent.id);
    setHistoryAgentName(agent.name || agent.fullName || 'Agent');
    setHistoryModalOpen(true);
  };

  const handleUpdateCommissionRate = () => {
    updateCommissionRateMutation.mutate({
      agentId: selectedAgentId,
      type: commissionType,
      value: commissionType === '5%' ? 5 : commissionType === '10%' ? 10 : Number(commissionValue)
    });
  };

  // Performance calculations
  const [refundTimeFilter, setRefundTimeFilter] = useState('all');

  const getAgentPerformance = () => {
    return agents.map(agent => {
      const agentReports = commissionReport.filter(r => r.agentId === agent.id);
      const packagesSold = agentReports.length;
      const totalEarned = agentReports.reduce((sum, r) => sum + r.commissionEarned, 0);
      const totalPaid = agentReports.reduce((sum, r) => sum + r.commissionPaid, 0);
      const currentRate = { type: agent.commissionType || '10%', value: agent.commissionRate || 10 };

      return {
        ...agent,
        packagesSold,
        totalEarned,
        totalPaid,
        structure: currentRate.type === 'fixed' ? `€${currentRate.value}` : `${currentRate.value}%`
      };
    });
  };

  const agentPerformance = getAgentPerformance();

  const getDateStr = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch (e) {
      return '';
    }
  };

  const isRefundToday = (ref) => {
    if (!ref) return false;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayLocal = `${y}-${m}-${d}`;
    const todayUtc = now.toISOString().split('T')[0];
    const todaySlash = `${d}/${m}/${y}`;

    const rDate = getDateStr(ref.updatedAt || ref.createdAt || ref.date);
    const rawDateStr = String(ref.date || '');

    return rDate === todayLocal || rDate === todayUtc || rawDateStr.startsWith(todaySlash);
  };

  const isRefundThisMonth = (ref) => {
    if (!ref) return false;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const monthLocal = `${y}-${m}`;
    const monthUtc = now.toISOString().substring(0, 7);
    const monthSlash = `/${m}/${y}`;

    const rDate = getDateStr(ref.updatedAt || ref.createdAt || ref.date);
    const rawDateStr = String(ref.date || '');

    return rDate.startsWith(monthLocal) || rDate.startsWith(monthUtc) || rawDateStr.includes(monthSlash);
  };

  const isRefundThisYear = (ref) => {
    if (!ref) return false;
    const now = new Date();
    const yearStr = `${now.getFullYear()}`;
    const rDate = getDateStr(ref.updatedAt || ref.createdAt || ref.date);
    const rawDateStr = String(ref.date || '');

    return rDate.startsWith(yearStr) || rawDateStr.endsWith(yearStr);
  };

  const getRefundMetrics = () => {
    const processedRefunds = (Array.isArray(refunds) ? refunds : []).filter(
      r => r && (r.status === 'Processed' || r.status === 'Approved' || r.status === 'Refunded' || r.status === 'Completed' || r.status === 'Paid')
    );

    const dailyRefunds = processedRefunds.filter(isRefundToday);
    const monthlyRefunds = processedRefunds.filter(isRefundThisMonth);
    const yearlyRefunds = processedRefunds.filter(isRefundThisYear);

    const dailyTotal = dailyRefunds.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const monthlyTotal = monthlyRefunds.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const yearlyTotal = yearlyRefunds.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const totalAllRefunds = processedRefunds.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    return {
      dailyTotal,
      dailyCount: dailyRefunds.length,
      monthlyTotal,
      monthlyCount: monthlyRefunds.length,
      yearlyTotal,
      yearlyCount: yearlyRefunds.length,
      totalAllRefunds,
      totalAllCount: processedRefunds.length
    };
  };

  const refundMetrics = getRefundMetrics();

  const filteredRefunds = (Array.isArray(refunds) ? refunds : []).filter(ref => {
    if (!ref) return false;
    if (refundTimeFilter === 'all') return true;
    if (refundTimeFilter === 'daily') return isRefundToday(ref);
    if (refundTimeFilter === 'monthly') return isRefundThisMonth(ref);
    if (refundTimeFilter === 'yearly') return isRefundThisYear(ref);
    return true;
  });

  return (
    <Box>
      <PageHeader
        title="Refund & Commission Hub"
        subtitle="Manage consultant commission percentages, track payouts, request service refunds, and audit visa rejections."
      />

      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Commission Management" />
        <Tab label="Refund Management" />
        <Tab label="🎟️ Coupons & Discounts" />
      </Tabs>

      {/* Tab 1: Commission Management */}
      {tabValue === 0 && (
        <Box className="grid grid-cols-12 gap-2">
          <Box className="col-span-12">
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Agent Commission Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Adjust automatic payout parameters, structure commission types (5%, 10%, Custom or Fixed), and audit agent balances.
              </Typography>

              <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
                <Table sx={{ minWidth: 850 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Agent Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rate Structure</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Packages Sold</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Commission Earned</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Commission Paid</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Commission Pending</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {agentPerformance.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{agent.name}</TableCell>
                        <TableCell>
                          <Chip label={agent.structure} color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{agent.packagesSold}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>€{(Number(agent.totalEarned) || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>€{(Number(agent.totalPaid) || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ color: 'warning.main', fontWeight: 700 }}>€{((Number(agent.totalEarned) || 0) - (Number(agent.totalPaid) || 0)).toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Tooltip title="View Rate Change History">
                            <IconButton size="small" onClick={() => handleOpenHistoryModal(agent)} sx={{ color: 'primary.main' }}>
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {!isViewOnly && (
                            <Button size="small" variant="contained" color="secondary" onClick={() => handleOpenRateModal(agent)}>
                              Modify Rate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>

          {/* Commissions Ledger */}
          <Box className="col-span-12">
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Paid Invoices & Calculated Commissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Details of automatically parsed invoices, structures, and commission logs.
              </Typography>

              <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Invoice ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Consultant</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Amount Paid</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rate Structure</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Earned Commission</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commissionReport.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{formatDateDDMMYYYY(row.date)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.paymentId}</TableCell>
                        <TableCell>{row.clientName}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.agentName}</TableCell>
                        <TableCell>€{(Number(row.amountPaid) || 0).toLocaleString()}</TableCell>
                        <TableCell>{row.structure}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>
                          €{(Number(row.commissionEarned) || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {row.commissionPending === 0 ? (
                            <Chip label="Paid Out" color="success" size="small" sx={{ fontWeight: 700 }} />
                          ) : (
                            <Chip label="Accrued" color="warning" size="small" sx={{ fontWeight: 700 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Tab 2: Refund Management */}
      {tabValue === 1 && (
        <Box className="grid grid-cols-12 gap-2">
          {/* Refund Period Summary Cards */}
          <Box className="col-span-12" sx={{ mb: 1 }}>
            <Box className="grid grid-cols-12 gap-2">
              <Box className="col-span-12 sm:col-span-6 md:col-span-3">
                <Paper
                  onClick={() => setRefundTimeFilter('daily')}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '2px solid',
                    borderColor: refundTimeFilter === 'daily' ? 'primary.main' : 'divider',
                    bgcolor: refundTimeFilter === 'daily' ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    📅 Daily Refunds (Today)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#DC2626', mt: 0.5 }}>
                    €{refundMetrics.dailyTotal.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {refundMetrics.dailyCount} claims processed today
                  </Typography>
                </Paper>
              </Box>

              <Box className="col-span-12 sm:col-span-6 md:col-span-3">
                <Paper
                  onClick={() => setRefundTimeFilter('monthly')}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '2px solid',
                    borderColor: refundTimeFilter === 'monthly' ? 'primary.main' : 'divider',
                    bgcolor: refundTimeFilter === 'monthly' ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    🗓️ Monthly Refunds
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#B45309', mt: 0.5 }}>
                    €{refundMetrics.monthlyTotal.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {refundMetrics.monthlyCount} claims processed this month
                  </Typography>
                </Paper>
              </Box>

              <Box className="col-span-12 sm:col-span-6 md:col-span-3">
                <Paper
                  onClick={() => setRefundTimeFilter('yearly')}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '2px solid',
                    borderColor: refundTimeFilter === 'yearly' ? 'primary.main' : 'divider',
                    bgcolor: refundTimeFilter === 'yearly' ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    📆 Yearly Refunds
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#4F46E5', mt: 0.5 }}>
                    €{refundMetrics.yearlyTotal.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {refundMetrics.yearlyCount} claims processed this year
                  </Typography>
                </Paper>
              </Box>

              <Box className="col-span-12 sm:col-span-6 md:col-span-3">
                <Paper
                  onClick={() => setRefundTimeFilter('all')}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '2px solid',
                    borderColor: refundTimeFilter === 'all' ? 'primary.main' : 'divider',
                    bgcolor: refundTimeFilter === 'all' ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    📊 All Refunds Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mt: 0.5 }}>
                    €{refundMetrics.totalAllRefunds.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {refundMetrics.totalAllCount} total processed refunds
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>

          <Box className="col-span-12" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant={refundTimeFilter === 'daily' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setRefundTimeFilter('daily')}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                📅 Daily (Today)
              </Button>
              <Button
                variant={refundTimeFilter === 'monthly' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setRefundTimeFilter('monthly')}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                🗓️ Monthly
              </Button>
              <Button
                variant={refundTimeFilter === 'yearly' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setRefundTimeFilter('yearly')}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                📆 Yearly
              </Button>
              <Button
                variant={refundTimeFilter === 'all' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setRefundTimeFilter('all')}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                📊 All Time
              </Button>
            </Stack>

            {(['super_admin', 'admin', 'operations', 'finance'].includes(currentUser?.role) || !isViewOnly) && (
              <Button variant="contained" color="primary" onClick={() => setRefundModalOpen(true)}>
                + Request Refund
              </Button>
            )}
          </Box>

          <Box className="col-span-12 md:col-span-8 flex flex-col h-full">
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Refund Requests Ledger ({refundTimeFilter.toUpperCase()})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Monitor refund reviews, status approvals, and audit records. Note: Visa Rejection requests calculate 100% automatically for eligible packages.
              </Typography>

              <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Client ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Requested By</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Refund Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRefunds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary', fontWeight: 600 }}>
                          No refund claims found for this filter period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRefunds.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#051A3B' }}>
                            {ref.clientCode || (ref.clientId ? (ref.clientId.length > 10 ? `#${ref.clientId.substring(0, 8)}` : ref.clientId) : 'N/A')}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{ref.clientName}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={ref.bankAccountName ? 'Admin / Assisted' : 'Client Self-Service'}
                            color={ref.bankAccountName ? 'secondary' : 'default'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={ref.category} variant="outlined" color={ref.category === 'Visa Rejection' ? 'error' : 'default'} size="small" sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>€{(Number(ref.amount) || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDateDDMMYYYY(ref.date || ref.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={ref.status || 'Pending Review'}
                            color={ref.status === 'Processed' ? 'success' : ref.status === 'Approved' ? 'info' : ref.status === 'Rejected' || ref.status === 'Cancelled' ? 'error' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              onClick={() => {
                                setActiveAuditRefund(ref);
                                setAuditPayoutMethod('Stripe Automatic');
                                setAuditTransactionRef(ref.transactionRef || '');
                                setAuditNotes(ref.adminNotes || '');
                                setAuditModalOpen(true);
                              }}
                              sx={{ fontWeight: 700 }}
                            >
                              View & Audit
                            </Button>

                            {!isViewOnly && ref.status === 'Pending Review' && (
                              <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateRefundStatus(ref.id, 'Approved')}>
                                Approve
                              </Button>
                            )}
                            {!isViewOnly && ref.status === 'Pending Review' && (
                              <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateRefundStatus(ref.id, 'Cancelled')}>
                                Reject
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>

          {/* Refund Review Audit Logs */}
          <Box className="col-span-12 md:col-span-4 flex flex-col h-full">
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Refund Audit Trail
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Live real-time security logs of financial audit decisions.
              </Typography>

              <List sx={{ p: 0 }}>
                {refunds.flatMap(r => r.auditLogs || []).length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      No security audit logs recorded yet.
                    </Typography>
                  </Box>
                ) : (
                  refunds.flatMap(r => r.auditLogs || []).map((log, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
                      <ListItemText
                        primary={log.action}
                        secondary={
                          <React.Fragment>
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              By: {log.user}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Time: {new Date(log.date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Tab 3: Coupon & Discount Management */}
      {tabValue === 2 && (
        <Box className="grid grid-cols-12 gap-3">
          {/* Create Coupon Form Card */}
          <Box className="col-span-12 lg:col-span-4">
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#051A3B' }}>
                🎟️ Create New Coupon
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Generated coupons are percentage-based and valid for <strong>exactly 24 hours</strong> from creation. Coupons are single-use globally upon payment.
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Coupon Code"
                  placeholder="e.g. SAVE10"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase().trim())}
                  helperText="Alphanumeric, auto-capitalized"
                  inputProps={{ style: { fontWeight: 700, letterSpacing: '0.05em' } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Discount Percentage (%)"
                  type="number"
                  placeholder="10"
                  value={newDiscountPercent}
                  onChange={(e) => setNewDiscountPercent(e.target.value)}
                  inputProps={{ min: 1, max: 99, style: { fontWeight: 700 } }}
                />

                <Alert severity="info" sx={{ fontSize: '0.78rem', py: 0.5 }}>
                  ⏰ Validity: 24 Hours from creation time. Single-use globally upon payment completion.
                </Alert>

                <Button
                  variant="contained"
                  disabled={createCouponMutation.isPending || !newCouponCode.trim() || !newDiscountPercent}
                  onClick={() => {
                    const pct = Number(newDiscountPercent);
                    if (isNaN(pct) || pct <= 0 || pct >= 100) {
                      showAlert('Discount percentage must be between 1% and 99%', 'warning');
                      return;
                    }
                    createCouponMutation.mutate({ code: newCouponCode.trim(), discountPercent: pct });
                  }}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: '#051A3B',
                    color: 'white',
                    '&:hover': { bgcolor: '#C59B27' }
                  }}
                >
                  {createCouponMutation.isPending ? 'Generating...' : '⚡ Generate 24-Hour Coupon'}
                </Button>
              </Stack>
            </Paper>
          </Box>

          {/* Coupons Summary & Table */}
          <Box className="col-span-12 lg:col-span-8">
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#051A3B' }}>
                  Coupons & Discounts Directory
                </Typography>
                <Chip
                  label={`${coupons.filter(c => c.computedStatus === 'ACTIVE').length} Active`}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: '#051A3B' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 800 }}>Coupon Code</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800 }}>Discount (%)</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800 }}>Created Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800 }}>Expiry (24h Limit)</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800 }}>Status</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 800 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingCoupons ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          Loading coupon codes...
                        </TableCell>
                      </TableRow>
                    ) : coupons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No coupons created yet. Use the form on the left to generate a 24-hour coupon code!
                        </TableCell>
                      </TableRow>
                    ) : (
                      coupons.map((c) => {
                        const status = c.computedStatus || (c.isUsed ? 'USED' : new Date(c.expiryDate) < new Date() ? 'EXPIRED' : 'ACTIVE');
                        const isBtnDisabled = status !== 'ACTIVE' || deactivateCouponMutation.isPending;

                        return (
                          <TableRow key={c.id}>
                            <TableCell sx={{ fontWeight: 900, letterSpacing: '0.05em', color: '#051A3B' }}>
                              {c.code}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>
                              {c.discountPercent}% OFF
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>
                              {new Date(c.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>
                              {new Date(c.expiryDate).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={status}
                                size="small"
                                color={status === 'ACTIVE' ? 'success' : status === 'USED' ? 'info' : 'error'}
                                sx={{ fontWeight: 900 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                                {status === 'ACTIVE' && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    onClick={() => deactivateCouponMutation.mutate(c.id)}
                                    disabled={isBtnDisabled}
                                    sx={{ fontWeight: 800, textTransform: 'none' }}
                                  >
                                    Deactivate
                                  </Button>
                                )}
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete coupon code "${c.code}"?`)) {
                                      deleteCouponMutation.mutate(c.id);
                                    }
                                  }}
                                  disabled={deleteCouponMutation.isPending}
                                  title="Delete Coupon Permanently"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      )}
      <AppModal
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Generate Refund Request"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <Autocomplete
            size="small"
            fullWidth
            options={clients}
            getOptionLabel={(c) => {
              if (!c) return '';
              const formattedId = c.clientId || c.clientCode || (c.id && c.id.length > 8 ? `CL-${c.id.substring(0, 6).toUpperCase()}` : c.id);
              return `${c.firstName || ''} ${c.lastName || ''} (${formattedId})`.trim();
            }}
            value={clients.find(c => c.id === selectedClientId) || null}
            onChange={(e, newValue) => {
              setSelectedClientId(newValue ? newValue.id : '');
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => {
              const formattedId = option.clientId || option.clientCode || (option.id && option.id.length > 8 ? `CL-${option.id.substring(0, 6).toUpperCase()}` : option.id);
              return (
                <Box component="li" {...props} key={option.id} sx={{ fontSize: '0.85rem', py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mr: 1 }}>
                    {option.firstName} {option.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({formattedId})
                  </Typography>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Client *"
                placeholder="Type to search client..."
              />
            )}
            componentsProps={{
              paper: {
                sx: {
                  maxHeight: 250,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                }
              }
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="category-refund-select-label">Category</InputLabel>
            <Select
              labelId="category-refund-select-label"
              value={refundCategory}
              onChange={(e) => setRefundCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="Visa Rejection">Visa Rejection (Auto 100% Refund)</MenuItem>
              <MenuItem value="Customer Discontent">Customer Discontent</MenuItem>
              <MenuItem value="Service Cancellation">Service Cancellation</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          {refundCategory !== 'Visa Rejection' && (
            <TextField
              label="Refund Amount (€)"
              type="number"
              fullWidth
              size="small"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          )}

          {refundCategory === 'Visa Rejection' && (
            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                VISA REJECTION CLAUSE:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                The system will audit the selected client's payments history and record the approved refund amount.
              </Typography>
            </Box>
          )}

          <TextField
            label="Client Bank Account Name (Optional)"
            fullWidth
            size="small"
            placeholder="e.g. John Doe"
            value={refundBankName}
            onChange={(e) => setRefundBankName(e.target.value)}
          />

          {(() => {
            const ibanCheck = validateIBAN(refundBankIban);
            const isTouched = Boolean(refundBankIban && refundBankIban.trim().length > 0);
            const isValid = ibanCheck.valid;

            return (
              <TextField
                label="IBAN (International Bank Account Number)"
                fullWidth
                size="small"
                placeholder="e.g. ES91 2100 0418 4502 0005 1332"
                value={refundBankIban}
                onChange={(e) => {
                  const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
                  setRefundBankIban(clean);
                }}
                error={isTouched && !isValid}
                helperText={
                  isTouched ? (
                    isValid ? (
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>✓ Valid IBAN ({ibanCheck.countryCode})</span>
                    ) : (
                      <span style={{ color: '#DC2626', fontWeight: 600 }}>✕ {ibanCheck.error || 'Please enter a valid IBAN'}</span>
                    )
                  ) : (
                    'Optional for manual payout. Validated via ISO MOD-97.'
                  )
                }
              />
            );
          })()}

          <TextField
            label="Reason for Refund"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />

          <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              Attach Visa Rejection Letter / Bank Proof (Optional PDF or Image)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              size="small"
              disabled={uploadingProof}
              sx={{ fontWeight: 700 }}
            >
              {uploadingProof ? 'Uploading Proof...' : refundFile ? `✓ ${refundFile.name}` : 'Choose Proof File (PDF/Image)'}
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setRefundFile(e.target.files[0] || null)}
              />
            </Button>
            {refundFile && (
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5, fontWeight: 700 }}>
                File selected: {refundFile.name} ({(refundFile.size / 1024).toFixed(1)} KB)
              </Typography>
            )}
          </Box>

          <Button variant="contained" color="primary" onClick={handleCreateRefund}>
            Submit Request
          </Button>
        </Box>
      </AppModal>

      {/* Modal: Modify Commission Rate */}
      <AppModal
        open={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        title="Modify Consultant Commission Rate"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="rate-type-select-label">Commission Structure</InputLabel>
            <Select
              labelId="rate-type-select-label"
              value={commissionType}
              onChange={(e) => setCommissionType(e.target.value)}
              label="Commission Structure"
            >
              <MenuItem value="5%">5% Standard Tier</MenuItem>
              <MenuItem value="10%">10% Professional Tier</MenuItem>
              <MenuItem value="custom">Custom Percentage (%)</MenuItem>
              <MenuItem value="fixed">Fixed Flat Payout (€)</MenuItem>
            </Select>
          </FormControl>

          {(commissionType === 'custom' || commissionType === 'fixed') && (
            <TextField
              label={commissionType === 'custom' ? "Custom Percentage (%)" : "Fixed Amount (€)"}
              type="number"
              fullWidth
              size="small"
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
            />
          )}

          <Button variant="contained" color="primary" onClick={handleUpdateCommissionRate}>
            Save Structure
          </Button>
        </Box>
      </AppModal>

      {/* Modal: View & Audit Refund Request */}
      <AppModal
        open={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title={`Audit & Process Refund Request #${activeAuditRefund?.id?.substring(0, 8) || ''}`}
      >
        {activeAuditRefund && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {/* Details Summary & SuperAdmin Editable Amount Field */}
            <Box className="grid grid-cols-12 gap-2" sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
              <Box className="col-span-6">
                <Typography variant="caption" color="text.secondary" display="block">Client Name</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{activeAuditRefund.clientName}</Typography>
              </Box>
              <Box className="col-span-6">
                <Typography variant="caption" color="text.secondary" display="block">Enrolled Service</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{activeAuditRefund.serviceType || 'Visa Package'}</Typography>
              </Box>
              <Box className="col-span-6" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Total Paid Fee</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>€{(Number(activeAuditRefund.totalPaidAmount) || Number(activeAuditRefund.amount) || 0).toLocaleString()}</Typography>
              </Box>
              <Box className="col-span-6" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Calculated Refund Default</Typography>
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 700 }}>€{(activeAuditRefund.amount || 0).toLocaleString()}</Typography>
              </Box>

              {/* Editable Approved Payout Amount for SuperAdmin */}
              <Box className="col-span-12" sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#051A3B', display: 'block', mb: 0.5 }}>
                  Approved Payout Amount (€) — SuperAdmin Override Input:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  disabled={activeAuditRefund.status === 'Processed'}
                  value={auditAmount}
                  onChange={(e) => setAuditAmount(e.target.value)}
                  helperText="💡 Pre-filled with policy default (€). Edit to adjust for VAT, wire fees, or special deductions."
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Box>
            </Box>

            {/* Client Note / Statement */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                Client Statement / Reason:
              </Typography>
              <Typography variant="body2" sx={{ p: 1.5, bgcolor: '#FAF6ED', borderRadius: 2, border: '1px solid rgba(197,155,39,0.3)', whiteSpace: 'pre-wrap' }}>
                {activeAuditRefund.reason || 'No statement provided.'}
              </Typography>
            </Box>

            {activeAuditRefund.proofUrl && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Attached Proof Document:
                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  href={activeAuditRefund.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<VisibilityIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  View Proof Document 📄
                </Button>
              </Box>
            )}

            {/* Proof Attachment PDF */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                Embassy Rejection Letter Proof:
              </Typography>
              {activeAuditRefund.proofUrl ? (
                <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>📄 Official Embassy Resolution Letter Attached</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (activeAuditRefund.proofUrl) {
                        const rawUrl = activeAuditRefund.proofUrl;
                        const fullUrl = rawUrl.startsWith('http')
                          ? rawUrl
                          : `${(import.meta.env.VITE_API_URL || 'https://aaa-consultancy-backend-production.up.railway.app/api/v1').replace('/api/v1', '')}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                        window.open(fullUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    sx={{ fontWeight: 700 }}
                  >
                    View & Download PDF
                  </Button>
                </Box>
              ) : (
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                  ⚠️ No proof document attached to this request.
                </Typography>
              )}
            </Box>

            {/* Bank Details for Wire Transfer */}
            {(activeAuditRefund.bankIban || activeAuditRefund.bankAccountName) && (
              <Box sx={{ p: 2, bgcolor: '#FAF6ED', borderRadius: 2.5, border: '1px solid rgba(197, 155, 39, 0.4)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🏦 Client Bank Payout Details:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'white', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, minWidth: 140 }}>
                      Account Holder Name:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B' }}>
                      {activeAuditRefund.bankAccountName || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, minWidth: 140 }}>
                      IBAN Number:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#051A3B', letterSpacing: '0.8px', fontSize: '0.95rem' }}>
                      {formatIBAN(activeAuditRefund.bankIban) || activeAuditRefund.bankIban || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* If Already Processed, show Big Green Locked Success Banner */}
            {activeAuditRefund.status === 'Processed' && (
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#DCFCE7', border: '1px solid #16A34A', textAlign: 'center', my: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#15803D', fontFamily: 'Outfit, sans-serif' }}>
                  ✅ REFUND PROCESSED SUCCESSFULLY (€{(Number(activeAuditRefund?.amount) || 0).toLocaleString()})
                </Typography>
                <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600, mt: 0.5 }}>
                  Payment Method: <strong>{activeAuditRefund.payoutMethod || 'Stripe Automatic'}</strong> | Ref / UTR: <code>{activeAuditRefund.transactionRef}</code>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  🔒 Financial fields locked to prevent double payouts. Client notified via automated Email receipt.
                </Typography>
              </Box>
            )}
            {/* Dual Payout Processing Panels (Hidden or Disabled if already Processed) */}
            {!isViewOnly && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, opacity: activeAuditRefund.status === 'Processed' ? 0.6 : 1, pointerEvents: activeAuditRefund.status === 'Processed' ? 'none' : 'auto' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {activeAuditRefund.status === 'Processed' ? '🔒 Audit Decision & Payout Completed (Locked)' : 'Audit Decision & Payout Method Selection'}
                </Typography>

                <Grid container spacing={2}>
                  {/* SINGLE PAYOUT ACTION PANEL */}
                  {(() => {
                    const userRoleKey = currentUser?.role || 'admin';
                    const userRoleActions = customizationSettings?.[userRoleKey]?.actions?.refunds;
                    const canStripe = customizationSettings?.enableStripeRefunds !== false && userRoleActions?.canProcessStripeRefund !== false;
                    const requireConfirm = userRoleActions?.requireDoubleConfirmation !== false;

                    return (
                      <Grid xs={12}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1.5px solid',
                            borderColor: 'primary.main',
                            bgcolor: 'primary.lighter'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                            ⚡ Process Refund Payout
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                            Process refund payout back to client. Click below to execute payout with approved amount above.
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            disabled={updateRefundStatusMutation.isPending || activeAuditRefund?.status === 'Processed'}
                            onClick={() => {
                              const finalAmt = Number(auditAmount) || Number(activeAuditRefund?.amount) || 0;
                              const payoutPayload = {
                                refundId: activeAuditRefund.id,
                                status: 'Processed',
                                payoutMethod: 'Stripe Automatic',
                                transactionRef: `STRIPE-RF-${Date.now().toString().substring(6)}`,
                                adminNotes: auditNotes,
                                amount: finalAmt,
                                clientName: activeAuditRefund.clientName
                              };

                              if (requireConfirm) {
                                setPendingPayoutAction(payoutPayload);
                                setConfirmModalOpen(true);
                              } else {
                                updateRefundStatusMutation.mutate(payoutPayload);
                              }
                            }}
                            sx={{ fontWeight: 800, py: 1.3 }}
                          >
                            {activeAuditRefund?.status === 'Processed' ? '🔒 Refund Payout Completed' : `⚡ Process Refund Payout (€${(Number(auditAmount) || Number(activeAuditRefund?.amount) || 0).toLocaleString()})`}
                          </Button>
                        </Paper>
                      </Grid>
                    );
                  })()}
                </Grid>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  disabled={activeAuditRefund?.status === 'Processed'}
                  label="Super Admin Audit Notes"
                  placeholder="Internal audit observations..."
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={activeAuditRefund?.status === 'Processed'}
                    onClick={() => updateRefundStatusMutation.mutate({
                      refundId: activeAuditRefund.id,
                      status: 'Rejected',
                      adminNotes: auditNotes
                    })}
                  >
                    Reject Claim
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    disabled={activeAuditRefund?.status === 'Processed'}
                    onClick={() => updateRefundStatusMutation.mutate({
                      refundId: activeAuditRefund.id,
                      status: 'Approved',
                      adminNotes: auditNotes
                    })}
                  >
                    Approve Claim (Mark Pending Payout)
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </AppModal>

      {/* Modal: Double Security Confirmation Dialog */}
      <AppModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="⚠️ Confirm Financial Payout & Money Transfer"
      >
        {pendingPayoutAction && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#FEF2F2', border: '1px solid #EF4444', borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B', mb: 0.5 }}>
                Financial Transfer Warning
              </Typography>
              <Typography variant="body2" sx={{ color: '#B91C1C', lineHeight: 1.5 }}>
                Are you sure you want to execute a refund payout of <strong style={{ fontSize: '1.1rem' }}>€{(Number(pendingPayoutAction?.amount) || 0).toLocaleString()}</strong> to Client <strong>{pendingPayoutAction?.clientName}</strong>?
              </Typography>
              <Typography variant="caption" sx={{ color: '#7F1D1D', display: 'block', mt: 1, fontWeight: 600 }}>
                Payout Method: {pendingPayoutAction.payoutMethod} | Ref / UTR: {pendingPayoutAction.transactionRef}
              </Typography>
            </Paper>

            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Note: This action will issue real funds, lock the financial records, dispatch an official automated receipt email to the client, and log your Master SuperAdmin ID in the audit trail.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel Action
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={updateRefundStatusMutation.isPending}
                onClick={() => {
                  updateRefundStatusMutation.mutate({
                    refundId: pendingPayoutAction.refundId,
                    status: pendingPayoutAction.status,
                    payoutMethod: pendingPayoutAction.payoutMethod,
                    transactionRef: pendingPayoutAction.transactionRef,
                    adminNotes: pendingPayoutAction.adminNotes
                  });
                  setConfirmModalOpen(false);
                }}
                sx={{ fontWeight: 800, px: 3 }}
              >
                ⚡ Yes, Execute Refund Now
              </Button>
            </Box>
          </Box>
        )}
      </AppModal>

      {/* DIALOG: Commission Rate History */}
      <Dialog
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2.5,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <HistoryIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                Commission Rate History
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {historyAgentName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setHistoryModalOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
          {loadingHistory ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading history...</Typography>
            </Box>
          ) : commissionHistory.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
                No Rate Changes Yet
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                Commission rate changes will appear here once you modify this agent's rate.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {commissionHistory.map((entry, idx) => {
                const isIncrease = entry.newRate > entry.oldRate;
                const date = new Date(entry.createdAt);
                const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                return (
                  <Paper
                    key={entry.id}
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: isIncrease ? 'success.light' : 'warning.light',
                      borderLeft: '4px solid',
                      borderLeftColor: isIncrease ? 'success.main' : 'warning.main',
                      borderRadius: 3,
                      p: 2.5,
                      bgcolor: 'white'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                      {/* Rate change badge */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: isIncrease ? 'success.50' : 'warning.50',
                          border: '1px solid',
                          borderColor: isIncrease ? 'success.light' : 'warning.light',
                          borderRadius: 2,
                          px: 2,
                          py: 0.75
                        }}>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.secondary', textDecoration: 'line-through', fontSize: '0.9rem' }}>
                            {entry.oldRate}%
                          </Typography>
                          <Typography sx={{ color: 'text.disabled', fontSize: '1rem' }}>→</Typography>
                          <Typography variant="body1" sx={{
                            fontWeight: 900,
                            color: isIncrease ? 'success.dark' : 'warning.dark',
                            fontSize: '1rem'
                          }}>
                            {entry.newRate}%
                          </Typography>
                          {isIncrease
                            ? <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18 }} />
                            : <TrendingDownIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                          }
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {isIncrease ? 'Rate Increased' : 'Rate Decreased'}
                        </Typography>
                      </Box>

                      {/* Date & time */}
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{dateStr}</Typography>
                        <Typography variant="caption" color="text.secondary">{timeStr}</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {/* Changed by */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                          {(entry.changedBy?.fullName || 'A')[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Changed by</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {entry.changedBy?.fullName || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.changedBy?.role || ''}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Revenue at change */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '50%',
                          bgcolor: 'secondary.main',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Typography sx={{ fontSize: 14, color: 'white', fontWeight: 700 }}>€</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Revenue at time of change</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                            €{(entry.revenueAtChange || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Commission impact */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Commission on that revenue</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 6 }}>
                            €{((entry.revenueAtChange || 0) * entry.oldRate / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          → <span style={{ fontWeight: 900, color: isIncrease ? '#2e7d32' : '#e65100' }}>
                            €{((entry.revenueAtChange || 0) * entry.newRate / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {(Array.isArray(commissionHistory) ? commissionHistory : []).length} rate change{(Array.isArray(commissionHistory) ? commissionHistory : []).length !== 1 ? 's' : ''} recorded
          </Typography>
          <Button variant="contained" onClick={() => setHistoryModalOpen(false)} sx={{ fontWeight: 700, px: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminRefundCommissionHub;
