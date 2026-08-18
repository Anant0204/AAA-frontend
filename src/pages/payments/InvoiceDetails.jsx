import React, { useState } from 'react';
import dayjs from 'dayjs';
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
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CreditCardIcon from '@mui/icons-material/CreditCard';

// Assets & Components
import aaaLogo from '../../assets/aaa-logo.png';
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import useAuth from '../../hooks/useAuth';
import { SERVICES } from '../../constants/mockData';
import { getPackageDisplayName } from '../../utils/packageHelper';

// Official AAA Logo Image Component (Exact replica of Image 2)
const AaaLogoComponent = ({ width = 76, height = 76, style = {} }) => (
  <img
    src={aaaLogo}
    alt="AAA Business Consultancy Logo"
    style={{
      width,
      height,
      objectFit: 'contain',
      display: 'block',
      ...style
    }}
  />
);

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
    queryFn: dbService.getPayments
  });

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
    enabled: !!invoice
  });

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
    }
  });

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
    const d = dayjs(dateStr);
    return d.isValid() ? d.format('DD/MM/YYYY') : String(dateStr);
  };

  const invoiceNumber = invoice.invoiceNumber || invoice.invoiceNo || `INV-2026-${(invoice.id || '').replace(/-/g, '').slice(-6).toUpperCase()}`;
  const customerId = invoice?.clientCode || client?.clientCode || client?.displayId || client?.clientCustomId || client?.cid || (client?.id ? 'CID-' + client.id.slice(-5).toUpperCase() : (invoice?.clientId ? 'CID-' + invoice.clientId.slice(-5).toUpperCase() : 'CID-12005'));

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
      txn: transactionId
    });
  };

  const handleMarkFailed = () => {
    if (window.confirm('Mark this invoice transaction as Failed/Overdue?')) {
      updateStatusMutation.mutate({
        id: invoice.id,
        status: 'Failed',
        method: '-',
        txn: '-'
      });
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
      doc.setFontSize(20);
      doc.setTextColor(12, 35, 64);
      doc.text("AAA BUSINESS CONSULTANCY L.L.C", 14, 20);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(197, 155, 39);
      doc.text("ADVISE  *  ASSIST  *  ACHIEVE", 14, 26);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Email: client@aaabusinessconsultancy.com | Tel: +971509554142", 14, 32);
      doc.text("Business Village B, Office F-09, Port Saeed, Deira, Dubai, UAE", 14, 37);

      doc.setDrawColor(197, 155, 39);
      doc.setLineWidth(0.8);
      doc.line(14, 41, 196, 41);

      // Title & Reference
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(12, 35, 64);
      doc.text(`OFFICIAL INVOICE #${invoiceNumber}`, 14, 52);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Date Issued: ${formatInvoiceDate(invoice.billingDate || invoice.createdAt)}`, 130, 52);
      doc.text(`Due Date: ${formatInvoiceDate(invoice.dueDate)}`, 130, 58);
      doc.text(`Status: ${invoice.status}`, 130, 64);

      // Client info box
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 70, 182, 24, "F");
      doc.setFont("helvetica", "bold");
      doc.text("BILL TO:", 18, 78);
      doc.setFont("helvetica", "normal");
      doc.text(`Client Name: ${invoice.clientName || (client ? `${client.firstName} ${client.lastName}` : 'Valued Client')}`, 18, 85);
      doc.text(`Customer ID: ${customerId}`, 18, 91);

      // Summary Table Headers
      doc.setFillColor(12, 35, 64);
      doc.rect(14, 102, 182, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Description", 18, 107.5);
      doc.text("Amount (€)", 165, 107.5);

      // Table Row
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "normal");
      doc.text(`${itemTitle.slice(0, 45)}`, 18, 118);
      doc.text(`€${serviceBasePrice.toFixed(2)}`, 165, 118);

      let currentY = 126;
      if (additionalApplicantsCount > 0) {
        doc.text(`Co-Applicants (${additionalApplicantsCount} person(s))`, 18, currentY);
        doc.text(`+€${additionalApplicantsTotal.toFixed(2)}`, 165, currentY);
        currentY += 8;
      }

      if (assessmentCredit > 0) {
        doc.setTextColor(22, 163, 74);
        doc.text("Assessment Fee Credit", 18, currentY);
        doc.text(`-€${assessmentCredit.toFixed(2)}`, 165, currentY);
        currentY += 8;
      }

      if (discount > 0) {
        doc.setTextColor(22, 163, 74);
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
      doc.setTextColor(12, 35, 64);
      doc.text("Grand Total Due:", 115, currentY + 14);
      doc.text(`€${grandTotal.toFixed(2)}`, 165, currentY + 14);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Thank you for choosing AAA Business Consultancy for your Spain Relocation journey.", 14, currentY + 35);

      doc.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback to print
      window.print();
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
      {/* Inject Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, aside, .no-print, [class*="MuiDrawer"], [class*="Sidebar"], [class*="PageHeader"], .dunning-log-section {
            display: none !important;
          }
          .printable-invoice-letterhead {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 12mm 12mm !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: 'text.secondary', display: 'inline-flex', '@media print': { display: 'none' } }}
        className="no-print"
      >
        Back to Invoices
      </Button>

      <Box className="no-print">
        <PageHeader
          title={`Invoice ${invoiceNumber}`}
          subtitle="Review account retainer bills and client payment receipts."
          action={
            <Stack direction="row" spacing={1}>
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
      </Box>

      {/* ── OFFICIAL AAA BUSINESS CONSULTANCY FZC LLC LETTERHEAD INVOICE CONTAINER ── */}
      <Paper
        className="printable-invoice-letterhead"
        sx={{
          position: 'relative',
          bgcolor: '#ffffff',
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          minHeight: '850px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 2.5, sm: 4, md: 5 }
        }}
      >
        {/* Background Faint Watermark Logo */}
        <Box
          sx={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 0,
            width: '380px',
            height: '380px'
          }}
        >
          <AaaLogoComponent width="100%" height="100%" />
        </Box>

        {/* Content Wrapper */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* 1. OFFICIAL LETTERHEAD HEADER */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
            {/* Left Header: Logo & Company Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
              <AaaLogoComponent width={64} height={64} />
              <Box sx={{ borderLeft: '1.5px solid #C59B27', pl: 1.2, py: 0.2 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0C2340', lineHeight: 1.1, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                  AAA BUSINESS CONSULTANCY L.L.C
                </Typography>

                {/* Divider Line & Tagline */}
                <Box sx={{ borderTop: '1.5px solid #C59B27', borderBottom: '1.5px solid #C59B27', py: 0.2, px: 0.4, textAlign: 'center', mt: 0.5, display: 'inline-block', width: '100%' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.55rem', color: '#C59B27', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    ADVISE • ASSIST • ACHIEVE
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right Header: Contact Details Block */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
              <Box sx={{ width: '1.5px', height: '60px', bgcolor: '#C59B27', flexShrink: 0 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: '#0C2340', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0 }}>
                    ✉️
                  </Box>
                  <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    client@aaabusinessconsultancy.com
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: '#0C2340', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0 }}>
                    📞
                  </Box>
                  <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    +971509554142
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: '#0C2340', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0 }}>
                    🌐
                  </Box>
                  <Typography sx={{ fontSize: '0.68rem', color: '#0C2340', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    www.aaabusinessconsultancy.com
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                  <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: '#0C2340', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', flexShrink: 0, mt: 0.1 }}>
                    📍
                  </Box>
                  <Typography sx={{ fontSize: '0.63rem', color: '#0C2340', fontWeight: 700, maxWidth: '210px', lineHeight: 1.25 }}>
                    Business Village B , office number F-09 Port Saeed Deira Dubai, UAE
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 2. DUAL-TONE HEADER DIVIDER BAR */}
          <Box sx={{ width: '100%', height: '5px', borderRadius: '1px', display: 'flex', mb: 3.5, overflow: 'hidden' }}>
            <Box sx={{ width: '32%', bgcolor: '#0C2340' }} />
            <Box sx={{ width: '35%', bgcolor: '#C59B27' }} />
            <Box sx={{ width: '33%', bgcolor: '#0C2340' }} />
          </Box>

          {/* 3. INVOICE META & STATUS BAR */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
            <Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#0C2340', letterSpacing: '1px', lineHeight: 1 }}>
                INVOICE
              </Typography>
              <Typography sx={{ fontSize: '0.98rem', fontWeight: 700, color: '#334155', mt: 0.5 }}>
                Invoice #: {invoiceNumber}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <StatusBadge status={invoice.status} />
              </Box>
            </Box>

            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                <strong>Date Issued:</strong> {formatInvoiceDate(invoice.billingDate || invoice.createdAt)}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, mt: 0.4 }}>
                <strong>Due Date:</strong> {formatInvoiceDate(invoice.dueDate)}
              </Typography>
            </Box>
          </Box>

          {/* 4. BILL TO / PAYMENT DETAILS */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3.5, bgcolor: '#F8FAFC', p: 2.5, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                BILL TO
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0C2340' }}>
                {invoice.clientName || (client ? `${client.firstName} ${client.lastName}` : 'Valued Client')}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', mt: 0.3 }}>
                Customer ID: {customerId}
              </Typography>
            </Box>

            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                PAYMENT DETAILS
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B' }}>
                Method: {invoice.paymentMethod || 'Credit / Debit Card'}
              </Typography>
            </Box>
          </Box>

          {/* 5. ITEMIZED TABLE */}
          <TableContainer sx={{ mb: 3.5, borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#0C2340 !important', '& .MuiTableCell-head': { color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.88rem' } }}>
                <TableRow sx={{ bgcolor: '#0C2340 !important' }}>
                  <TableCell sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.3px' }}>Description</TableCell>
                  <TableCell align="right" sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.3px' }}>Qty</TableCell>
                  <TableCell align="right" sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.3px' }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ color: '#FFFFFF !important', bgcolor: '#0C2340 !important', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.3px' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0C2340' }}>
                      {itemTitle}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.2 }}>
                      {itemDescription}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>1</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>€{serviceBasePrice.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#0C2340' }}>€{serviceBasePrice.toFixed(2)}</TableCell>
                </TableRow>

                {additionalApplicantsCount > 0 && (
                  <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0C2340' }}>
                        Co-Applicants Relocation Support ({additionalApplicantsCount} person(s))
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{additionalApplicantsCount}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>€{additionalApplicantRate.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0C2340' }}>+€{additionalApplicantsTotal.toFixed(2)}</TableCell>
                  </TableRow>
                )}

                {assessmentCredit > 0 && (
                  <TableRow>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#16A34A' }}>
                        Eligibility Assessment Fee Credit (100% Deduction)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">1</TableCell>
                    <TableCell align="right" sx={{ color: '#16A34A', fontWeight: 700 }}>-€{assessmentCredit.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ color: '#16A34A', fontWeight: 700 }}>-€{assessmentCredit.toFixed(2)}</TableCell>
                  </TableRow>
                )}

                {discount > 0 && (
                  <TableRow>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#16A34A' }}>
                        Applied Promotional Discount
                      </Typography>
                    </TableCell>
                    <TableCell align="right">1</TableCell>
                    <TableCell align="right" sx={{ color: '#16A34A', fontWeight: 700 }}>-€{discount.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ color: '#16A34A', fontWeight: 700 }}>-€{discount.toFixed(2)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 6. FINANCIAL TOTALS SUMMARY */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <Box sx={{ width: { xs: '100%', sm: '320px' }, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <Typography sx={{ color: '#64748B', fontWeight: 600 }}>Base Service Fee</Typography>
                <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>€{serviceBasePrice.toFixed(2)}</Typography>
              </Box>

              {additionalApplicantsCount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <Typography sx={{ color: '#64748B', fontWeight: 600 }}>Co-Applicants ({additionalApplicantsCount})</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>+€{additionalApplicantsTotal.toFixed(2)}</Typography>
                </Box>
              )}

              {assessmentCredit > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16A34A' }}>
                  <Typography sx={{ fontWeight: 600 }}>Assessment Fee Credit</Typography>
                  <Typography sx={{ fontWeight: 700 }}>-€{assessmentCredit.toFixed(2)}</Typography>
                </Box>
              )}

              {discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16A34A' }}>
                  <Typography sx={{ fontWeight: 600 }}>Promotional Discount</Typography>
                  <Typography sx={{ fontWeight: 700 }}>-€{discount.toFixed(2)}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <Typography sx={{ color: '#64748B', fontWeight: 600 }}>UAE VAT (5%)</Typography>
                <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>€{vatAmount.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 0.5, borderColor: '#CBD5E1' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#0C2340', color: 'white', p: 1.5, borderRadius: '8px', borderLeft: '4px solid #C59B27' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>Grand Total</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#FACC15' }}>€{grandTotal.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center', mb: 2 }}>
            Thank you for choosing AAA Business Consultancy for your Spain Relocation journey.
          </Typography>
        </Box>

        {/* 7. OFFICIAL LETTERHEAD BOTTOM GRAPHIC FOOTER */}
        <Box sx={{ position: 'relative', width: '100%', mt: 4, overflow: 'hidden' }}>
          <svg viewBox="0 0 1000 45" preserveAspectRatio="none" style={{ width: '100%', height: '42px', display: 'block' }}>
            {/* Gold Accent Slanted Line */}
            <path d="M 0 10 L 230 10 C 248 10 258 18 266 28 L 278 45 L 1000 45 L 1000 38 L 274 38 L 260 22 C 252 12 240 4 225 4 L 0 4 Z" fill="#C59B27" />
            {/* Deep Navy Blue Bottom Base Block */}
            <path d="M 0 12 L 225 12 C 240 12 250 20 258 30 L 270 45 L 0 45 Z" fill="#0C2340" />
            <path d="M 270 45 L 1000 45 L 1000 38 L 270 38 Z" fill="#0C2340" />
          </svg>
        </Box>
      </Paper>

      {/* Dunning Reminders Log (Screen view only) */}
      {invoice.status === 'Pending' && (
        <Paper className="dunning-log-section no-print" sx={{ p: 4, mt: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
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
        </Paper>
      )}

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
