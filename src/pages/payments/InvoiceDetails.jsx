import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// Icons
import { jsPDF } from 'jspdf';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CreditCardIcon from '@mui/icons-material/CreditCard';

// Components & Services
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import useAuth from '../../hooks/useAuth';
import { SERVICES, PACKAGES } from '../../constants/mockData';
import { getPackageDisplayName } from '../../utils/packageHelper';

export const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { isViewOnlyMenu } = useAuth();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Finance');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [gateway, setGateway] = useState('Visa');
  const [transactionId, setTransactionId] = useState('');

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments });

  // Fetch packages dynamically
  const { data: dbPackages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: dbService.getPackages
  });

  const invoice = payments.find((p) => p.id === id);

  // Fetch client (for address details)
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients,
    enabled: !!invoice });

  const client = invoice ? clients.find(c => c.id === invoice.clientId) : null;

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, method, txn }) =>
      dbService.updatePaymentStatus(id, status, method, txn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Payment transaction recorded successfully', 'success');
      setPaymentModalOpen(false);
    } });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Invoice not found</Typography>
        <Button startIcon={<KeyboardArrowLeftIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  const formatInvoiceDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? String(dateStr).split('T')[0] : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return String(dateStr).split('T')[0];
    }
  };

  const invoiceNumber = invoice.invoiceNumber || invoice.invoiceNo || `INV-2026-${(invoice.id || '').replace(/-/g, '').slice(-6).toUpperCase()}`;
  const customerId = invoice?.clientCode || client?.clientCode || client?.displayId || client?.clientCustomId || client?.cid || (client?.id ? 'CID-' + client.id.slice(-5).toUpperCase() : (invoice?.clientId ? 'CID-' + invoice.clientId.slice(-5).toUpperCase() : 'CID-12001'));

  const currentPkg = (dbPackages && dbPackages.length > 0)
    ? dbPackages.find(p => p.id === invoice.packageType || p.code === invoice.packageType || p.id === invoice.packageId || p.code === invoice.packageId)
    : null;
  const itemTitle = currentPkg?.name || invoice.paymentPurpose || (invoice.packageType ? getPackageDisplayName(invoice.packageType, dbPackages) : (invoice.serviceId ? (SERVICES.find(s => s.id === invoice.serviceId)?.name || invoice.serviceId) : 'Spain Immigration & Legal Relocation Service'));

  const itemDescription = currentPkg?.description || (invoice.paymentPurpose ? `Official client invoice for ${invoice.paymentPurpose}.` : 'Initial eligibility verification, document compliance review, and file assembly.');

  const totalAmount = Number(invoice.amount) || 0;
  const discount = Number(invoice.discount) || 0;
  const additionalApplicantsCount = Number(invoice.additionalApplicants) || 0;
  const additionalApplicantRate = currentPkg?.additionalApplicantPrice || 500;
  const additionalApplicantsTotal = additionalApplicantsCount * additionalApplicantRate;
  const assessmentCredit = Number(invoice.assessmentCreditUsed) || 0;

  // Compute clean base service fee that matches invoice amount
  let serviceBasePrice = totalAmount;
  if (additionalApplicantsCount > 0 && totalAmount > additionalApplicantsTotal) {
    serviceBasePrice = totalAmount - additionalApplicantsTotal + assessmentCredit;
  }

  const subtotal = Math.max(0, serviceBasePrice + additionalApplicantsTotal - assessmentCredit - discount);
  const vatAmount = subtotal * 0.05;
  const grandTotal = subtotal + vatAmount;

  const handleOpenPaymentModal = () => {
    setTransactionId('TXN-' + Math.floor(10000000 + Math.random() * 90000000));
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = () => {
    updateStatusMutation.mutate({
      id: invoice.id,
      status: 'Paid',
      method: gateway,
      txn: transactionId });
  };

  const handleMarkFailed = () => {
    if (window.confirm('Mark this invoice transaction as Failed/Overdue?')) {
      updateStatusMutation.mutate({
        id: invoice.id,
        status: 'Failed',
        method: '-',
        txn: '-' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text("AAA BUSINESS CONSULTANCY", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Spain Relocation Legal & Consulting Services", 14, 26);
      doc.text("Email: info@aaabusinessconsultancy.com | Website: www.aaabusinessconsultancy.com", 14, 31);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);

      // Title & Reference
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`OFFICIAL INVOICE #${invoiceNumber}`, 14, 46);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Date Issued: ${formatInvoiceDate(invoice.billingDate || invoice.createdAt)}`, 130, 46);
      doc.text(`Due Date: ${formatInvoiceDate(invoice.dueDate)}`, 130, 52);
      doc.text(`Status: ${invoice.status}`, 130, 58);

      // Client info box
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 65, 182, 24, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Billed To:", 18, 73);
      doc.setFont("helvetica", "normal");
      doc.text(`Client Name: ${invoice.clientName || (client ? `${client.firstName} ${client.lastName}` : 'Valued Client')}`, 18, 80);
      doc.text(`Customer ID: ${customerId}`, 18, 86);

      // Summary Table Headers
      doc.setFillColor(30, 41, 59);
      doc.rect(14, 98, 182, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Description", 18, 103.5);
      doc.text("Amount (€)", 165, 103.5);

      // Table Row
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "normal");
      doc.text(`${itemTitle.slice(0, 45)}`, 18, 116);
      doc.text(`€${serviceBasePrice.toFixed(2)}`, 165, 116);

      let currentY = 124;
      if (additionalApplicantsCount > 0) {
        doc.text(`Co-Applicants (${additionalApplicantsCount} person(s))`, 18, currentY);
        doc.text(`+€${additionalApplicantsTotal.toFixed(2)}`, 165, currentY);
        currentY += 8;
      }

      if (assessmentCredit > 0) {
        doc.setTextColor(34, 197, 94);
        doc.text("Assessment Fee Credit", 18, currentY);
        doc.text(`-€${assessmentCredit.toFixed(2)}`, 165, currentY);
        currentY += 8;
      }

      if (discount > 0) {
        doc.setTextColor(225, 29, 72);
        doc.text("Applied Promotional Discount", 18, currentY);
        doc.text(`-€${discount.toFixed(2)}`, 165, currentY);
        currentY += 8;
      }

      // Totals
      doc.setLineWidth(0.5);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, currentY + 4, 196, currentY + 4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Grand Total Due:", 115, currentY + 14);
      doc.text(`€${grandTotal.toFixed(2)}`, 165, currentY + 14);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Thank you for choosing AAA Business Consultancy for your Spain Relocation journey.", 14, currentY + 35);

      doc.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const handleStripePay = async () => {
    try {
      showAlert('Redirecting to Stripe Checkout...', 'info');
      const res = await dbService.createStripeCheckout({
        paymentId: invoice.id,
        amount: invoice.amount || 2000,
        clientName: invoice.clientName || (client ? `${client.firstName} ${client.lastName}` : '')
      });
      if (res?.url || res?.checkoutUrl) {
        window.location.href = res.url || res.checkoutUrl;
      } else {
        showAlert('Could not initialize Stripe Checkout session.', 'error');
      }
    } catch (err) {
      console.error('Stripe Pay error:', err);
      showAlert(err.response?.data?.message || 'Failed to initialize Stripe payment.', 'error');
    }
  };

  return (
    <Box>
      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: 'text.secondary', display: 'inline-flex', '@media print': { display: 'none' } }}
      >
        Back to Invoices
      </Button>

      <PageHeader
        title={`Invoice ${invoiceNumber}`}
        subtitle="Review account retainer bills and client payment receipts."
        action={
          <Stack direction="row" spacing={1} sx={{ '@media print': { display: 'none' } }}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
              Print Invoice
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
              Download Invoice
            </Button>
            {invoice.status === 'Pending' && (
              <Button
                variant="contained"
                startIcon={<CreditCardIcon />}
                onClick={handleStripePay}
                sx={{
                  bgcolor: '#4F46E5',
                  color: 'white',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#4338CA' }
                }}
              >
                Pay Now with Stripe
              </Button>
            )}
            {!isViewOnly && invoice.status === 'Pending' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleOpenPaymentModal}
                >
                  Record Payment
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  onClick={handleMarkFailed}
                >
                  Mark Failed
                </Button>
              </>
            )}
          </Stack>
        }
      />

      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        {/* Invoice Header */}
        <Box className="grid grid-cols-12 gap-2" sx={{ mb: 4 }}>
          <Box className="col-span-12 sm:col-span-6">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.2rem' }}
              >
                A³
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                AAA BUSINESS CONSULTANCY
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Business Village, Block B, 4th Floor, Office F09
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Port Saeed, Deira, Dubai, UAE
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              TRN: 105469065400001
            </Typography>
          </Box>

          <Box className="col-span-12 sm:col-span-6" sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              INVOICE
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#051A3B' }}>
              Invoice #: {invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {formatInvoiceDate(invoice.billingDate || invoice.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Due Date: {formatInvoiceDate(invoice.dueDate)}
            </Typography>
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: { sm: 'flex-end' } }}>
              <StatusBadge status={invoice.status} />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Bill To / Bill From */}
        <Box className="grid grid-cols-12 gap-2" sx={{ mb: 4 }}>
          <Box className="col-span-12 sm:col-span-6">
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
              Bill To
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#051A3B', fontSize: '1.1rem' }}>
              {invoice.clientName || (client ? `${client.firstName} ${client.lastName}` : 'Valued Client')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563', mt: 0.5 }}>
              Customer ID: {customerId}
            </Typography>
          </Box>

          <Box className="col-span-12 sm:col-span-6" sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
              Payment Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Method: {invoice.paymentMethod || 'Credit / Debit Card'}
            </Typography>
          </Box>
        </Box>

        {/* Items Table */}
        <TableContainer sx={{ mb: 4, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {itemTitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {itemDescription}
                  </Typography>
                </TableCell>
                <TableCell align="right">1</TableCell>
                <TableCell align="right">€{serviceBasePrice.toFixed(2)}</TableCell>
                <TableCell align="right">€{serviceBasePrice.toFixed(2)}</TableCell>
              </TableRow>

              {additionalApplicantsCount > 0 && (
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Co-Applicants Relocation Support ({additionalApplicantsCount} person(s))
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Additional family member documentation and processing support.
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{additionalApplicantsCount}</TableCell>
                  <TableCell align="right">€{additionalApplicantRate.toFixed(2)}</TableCell>
                  <TableCell align="right">+€{additionalApplicantsTotal.toFixed(2)}</TableCell>
                </TableRow>
              )}

              {assessmentCredit > 0 && (
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                      Eligibility Assessment Fee Credit (100% Deduction)
                    </Typography>
                  </TableCell>
                  <TableCell align="right">1</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>-€{assessmentCredit.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>-€{assessmentCredit.toFixed(2)}</TableCell>
                </TableRow>
              )}

              {discount > 0 && (
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                      Applied Promotional Discount
                    </Typography>
                  </TableCell>
                  <TableCell align="right">1</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>-€{discount.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>-€{discount.toFixed(2)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pricing totals — Itemized */}
        <Box className="grid grid-cols-12 gap-2">
          <Box className="col-span-12 sm:col-span-6" />
          <Box className="col-span-12 sm:col-span-6">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pl: { sm: 4 } }}>
              {/* Itemized Rows */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Base Service Fee</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>€{serviceBasePrice.toFixed(2)}</Typography>
              </Box>

              {additionalApplicantsCount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Co-Applicants ({additionalApplicantsCount})</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>+€{additionalApplicantsTotal.toFixed(2)}</Typography>
                </Box>
              )}

              {assessmentCredit > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                  <Typography variant="body2">Assessment Fee Credit</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>-€{assessmentCredit.toFixed(2)}</Typography>
                </Box>
              )}

              {discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                  <Typography variant="body2">Promotional Discount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>-€{discount.toFixed(2)}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">UAE VAT (5%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>€{vatAmount.toFixed(2)}</Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'primary.main' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Grand Total</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>€{grandTotal.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Dunning Reminders Log */}
        {invoice.status === 'Pending' && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <NotificationsActiveIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dunning Reminder Log</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Automated follow-up reminders scheduled for this pending invoice.
            </Typography>
            {[
              { label: 'Reminder #1 — Abandoned Checkout', timing: 'Immediate (sent upon invoice creation)', status: 'Sent', color: 'success' },
              { label: 'Reminder #2 — 24h Follow-Up', timing: '24 hours after invoice generation', status: 'Queued', color: 'info' },
              { label: 'Reminder #3 — 2-Day Follow-Up', timing: '2 days after invoice generation', status: 'Pending', color: 'warning' },
              { label: 'Reminder #4 — CEO 5-Day Final Notice', timing: '5 days (CEO email with special 24h discount offer)', status: 'Scheduled', color: 'error' },
            ].map((r, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ mt: 0.5, width: 10, height: 10, borderRadius: '50%', bgcolor: `${r.color}.main`, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{r.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{r.timing}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: `${r.color}.main`, textTransform: 'uppercase', fontSize: '0.7rem' }}>{r.status}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* MODAL: Record Payment */}
      <AppModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment Transaction"
        actions={
          <>
            <Button onClick={() => setPaymentModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handlePaymentSubmit}
              variant="contained"
              color="success"
              disabled={updateStatusMutation.isPending}
            >
              Verify & Complete
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="body2">
            Record client gateway transactions. This marks the invoice as <strong>Paid</strong> and shifts active clients to the document upload stage.
          </Typography>

          <TextField
            select
            value={gateway}
            onChange={(e) => setGateway(e.target.value)}
            label="Payment Gateway"
            fullWidth
          >
            <MenuItem value="Visa">Visa Card</MenuItem>
            <MenuItem value="Mastercard">Mastercard</MenuItem>
            <MenuItem value="Apple Pay">Apple Pay</MenuItem>
            <MenuItem value="Google Pay">Google Pay</MenuItem>
            <MenuItem value="Link Wallet">Link Wallet</MenuItem>
            <MenuItem value="Emirates NBD Bank">Emirates NBD Company Bank Transfer</MenuItem>
          </TextField>

          <TextField
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            label="Bank Transaction ID"
            fullWidth
            required
          />
        </Box>
      </AppModal>
    </Box>
  );
};

export default InvoiceDetails;
