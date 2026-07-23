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
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

// Components & Services
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import useAuth from '../../hooks/useAuth';
import { SERVICES, PACKAGES } from '../../constants/mockData';

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

  const serviceObj = SERVICES.find((s) => s.id === invoice.serviceId);
  const packageObj = PACKAGES.find((p) => p.id === invoice.packageId);

  // Invoice calculations — itemized breakdown
  const serviceBasePrice = invoice.amount - (invoice.packageId === 'premium' ? 700 : 0);
  const relocationAddOn = invoice.packageId === 'premium' ? 700 : 0;
  const subtotal = invoice.amount;
  const mainApplicantDiscount = invoice.discount > 0 ? 500 : 0;
  const dependentsDiscount = invoice.discount > mainApplicantDiscount ? invoice.discount - mainApplicantDiscount : 0;
  const discount = invoice.discount || 0;

  // UAE VAT 5% flat rate
  const vatAmount = (subtotal - discount) * 0.05;
  const grandTotal = subtotal - discount + vatAmount;

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
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.id} - AAA Business Consultancy</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      background-color: #f8fafc;
    }
    .invoice-card {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 30px;
    }
    .company-logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      background: linear-gradient(135deg, #2563EB 0%, #14B8A6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 1.4rem;
    }
    .company-name {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .company-details {
      font-size: 12px;
      color: #64748b;
      margin-top: 6px;
      line-height: 1.5;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px 0;
    }
    .meta-item {
      font-size: 14px;
      color: #64748b;
      margin: 4px 0;
    }
    .status-badge {
      display: inline-block;
      margin-top: 10px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-paid {
      background-color: #dcfce7;
      color: #15803d;
    }
    .status-pending {
      background-color: #fef9c3;
      color: #a16207;
    }
    .status-failed {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .billing-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .billing-col {
      width: 48%;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 10px;
      letter-spacing: 0.05em;
    }
    .client-name {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
    }
    .billing-details {
      font-size: 14px;
      color: #475569;
      margin: 4px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      background-color: #f8fafc;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .items-table td {
      padding: 16px;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .item-desc {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .item-subtext {
      font-size: 12px;
      color: #64748b;
    }
    .summary-section {
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }
    .policy-box {
      width: 50%;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #fef08a;
      background-color: #fefce8;
      color: #713f12;
      font-size: 13px;
      line-height: 1.6;
    }
    .policy-title {
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .totals-box {
      width: 45%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #475569;
    }
    .total-row.success {
      color: #16a34a;
    }
    .total-row.grand {
      font-size: 20px;
      font-weight: 800;
      color: #2563eb;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="company-logo-section">
          <div class="logo-badge">A³</div>
          <h1 class="company-name">AAA BUSINESS CONSULTANCY</h1>
        </div>
        <div class="company-details">
          Business Village, Block B, 4th Floor, Office F09<br>
          Port Saeed, Deira, Dubai, UAE<br>
          TRN: 105469065400001
        </div>
      </div>
      <div class="invoice-meta">
        <h2 class="invoice-title">INVOICE</h2>
        <div class="meta-item"><strong>Invoice #:</strong> ${invoice.id}</div>
        <div class="meta-item"><strong>Date:</strong> ${invoice.billingDate}</div>
        <div class="meta-item"><strong>Due Date:</strong> ${invoice.dueDate}</div>
        <div>
          <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span>
        </div>
      </div>
    </div>

    <div class="billing-section">
      <div class="billing-col">
        <div class="section-title">Bill To</div>
        <div class="client-name">${invoice.clientName}</div>
        ${client ? `
          <div class="billing-details"><strong>Nationality:</strong> ${client.nationality}</div>
          <div class="billing-details"><strong>Email:</strong> ${client.email}</div>
          <div class="billing-details"><strong>Phone:</strong> ${client.phone}</div>
        ` : ''}
      </div>
      <div class="billing-col" style="text-align: right;">
        <div class="section-title">Payment Details</div>
        <div class="billing-details"><strong>Method:</strong> ${invoice.paymentMethod || '-'}</div>
        <div class="billing-details"><strong>Transaction ID:</strong> ${invoice.transactionId || '-'}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right; width: 60px;">Qty</th>
          <th style="text-align: right; width: 120px;">Unit Price</th>
          <th style="text-align: right; width: 120px;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-desc">${serviceObj?.name || invoice.serviceId} Setup</div>
            <div class="item-subtext">Initial eligibility verification and document checklists briefing.</div>
          </td>
          <td style="text-align: right;">1</td>
          <td style="text-align: right;">€${(serviceObj?.basePrice || 1500).toLocaleString()}</td>
          <td style="text-align: right;">€${(serviceObj?.basePrice || 1500).toLocaleString()}</td>
        </tr>
        ${packageObj && invoice.packageId === 'premium' ? `
          <tr>
            <td>
              <div class="item-desc">Relocation & Administrative Package Add-on</div>
              <div class="item-subtext">NIE, TIE local registrations, social security, SIP health cards, and bank account setup support.</div>
            </td>
            <td style="text-align: right;">1</td>
            <td style="text-align: right;">€700</td>
            <td style="text-align: right;">€700</td>
          </tr>
        ` : ''}
      </tbody>
    </table>

    <div class="summary-section">
      <div class="policy-box">
        <div class="policy-title">⚠️ Refund Policy Notice</div>
        <strong>50% of the service fee is NON-REFUNDABLE</strong> once the case has been initiated and documents reviewed. The remaining 50% is only refundable within 7 days of payment if no processing has started. By completing payment, the client acknowledges these terms.
      </div>
      <div class="totals-box">
        <div class="total-row">
          <span>Base Service Fee</span>
          <span>€${serviceBasePrice.toLocaleString()}</span>
        </div>
        ${relocationAddOn > 0 ? `
          <div class="total-row">
            <span>Relocation Package Add-on</span>
            <span>+€${relocationAddOn}</span>
          </div>
        ` : ''}
        ${mainApplicantDiscount > 0 ? `
          <div class="total-row success">
            <span>Main Applicant Discount</span>
            <span>-€${mainApplicantDiscount}</span>
          </div>
        ` : ''}
        ${dependentsDiscount > 0 ? `
          <div class="total-row success">
            <span>Dependents Discount (€250 × ${Math.round(dependentsDiscount / 250)})</span>
            <span>-€${dependentsDiscount}</span>
          </div>
        ` : ''}
        <div class="total-row">
          <span>UAE VAT (5%)</span>
          <span>€${vatAmount.toFixed(2)}</span>
        </div>
        <div class="total-row grand">
          <span>Grand Total</span>
          <span>€${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        title={`Invoice ${invoice.id}`}
        subtitle="Review account retainer bills and client payment receipts."
        action={
          <Stack direction="row" spacing={1} sx={{ '@media print': { display: 'none' } }}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
              Print Invoice
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
              Download Invoice
            </Button>
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
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Invoice #: {invoice.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {invoice.billingDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Due Date: {invoice.dueDate}
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {invoice.clientName}
            </Typography>
            {client && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Nationality: {client.nationality}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {client.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {client.phone}
                </Typography>
              </>
            )}
          </Box>

          <Box className="col-span-12 sm:col-span-6" sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
              Payment Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Method: {invoice.paymentMethod || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaction ID: {invoice.transactionId || '-'}
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
                    {serviceObj?.name || invoice.serviceId} Setup
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Initial eligibility verification and document checklists briefing.
                  </Typography>
                </TableCell>
                <TableCell align="right">1</TableCell>
                <TableCell align="right">€{serviceObj?.basePrice || 1500}</TableCell>
                <TableCell align="right">€{serviceObj?.basePrice || 1500}</TableCell>
              </TableRow>
              {packageObj && invoice.packageId === 'premium' && (
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Relocation & Administrative Package Add-on
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      NIE, TIE local registrations, social security, SIP health cards, and bank account setup support.
                    </Typography>
                  </TableCell>
                  <TableCell align="right">1</TableCell>
                  <TableCell align="right">€700</TableCell>
                  <TableCell align="right">€700</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pricing totals — Itemized */}
        <Box className="grid grid-cols-12 gap-2">
          <Box className="col-span-12 sm:col-span-6">
            {/* 50% Refund Warning Notice */}
            <Box sx={{ p: 2, borderRadius: 2.5, border: '2px solid', borderColor: 'warning.main', bgcolor: 'rgba(245,158,11,0.06)', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <WarningAmberIcon color="warning" sx={{ mt: 0.3, flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.dark', mb: 0.5 }}>⚠️ Refund Policy Notice</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  <strong>50% of the service fee is NON-REFUNDABLE</strong> once the case has been initiated and documents reviewed. The remaining 50% is only refundable within 7 days of payment if no processing has started. By completing payment, the client acknowledges these terms.
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className="col-span-12 sm:col-span-6">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pl: { sm: 4 } }}>
              {/* Itemized Rows */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Base Service Fee ({serviceObj?.name || invoice.serviceId})</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>€{serviceBasePrice.toLocaleString()}</Typography>
              </Box>

              {relocationAddOn > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Relocation Package Add-on</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>+€{relocationAddOn}</Typography>
                </Box>
              )}

              {mainApplicantDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                  <Typography variant="body2">Main Applicant Discount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>-€{mainApplicantDiscount}</Typography>
                </Box>
              )}

              {dependentsDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                  <Typography variant="body2">Dependents Discount (€250 × {Math.round(dependentsDiscount / 250)})</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>-€{dependentsDiscount}</Typography>
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
            <MenuItem value="Tabby">Tabby (UAE)</MenuItem>
            <MenuItem value="Tamara">Tamara (UAE)</MenuItem>
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
