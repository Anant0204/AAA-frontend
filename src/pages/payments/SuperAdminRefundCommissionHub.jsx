import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

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
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

// Components
import PageHeader from '../../components/PageHeader';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import useAuth from '../../hooks/useAuth';

export const SuperAdminRefundCommissionHub = () => {
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser, isViewOnlyMenu } = useAuth();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Finance');

  // Modals state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [activeAuditRefund, setActiveAuditRefund] = useState(null);
  const [auditPayoutMethod, setAuditPayoutMethod] = useState('Stripe Automatic');
  const [auditTransactionRef, setAuditTransactionRef] = useState('');
  const [auditNotes, setAuditNotes] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingPayoutAction, setPendingPayoutAction] = useState(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  
  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [refundCategory, setRefundCategory] = useState('Visa Rejection');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [commissionType, setCommissionType] = useState('10%');
  const [commissionValue, setCommissionValue] = useState('10');

  // Queries
  const { data: refunds = [], isLoading: loadingRefunds } = useQuery({
    queryKey: ['refund-requests'],
    queryFn: dbService.getRefundRequests });

  const { data: commissionReport = [], isLoading: loadingCommissions } = useQuery({
    queryKey: ['commission-report'],
    queryFn: dbService.getCommissionsReport });

  const { data: commissionRates = [], isLoading: loadingRates } = useQuery({
    queryKey: ['commission-rates'],
    queryFn: dbService.getCommissionRates });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents });

  // Mutations
  const createRefundMutation = useMutation({
    mutationFn: dbService.createRefundRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      showAlert('Refund request created successfully', 'success');
      setRefundModalOpen(false);
      setSelectedClientId('');
      setRefundReason('');
      setRefundAmount('');
    }
  });

  const updateRefundStatusMutation = useMutation({
    mutationFn: ({ refundId, status, payoutMethod, transactionRef, adminNotes }) => 
      dbService.updateRefundStatus(refundId, status, payoutMethod, transactionRef, adminNotes),
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
  const handleCreateRefund = () => {
    if (!selectedClientId || !refundReason) {
      showAlert('Please select a client and provide a reason', 'warning');
      return;
    }
    createRefundMutation.mutate({
      clientId: selectedClientId,
      category: refundCategory,
      reason: refundReason,
      amount: refundCategory === 'Visa Rejection' ? undefined : Number(refundAmount)
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

  const handleUpdateCommissionRate = () => {
    updateCommissionRateMutation.mutate({
      agentId: selectedAgentId,
      type: commissionType,
      value: commissionType === '5%' ? 5 : commissionType === '10%' ? 10 : Number(commissionValue)
    });
  };

  // Performance calculations
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
                        <TableCell sx={{ fontWeight: 600 }}>€{agent.totalEarned.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>€{agent.totalPaid.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: 'warning.main', fontWeight: 700 }}>€{(agent.totalEarned - agent.totalPaid).toLocaleString()}</TableCell>
                        <TableCell align="right">
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
                        <TableCell>{row.date}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.paymentId}</TableCell>
                        <TableCell>{row.clientName}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.agentName}</TableCell>
                        <TableCell>€{row.amountPaid.toLocaleString()}</TableCell>
                        <TableCell>{row.structure}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>
                          €{row.commissionEarned.toLocaleString()}
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
          <Box className="col-span-12" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!isViewOnly && (
              <Button variant="contained" color="primary" onClick={() => setRefundModalOpen(true)}>
                Request Refund
              </Button>
            )}
          </Box>

          <Box className="col-span-12 md:col-span-8 flex flex-col h-full">
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Refund Requests Ledger
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Monitor refund reviews, status approvals, and audit records. Note: Visa Rejection requests calculate 50% automatically.
              </Typography>

              <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Request ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Refund Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {refunds.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                            #{ref.id.substring(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{ref.clientName}</TableCell>
                        <TableCell>
                          <Chip label={ref.category} variant="outlined" color={ref.category === 'Visa Rejection' ? 'error' : 'default'} size="small" sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>€{ref.amount.toLocaleString()}</TableCell>
                        <TableCell>{ref.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={ref.status}
                            color={ref.status === 'Processed' ? 'success' : ref.status === 'Approved' ? 'info' : 'warning'}
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
                    ))}
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
                              Time: {new Date(log.date).toLocaleString()}
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

      {/* Modal: Request Refund */}
      <AppModal
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Generate Refund Request"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="client-refund-select-label">Select Client</InputLabel>
            <Select
              labelId="client-refund-select-label"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
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
            <InputLabel id="category-refund-select-label">Category</InputLabel>
            <Select
              labelId="category-refund-select-label"
              value={refundCategory}
              onChange={(e) => setRefundCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="Visa Rejection">Visa Rejection (Auto 50% Refund)</MenuItem>
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
                The system will automatically audit the selected client's payments history and calculate exactly 50% of the total paid amount upon submission.
              </Typography>
            </Box>
          )}

          <TextField
            label="Reason for Refund"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />

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
            {/* Details Summary */}
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
                <Typography variant="body2" sx={{ fontWeight: 700 }}>€{(activeAuditRefund.totalPaidAmount || activeAuditRefund.amount * 2).toLocaleString()}</Typography>
              </Box>
              <Box className="col-span-6" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">50% Calculated Refund</Typography>
                <Typography variant="body1" color="error.main" sx={{ fontWeight: 800 }}>€{activeAuditRefund.amount.toLocaleString()}</Typography>
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
                          : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
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
              <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Client Bank Payout Details:
                </Typography>
                <Typography variant="caption" display="block">Name: <strong>{activeAuditRefund.bankAccountName}</strong></Typography>
                <Typography variant="caption" display="block">IBAN: <strong>{activeAuditRefund.bankIban}</strong></Typography>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* If Already Processed, show Big Green Locked Success Banner */}
            {activeAuditRefund.status === 'Processed' && (
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#DCFCE7', border: '1px solid #16A34A', textAlign: 'center', my: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#15803D', fontFamily: 'Outfit, sans-serif' }}>
                  ✅ REFUND PROCESSED SUCCESSFULLY (€{activeAuditRefund.amount.toLocaleString()})
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
                  {/* OPTION 1: STRIPE AUTOMATIC PAYOUT */}
                  {(() => {
                    const userRoleKey = currentUser?.role || 'admin';
                    const userRoleActions = customizationSettings?.[userRoleKey]?.actions?.refunds;
                    const canStripe = customizationSettings?.enableStripeRefunds !== false && userRoleActions?.canProcessStripeRefund !== false;
                    const canBank = customizationSettings?.enableManualBankPayouts !== false && userRoleActions?.canProcessBankPayout !== false;
                    const requireConfirm = userRoleActions?.requireDoubleConfirmation !== false;

                    return (
                      <React.Fragment>
                        {canStripe && (
                          <Grid item xs={12} sm={!canBank ? 12 : 6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                borderRadius: 3, 
                                border: '1.5px solid', 
                                borderColor: auditPayoutMethod === 'Stripe Automatic' ? 'primary.main' : 'divider',
                                bgcolor: auditPayoutMethod === 'Stripe Automatic' ? 'primary.lighter' : 'background.paper'
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                                ⚡ Option 1: Auto-Pay via Stripe
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5, minHeight: 32 }}>
                                Automated 1-click refund back to client's original credit/debit card on file.
                              </Typography>
                              <Button
                                variant={auditPayoutMethod === 'Stripe Automatic' ? "contained" : "outlined"}
                                color="primary"
                                fullWidth
                                size="small"
                                disabled={updateRefundStatusMutation.isPending || activeAuditRefund?.status === 'Processed'}
                                onClick={() => {
                                  setAuditPayoutMethod('Stripe Automatic');
                                  const payoutPayload = {
                                    refundId: activeAuditRefund.id,
                                    status: 'Processed',
                                    payoutMethod: 'Stripe Automatic',
                                    transactionRef: `STRIPE-RF-${Date.now().toString().substring(6)}`,
                                    adminNotes: auditNotes,
                                    amount: activeAuditRefund.amount,
                                    clientName: activeAuditRefund.clientName
                                  };
                                  
                                  if (requireConfirm) {
                                    setPendingPayoutAction(payoutPayload);
                                    setConfirmModalOpen(true);
                                  } else {
                                    updateRefundStatusMutation.mutate(payoutPayload);
                                  }
                                }}
                                sx={{ fontWeight: 800, py: 1 }}
                              >
                                {activeAuditRefund?.status === 'Processed' ? '🔒 Stripe Auto-Pay Completed' : `⚡ Process Stripe Auto-Pay (€${activeAuditRefund.amount.toLocaleString()})`}
                              </Button>
                            </Paper>
                          </Grid>
                        )}

                        {/* OPTION 2: MANUAL BANK TRANSFER */}
                        {canBank && (
                          <Grid item xs={12} sm={!canStripe ? 12 : 6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                borderRadius: 3, 
                                border: '1.5px solid', 
                                borderColor: auditPayoutMethod === 'Manual Bank Transfer' ? 'warning.main' : 'divider',
                                bgcolor: auditPayoutMethod === 'Manual Bank Transfer' ? '#FAF6ED' : 'background.paper'
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#A37E1C', mb: 0.5 }}>
                                🏦 Option 2: Manual Bank Wire Payout
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5, minHeight: 32 }}>
                                Transfer funds manually via online bank portal using auto-filled IBAN details below.
                              </Typography>
                              <Button
                                variant={auditPayoutMethod === 'Manual Bank Transfer' ? "contained" : "outlined"}
                                color="warning"
                                fullWidth
                                size="small"
                                disabled={activeAuditRefund?.status === 'Processed'}
                                onClick={() => setAuditPayoutMethod('Manual Bank Transfer')}
                                sx={{ fontWeight: 800, py: 1 }}
                              >
                                {activeAuditRefund?.status === 'Processed' ? '🔒 Manual Payout Completed' : '🏦 Manual Wire Transfer Form'}
                              </Button>
                            </Paper>
                          </Grid>
                        )}
                      </React.Fragment>
                    );
                  })()}
                </Grid>

                {/* MANUAL BANK TRANSFER AUTO-FILLED FORM */}
                {auditPayoutMethod === 'Manual Bank Transfer' && (
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(197, 155, 39, 0.4)', bgcolor: '#FAF6ED', display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, color: '#A37E1C' }}>
                      📋 AUTO-FILLED CLIENT BANK PAYOUT DATA:
                    </Typography>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          size="small" 
                          label="Account Holder Name (Auto-Filled)" 
                          value={activeAuditRefund.bankAccountName || activeAuditRefund.clientName}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          size="small" 
                          label="IBAN / Account Number (Auto-Filled)" 
                          value={activeAuditRefund.bankIban || 'ES91 2100 0418 45 0200051332'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField 
                          fullWidth 
                          size="small" 
                          required
                          disabled={activeAuditRefund?.status === 'Processed'}
                          label="Bank Transfer Reference / UTR Number *"
                          placeholder="Enter your Bank Wire Reference (e.g., UTR-984210382)"
                          value={auditTransactionRef}
                          onChange={(e) => setAuditTransactionRef(e.target.value)}
                          sx={{ bgcolor: 'white', borderRadius: 1 }}
                        />
                      </Grid>
                    </Grid>

                    <Button 
                      variant="contained" 
                      color="success"
                      fullWidth
                      disabled={!auditTransactionRef || updateRefundStatusMutation.isPending || activeAuditRefund?.status === 'Processed'}
                      onClick={() => {
                        setPendingPayoutAction({
                          refundId: activeAuditRefund.id,
                          status: 'Processed',
                          payoutMethod: 'Manual Bank Transfer',
                          transactionRef: auditTransactionRef,
                          adminNotes: auditNotes,
                          amount: activeAuditRefund.amount,
                          clientName: activeAuditRefund.clientName
                        });
                        setConfirmModalOpen(true);
                      }}
                      sx={{ py: 1.2, fontWeight: 800 }}
                    >
                      {activeAuditRefund?.status === 'Processed' ? '🔒 Manual Wire Transfer Paid & Locked' : 'Confirm Manual Wire Payout & Issue Receipt'}
                    </Button>
                  </Paper>
                )}

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
                  sx={{ mt: 1 }}
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
                Are you sure you want to execute a refund payout of <strong style={{ fontSize: '1.1rem' }}>€{pendingPayoutAction.amount?.toLocaleString()}</strong> to Client <strong>{pendingPayoutAction.clientName}</strong>?
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
    </Box>
  );
};

export default SuperAdminRefundCommissionHub;
