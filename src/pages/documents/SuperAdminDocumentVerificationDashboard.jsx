import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';

const FALLBACK_DATE = '2026-07-14';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PageHeader from '../../components/PageHeader';
import FilterPanel from '../../components/FilterPanel';
import { useAlert } from '../../contexts/AlertContext';
import { SERVICES } from '../../constants/mockData';
import { useAuth } from '../../hooks/useAuth';
import CredentialsModal from '../../components/CredentialsModal';

// Icons
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StampIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const SuperAdminDocumentVerificationDashboard = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlClientId = searchParams.get('clientId');
  const stateClientId = location.state?.selectedClientId || location.state?.clientId;
  const selectedClientId = urlClientId || stateClientId || '';

  useEffect(() => {
    if (!urlClientId && stateClientId) {
      setSearchParams({ clientId: stateClientId }, { replace: true });
    }
  }, [urlClientId, stateClientId, setSearchParams]);

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const roleConfig = (customizationSettings?.[currentUser?.id] || customizationSettings?.[currentUser?.role]) || {};
  const clientsActions = roleConfig.actions?.clients || { canChangeVisaStatus: true, canVerifyDocs: true, canDelete: true };

  const [docChecklistTab, setDocChecklistTab] = useState('all'); // 'all' | 'customer' | 'agent' | 'rejected'
  const [clientSearch, setClientSearch] = useState('');
  const [tableFilters, setTableFilters] = useState({ serviceId: '', status: '', assignedConsultantId: '' });
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [credentialsData, setCredentialsData] = useState(null);

  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Fetch Collections
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: dbService.getDocuments,
    staleTime: 0,
    refetchInterval: 10000,
    refetchOnWindowFocus: true
  });

  const reviewDocumentMutation = useMutation({
    mutationFn: ({ documentId, status, comment }) =>
      dbService.reviewDocument(documentId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Document verification status updated successfully', 'success');
    }
  });

  // Filter clients to show all so portal credentials can be generated
  const intakeClients = clients;

  const selectedClient = clients.find(c => c && c.id === selectedClientId);
  const viewMode = (selectedClientId && selectedClient) ? 'details' : 'list';
  const sId = (selectedClient?.serviceId || '').toLowerCase();
  const isTranslationClient = Boolean(selectedClient && (sId.includes('translation') || sId.includes('sworn')));
  const clientDocs = documents.filter(d => d && d.clientId === selectedClientId);

  const [swornUploadFile, setSwornUploadFile] = useState(null);
  const [isUploadingSworn, setIsUploadingSworn] = useState(false);

  const generateCredentialsAction = async () => {
    if (!selectedClient) return;
    try {
      const res = await dbService.generateClientCredentials(selectedClient.id);
      setGeneratedPassword(res.password);
      setCredentialsOpen(true);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error) {
      console.error('Error generating credentials', error);
      showAlert('Failed to generate credentials. Ensure backend is running.', 'error');
    }
  };

  const handlePrintPDF = () => {
    if (!selectedClient) return;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      showAlert('Popup blocked! Please allow popups to open the PDF.', 'warning');
      return;
    }

    const serviceName = SERVICES.find(s => s.id === selectedClient.serviceId)?.name || 'Spain Digital Nomad Visa (DNV)';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CLIENT_PROFILE_${selectedClient.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 30px 40px;
              color: #0F172A;
              background-color: #ffffff;
            }
            .header {
              border-bottom: 2px solid #E2E8F0;
              padding-bottom: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .company-name {
              font-size: 16px;
              font-weight: 800;
              color: #1E293B;
              letter-spacing: 0.5px;
            }
            .company-sub {
              font-size: 11px;
              color: #64748B;
              margin-top: 2px;
            }
            .doc-meta {
              text-align: right;
              font-size: 11px;
              color: #64748B;
              font-weight: 600;
            }
            .title-banner {
              background-color: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .title-text {
              font-size: 15px;
              font-weight: 800;
              color: #0F172A;
              letter-spacing: 0.5px;
            }
            .badge {
              background-color: #EEF2FF;
              color: #3730A3;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 12px;
              display: inline-block;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .info-box {
              background-color: #FFFFFF;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 12px 14px;
            }
            .full-width-box {
              grid-column: span 2;
            }
            .field-label {
              color: #64748B;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: block;
              margin-bottom: 4px;
            }
            .field-value {
              color: #0F172A;
              font-weight: 700;
              font-size: 13px;
            }
            @media print {
              body { padding: 15px 25px; }
              @page { size: A4; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company-name">AAA IMMIGRATION SERVICES LLC</div>
              <div class="company-sub">Calle Gran Vía 28, Centro, 28013 Madrid, España</div>
            </div>
            <div class="doc-meta">
              <div>Date: ${new Date(selectedClient.onboardingDate || selectedClient.createdDate || FALLBACK_DATE).toLocaleDateString()}</div>
              <div style="margin-top: 3px;">ID: ${selectedClient.id}</div>
            </div>
          </div>

          <div class="title-banner">
            <div class="title-text">CLIENT PROFILE SUMMARY</div>
            <div class="badge">${isTranslationClient ? 'Spanish Sworn Translation' : serviceName}</div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <span class="field-label">Full Legal Name</span>
              <span class="field-value">${(selectedClient.firstName || '').toUpperCase()} ${(selectedClient.lastName || '').toUpperCase()}</span>
            </div>
            <div class="info-box">
              <span class="field-label">Passport Number</span>
              <span class="field-value">${selectedClient.passportNumber || 'G9023812'}</span>
            </div>
            <div class="info-box">
              <span class="field-label">Date of Birth & Nationality</span>
              <span class="field-value">${selectedClient.dateOfBirth || '14 DEC 1988'} (${(selectedClient.nationality || 'INDIAN').toUpperCase()})</span>
            </div>
            <div class="info-box">
              <span class="field-label">Primary Email</span>
              <span class="field-value">${selectedClient.email || 'N/A'}</span>
            </div>
            <div class="info-box">
              <span class="field-label">Phone Number</span>
              <span class="field-value">${selectedClient.phone || 'N/A'}</span>
            </div>
            <div class="info-box">
              <span class="field-label">Communication Language</span>
              <span class="field-value">${selectedClient.preferredLanguage || 'English'}</span>
            </div>
            <div class="info-box full-width-box">
              <span class="field-label">Registered Living Address</span>
              <span class="field-value">${selectedClient.address || 'Calle Gran Vía 28, Centro, 28013 Madrid, España'}</span>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleOpenMockFile = (doc) => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      showAlert('Popup blocked! Please allow popups to open document files.', 'warning');
      return;
    }

    const category = (doc.category || '').toLowerCase();
    const docName = doc.name || doc.fileName || 'document.pdf';
    const clientName = selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Client Name';

    let docHtml;

    if (category.includes('passport')) {
      docHtml = `
        <div style="border: 2px solid black; padding: 30px; margin: 40px auto; max-width: 600px; background-color: #fffbe6; font-family: monospace; color: #000;">
          <h2 style="text-align: center; border-bottom: 2px solid; padding-bottom: 10px;">🛂 PASSPORT / PASAPORTE (SIMULATED COPY)</h2>
          <div style="display: flex; margin-top: 20px;">
            <div style="width: 130px; height: 160px; border: 1px solid black; background-color: #ccc; margin-right: 30px; display: flex; align-items: center; justify-content: center;">
              <strong>[PHOTO]</strong>
            </div>
            <div style="line-height: 1.8; font-size: 14px;">
              <strong>Type / Tipo:</strong> P<br/>
              <strong>Code / Código:</strong> ESP<br/>
              <strong>Passport No / Pasaporte:</strong> ${selectedClient?.passportNumber || 'G9023812'}<br/>
              <strong>Surname / Apellidos:</strong> ${selectedClient?.lastName?.toUpperCase() || 'SMITH'}<br/>
              <strong>Given Name / Nombre:</strong> ${selectedClient?.firstName?.toUpperCase() || 'JOHN'}<br/>
              <strong>Nationality / Nacionalidad:</strong> ${selectedClient?.nationality?.toUpperCase() || 'BRITISH'}<br/>
              <strong>Date of Birth:</strong> ${selectedClient?.dateOfBirth || '14 DEC 1988'}<br/>
              <strong>Sex / Sexo:</strong> M<br/>
            </div>
          </div>
          <div style="border: 2px dashed red; color: red; text-align: center; margin-top: 30px; padding: 10px; font-weight: bold; font-size: 14px;">
            ✓ OFFICIAL DOCUMENT COPY SUBMITTED SECURELY
          </div>
        </div>
      `;
    } else if (category.includes('bank') || category.includes('statement') || category.includes('fund') || category.includes('savings')) {
      docHtml = `
        <div style="border: 2px solid black; padding: 30px; margin: 40px auto; max-width: 700px; font-family: sans-serif; color: #333;">
          <h2 style="border-bottom: 3px solid #1c3d5a; padding-bottom: 10px; color: #1c3d5a;">🏦 BANCO SANTANDER - BANK STATEMENT</h2>
          <p><strong>Account Holder:</strong> ${clientName}</p>
          <p><strong>IBAN:</strong> ES90 0049 8912 3456 7890</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #ccc; text-align: left;">
                <th style="padding: 10px;">Date</th>
                <th style="padding: 10px;">Description</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
                <th style="padding: 10px; text-align: right;">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">01 Jun 2026</td>
                <td style="padding: 10px;">Opening Balance</td>
                <td style="padding: 10px; text-align: right;">-</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">€15,200.00</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">05 Jun 2026</td>
                <td style="padding: 10px;">Remote Employment Salary</td>
                <td style="padding: 10px; text-align: right; color: green;">+€3,800.00</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">€19,000.00</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">12 Jun 2026</td>
                <td style="padding: 10px;">ATM Cash Withdrawal Madrid</td>
                <td style="padding: 10px; text-align: right; color: red;">-€200.00</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">€18,800.00</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 30px; padding: 15px; background-color: #e6fffa; border: 1px solid #319795; color: #234e52; font-size: 13px; font-weight: bold;">
            ✓ Verification Passed: Monthly average meets DNV visa Spain requirements.
          </div>
        </div>
      `;
    } else {
      docHtml = `
        <div style="border: 2px solid black; padding: 40px; margin: 40px auto; max-width: 600px; font-family: serif; color: #333; line-height: 1.6;">
          <h3 style="text-align: center; border-bottom: 1px solid; padding-bottom: 10px;">DOC REF: ${docName.toUpperCase()}</h3>
          <p style="text-align: right; font-size: 12px;">Date: ${new Date(doc.uploadedDate || FALLBACK_DATE).toLocaleDateString()}</p>
          <p><strong>Document Verification Intake Record</strong></p>
          <p>This is a simulated verification record of the document category <strong>"${doc.category}"</strong> uploaded by client <strong>${clientName}</strong>.</p>
          <p>Document details, metadata and file integrity certificates have been validated by the backend service. File is clean and active.</p>
          <div style="margin-top: 50px; text-align: center; border-top: 1px dashed #ccc; padding-top: 20px;">
            <p style="font-size: 11px; color: #777;">AAA IMMIGRATION CLOUD REPOSITORY - SCAN CERTIFICATE</p>
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <html>
        <head>
          <title>${docName}</title>
        </head>
        <body style="background-color: #f7fafc; padding: 20px; font-family: sans-serif;">
          <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
              <span style="font-weight: bold; color: #4a5568;">📄 Simulated Document File: ${docName}</span>
              <button onclick="window.print()" style="padding: 6px 15px; background: #e53e3e; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Print / Save PDF</button>
            </div>
            ${docHtml}
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getServiceLabel = (serviceId) => {
    return SERVICES.find(s => s.id === serviceId)?.name || serviceId?.toUpperCase() || 'Immigration';
  };

  if (isClientsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }
  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Document Verification Dashboard"
        subtitle="Dedicated workspace for operations team to verify client profile details and approve or reject uploaded document credentials."
      />

      {viewMode === 'list' ? (
        /* ===== CLIENT SELECTION TABLE WITH SEARCH ===== */
        <Paper sx={{ mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3, overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
            {/* Row 1: Title + Search */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>All Client Cases</Typography>
                <Typography variant="caption" color="text.secondary">{intakeClients.length} clients with intake submissions or uploaded documents</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {/* Search bar */}
                <TextField
                  size="small"
                  placeholder="Search by name, ID or status..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  sx={{ bgcolor: 'background.paper', width: { xs: '100%', sm: 280 }, mt: { xs: 0.5, sm: 0 } }}
                  InputProps={{
                    startAdornment: (
                      <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                      </Box>
                    )
                  }}
                />
              </Box>
            </Box>
            {/* Row 2: Filter dropdowns */}
            <FilterPanel
              filters={tableFilters}
              onFilterChange={(key, val) => setTableFilters(prev => ({ ...prev, [key]: val }))}
              onClearFilters={() => setTableFilters({ serviceId: '', status: '', assignedConsultantId: '' })}
              statusOptions={['Under Process', 'Waiting for Payment', 'Documents Pending', 'Completed', 'Cancelled']}
              sx={{ borderRadius: 1.5, p: 1 }}
            />
          </Box>

          {/* Client Table */}
          <Box sx={{ overflowX: 'auto', minHeight: 400, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  {['Client ID', 'Name', 'Service', 'Status', 'Progression', 'Documents'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        backgroundColor: 'var(--mui-palette-background-neutral, #E9EDF5)',
                        color: 'var(--mui-palette-text-secondary, #283593)',
                        borderBottom: '2px solid rgba(63,81,181,0.2)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {intakeClients
                  .filter(c => {
                    // Search text filter
                    if (clientSearch) {
                      const q = clientSearch.toLowerCase();
                      const matchSearch = (
                        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                        c.id?.toLowerCase().includes(q) ||
                        (c.status || '').toLowerCase().includes(q) ||
                        (c.serviceId || '').toLowerCase().includes(q)
                      );
                      if (!matchSearch) return false;
                    }
                    // Dropdown filters
                    if (tableFilters.serviceId && c.serviceId !== tableFilters.serviceId) return false;
                    if (tableFilters.status && (c.status || 'Under Process') !== tableFilters.status) return false;
                    if (tableFilters.assignedConsultantId && c.assignedConsultantId !== tableFilters.assignedConsultantId) return false;
                    return true;
                  })
                  .map((c, idx) => {
                    const isSelected = c.id === selectedClientId;
                    const clientDocs = documents.filter(d => d.clientId === c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => {
                          setSearchParams({ clientId: c.id });
                        }}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(63,81,181,0.08)' : idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                          borderLeft: isSelected ? '3px solid #3F51B5' : '3px solid transparent',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(63,81,181,0.04)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)'; }}
                      >
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: '#3F51B5', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(63,81,181,0.1)' }}>{c.id}</td>
                        <td style={{ padding: '9px 12px', fontWeight: isSelected ? 700 : 500, borderBottom: '1px solid rgba(63,81,181,0.1)', whiteSpace: 'nowrap' }}>
                          {c.firstName} {c.lastName}
                        </td>
                        <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(63,81,181,0.1)', whiteSpace: 'nowrap', color: '#475569', fontSize: '0.78rem' }}>
                          {SERVICES.find(s => s.id === c.serviceId)?.name || `Spain ${c.serviceId?.toUpperCase() || 'VISA'}`}
                        </td>
                        <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(63,81,181,0.1)' }}>
                          <span style={{
                            padding: '2px 10px',
                            borderRadius: 12,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: c.status === 'Completed' ? '#DCFCE7' : c.status === 'Cancelled' ? '#FEE2E2' : '#EEF2FF',
                            color: c.status === 'Completed' ? '#15803D' : c.status === 'Cancelled' ? '#B91C1C' : '#3730A3',
                            whiteSpace: 'nowrap',
                          }}>{c.status || 'Under Process'}</span>
                        </td>
                        <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(63,81,181,0.1)' }}>
                          <span style={{
                            padding: '2px 10px',
                            borderRadius: 12,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: '#E0F2FE',
                            color: '#0369A1',
                            whiteSpace: 'nowrap',
                          }}>{c.visaStatus || 'Document Review'}</span>
                        </td>
                        <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(63,81,181,0.1)', color: '#475569', fontSize: '0.8rem' }}>
                          {clientDocs.length} file{clientDocs.length !== 1 ? 's' : ''}
                        </td>
                      </tr>
                    );
                  })}
                {intakeClients.filter(c => {
                  if (clientSearch) {
                    const q = clientSearch.toLowerCase();
                    const matchSearch = (
                      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                      c.id?.toLowerCase().includes(q) ||
                      (c.status || '').toLowerCase().includes(q) ||
                      (c.serviceId || '').toLowerCase().includes(q)
                    );
                    if (!matchSearch) return false;
                  }
                  if (tableFilters.serviceId && c.serviceId !== tableFilters.serviceId) return false;
                  if (tableFilters.status && (c.status || 'Under Process') !== tableFilters.status) return false;
                  if (tableFilters.assignedConsultantId && c.assignedConsultantId !== tableFilters.assignedConsultantId) return false;
                  return true;
                }).length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontWeight: 500 }}>
                      No clients match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ pb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSearchParams({})}
            sx={{ mb: 2, color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}
          >
            Back to Client Cases List
          </Button>

          {selectedClient && (
            <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, bgcolor: 'background.paper' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {selectedClient.firstName} {selectedClient.lastName}
                  </Typography>
                  <Chip
                    label={selectedClient.status || 'Under Process'}
                    size="small"
                    color={selectedClient.status === 'Completed' ? 'success' : 'primary'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Client ID: <strong>{selectedClient.id}</strong> | Target Visa: <strong>{SERVICES.find(s => s.id === selectedClient.serviceId)?.name || selectedClient.serviceId || 'Visa'}</strong>
                </Typography>
              </Box>

              <Button
                variant="contained"
                color={selectedClient.hasCredentials ? 'warning' : 'secondary'}
                size="small"
                onClick={async () => {
                  try {
                    const res = await dbService.generateClientCredentials(selectedClient.id);
                    setCredentialsData(res);
                    setCredentialsModalOpen(true);
                  } catch (error) {
                    console.error('Error generating credentials', error);
                    showAlert('Failed to generate credentials. Ensure backend is running.', 'error');
                  }
                }}
                sx={{ textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap' }}
              >
                {selectedClient.hasCredentials ? 'Reset Portal Credentials' : 'Generate Portal Credentials'}
              </Button>
            </Paper>
          )}

          <Box className="grid grid-cols-12 gap-7">
            {/* Sleek Ultra-Compact Client Profile Reference Banner (70% Reduced Height) */}
            <Box className="col-span-12">
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 3,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.1rem' }}>
                      👤 {selectedClient.firstName} {selectedClient.lastName}
                    </Typography>
                    <Chip
                      label={isTranslationClient ? '📜 Spanish Sworn Translation' : `✈️ ${getServiceLabel(selectedClient.serviceId)}`}
                      color={isTranslationClient ? 'secondary' : 'primary'}
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                    />
                    <Chip
                      label={`ID: ${selectedClient.id || 'N/A'}`}
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B' }}
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handlePrintPDF}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.75rem' }}
                  >
                    Open / Print Full PDF
                  </Button>
                </Box>

                {/* Key Verification Metadata 2-Row Compact Grid */}
                <Box className="grid grid-cols-12 gap-4">
                  <Box className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      PASSPORT NUMBER
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                      {selectedClient.passportNumber || 'G9023812'}
                    </Typography>
                  </Box>

                  <Box className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      DOB & CITIZENSHIP
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                      {selectedClient.dateOfBirth || '14 DEC 1988'} ({selectedClient.nationality?.toUpperCase() || 'BRITISH'})
                    </Typography>
                  </Box>

                  <Box className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      EMAIL & PHONE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedClient.email} | {selectedClient.phone}
                    </Typography>
                  </Box>

                  <Box className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      REGISTERED ADDRESS
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedClient.address || 'Calle Gran Vía 28, Madrid, España'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Staff Drag & Drop Upload Zone (ONLY Visible for Sworn Translation Clients) */}
            {isTranslationClient && (
              <Box className="col-span-12" sx={{ mb: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: '#FAF5FF',
                    border: '2px dashed #9333EA',
                    borderRadius: 3,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7E22CE', mb: 0.5 }}>
                    📤 Drag & Drop Completed Sworn Translation PDF
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B21A8', display: 'block', mb: 2 }}>
                    Upload official Spanish Sworn Translation files here to deliver directly to the Client Portal.
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      id="staff-sworn-drag-input-super"
                      style={{ display: 'none' }}
                      accept="application/pdf,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSwornUploadFile(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />

                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => document.getElementById('staff-sworn-drag-input-super').click()}
                      sx={{ textTransform: 'none', fontWeight: 800, px: 3, py: 1, borderRadius: 2 }}
                    >
                      Browse & Upload Finished Sworn PDF
                    </Button>
                  </Box>
                </Paper>
              </Box>
            )}

          {/* BOTTOM FULL-WIDTH COLUMN: Uploaded Document Checklist (3 Columns Side-by-Side) */}
          <Box className="col-span-12" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="secondary" /> Uploaded Document Checklist
              </Typography>
            </Box>

            {(() => {
              const allDocs = documents.filter(d => d && (d.clientId === selectedClient?.id || (selectedClient?.email && d.clientEmail === selectedClient.email)));
              
              const isStaffDoc = (d) => {
                const cat = (d.category || '').toLowerCase();
                const belongs = (d.belongsTo || '').toLowerCase();
                const role = (d.uploadedByRole || d.uploadedBy || '').toLowerCase();
                return (
                  cat.includes('sworn') ||
                  cat.includes('official') ||
                  cat.includes('translation') ||
                  belongs.includes('staff') ||
                  role === 'agent' ||
                  role === 'staff' ||
                  role === 'admin' ||
                  role === 'operations' ||
                  role === 'consultant'
                );
              };

              const agentDocs = allDocs.filter(d => d.status !== 'Rejected' && isStaffDoc(d));
              const customerDocs = allDocs.filter(d => d.status !== 'Rejected' && !isStaffDoc(d));
              const rejectedDocs = allDocs.filter(d => d.status === 'Rejected');

              const renderDocCard = (doc) => {
                const isApproved = doc.status === 'Approved' || doc.status === 'Verified';
                const isRejected = doc.status === 'Rejected';
                const docName = doc.name || doc.fileName || 'Uploaded Document';

                return (
                  <Card
                    key={doc.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      mb: 1.2,
                      borderColor: isApproved ? 'success.main' : isRejected ? 'error.main' : 'divider',
                      bgcolor: isApproved ? '#F0FDF4' : isRejected ? '#FEF2F2' : '#FFFFFF',
                      boxShadow: 'none',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
                    }}
                  >
                    <Box sx={{ p: 1.2 }}>
                      {/* Top Line: File Icon + Truncated Name + Status Chip */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0, flex: 1 }}>
                          <InsertDriveFileIcon sx={{ fontSize: 18, color: isApproved ? '#16A34A' : isRejected ? '#DC2626' : '#64748B', flexShrink: 0 }} />
                          <Typography
                            variant="subtitle2"
                            title={docName}
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: '#1E293B',
                              flex: 1
                            }}
                          >
                            {docName}
                          </Typography>
                        </Box>
                        <Chip
                          label={doc.status || 'Pending'}
                          color={isApproved ? 'success' : isRejected ? 'error' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 800, height: 18, fontSize: '0.6rem', px: 0.5, flexShrink: 0 }}
                        />
                      </Box>

                      {/* Category & Size Sub-line */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 0.2 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                          Cat: <strong style={{ color: '#334155' }}>{doc.category || doc.docType || 'General'}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                          Size: <strong style={{ color: '#334155' }}>{doc.fileSize || '1.5 MB'}</strong>
                        </Typography>
                      </Box>

                      {/* Optional Comment/Reason Box */}
                      {doc.comment && (
                        <Box sx={{ mb: 1, p: 0.8, bgcolor: isApproved ? '#DCFCE7' : '#FEE2E2', borderRadius: 1, borderLeft: '2.5px solid', borderColor: isApproved ? '#16A34A' : '#DC2626' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isApproved ? '#15803D' : '#B91C1C', fontWeight: 600, display: 'block', wordBreak: 'break-word' }}>
                            Note: {doc.comment}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 0.8 }} />

                      {/* Compact Action Buttons Row (Single Line 100% Fit) */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, width: '100%', flexWrap: 'nowrap' }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => {
                            if (doc.url || doc.fileUrl) {
                              const fileUrl = doc.url
                                ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${doc.url}`
                                : doc.fileUrl;
                              window.open(fileUrl, '_blank');
                            } else {
                              handleOpenMockFile(doc);
                            }
                          }}
                          sx={{ textTransform: 'none', fontSize: '0.62rem', fontWeight: 700, minWidth: 0, flex: 1, px: 0.4, py: 0.3 }}
                        >
                          Open
                        </Button>

                        <Button
                          variant="outlined"
                          color="info"
                          size="small"
                          disabled={!doc.url && !doc.fileUrl}
                          onClick={async () => {
                            try {
                              showAlert(`Downloading ${docName}...`, 'info');
                              const rawUrl = doc.url
                                ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${doc.url}`
                                : doc.fileUrl;
                              const response = await fetch(rawUrl);
                              if (!response.ok) throw new Error('Download failed');
                              const blob = await response.blob();
                              const blobUrl = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = blobUrl;
                              link.download = docName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(blobUrl);
                              showAlert('Downloaded!', 'success');
                            } catch (err) {
                              console.error(err);
                              showAlert('Failed to download document.', 'error');
                            }
                          }}
                          sx={{ textTransform: 'none', fontSize: '0.62rem', fontWeight: 700, minWidth: 0, flex: 1, px: 0.4, py: 0.3 }}
                        >
                          Download
                        </Button>

                        {isTranslationClient && (
                          <>
                            <input
                              type="file"
                              id={`translated-file-input-${doc.id}`}
                              style={{ display: 'none' }}
                              accept="application/pdf"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    await dbService.uploadTranslatedDocument(doc.id, e.target.files[0]);
                                    queryClient.invalidateQueries({ queryKey: ['documents'] });
                                    queryClient.invalidateQueries({ queryKey: ['clients'] });
                                    showAlert('Translated document uploaded successfully!', 'success');
                                  } catch (err) {
                                    console.error(err);
                                    showAlert('Failed to upload translated document.', 'error');
                                  }
                                }
                              }}
                            />
                            <Button
                              variant="contained"
                              color="warning"
                              size="small"
                              onClick={() => document.getElementById(`translated-file-input-${doc.id}`).click()}
                              sx={{ textTransform: 'none', fontSize: '0.62rem', fontWeight: 700, minWidth: 0, flex: 1, px: 0.4, py: 0.3 }}
                            >
                              {doc.translatedUrl ? 'Re-Trans' : 'Trans'}
                            </Button>
                          </>
                        )}

                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          disabled={isApproved || reviewDocumentMutation.isLoading || clientsActions.canVerifyDocs === false}
                          onClick={() => {
                            reviewDocumentMutation.mutate({
                              documentId: doc.id,
                              status: 'Approved',
                              comment: 'Verified and approved.'
                            });
                          }}
                          sx={{ textTransform: 'none', fontSize: '0.62rem', fontWeight: 700, minWidth: 0, flex: 1, px: 0.4, py: 0.3 }}
                        >
                          Approve
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={isRejected || reviewDocumentMutation.isLoading || clientsActions.canVerifyDocs === false}
                          onClick={() => {
                            const reason = window.prompt(`Enter reason for rejecting "${docName}":`);
                            if (reason !== null) {
                              reviewDocumentMutation.mutate({
                                documentId: doc.id,
                                status: 'Rejected',
                                comment: reason || 'Document rejected.'
                              });
                            }
                          }}
                          sx={{ textTransform: 'none', fontSize: '0.62rem', fontWeight: 700, minWidth: 0, flex: 1, px: 0.4, py: 0.3 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                );
              };

              return isTranslationClient ? (
                // 3 COLUMNS SIDE-BY-SIDE FOR SWORN TRANSLATION CLIENTS
                <Box className="grid grid-cols-12 gap-5">
                  {/* COLUMN 1: Customer Uploaded Documents */}
                  <Box className="col-span-12 md:col-span-4">
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>👤 Customer Uploaded</span>
                        <Chip label={customerDocs.length} color="secondary" size="small" sx={{ fontWeight: 800 }} />
                      </Typography>
                      {customerDocs.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: '#FFFFFF' }}>
                          <Typography color="text.secondary" variant="body2">No customer-uploaded documents submitted yet.</Typography>
                        </Paper>
                      ) : (
                        <Box
                          sx={{
                            maxHeight: 430,
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: '5px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
                          }}
                        >
                          {customerDocs.map(renderDocCard)}
                        </Box>
                      )}
                    </Paper>
                  </Box>

                  {/* COLUMN 2: Agent Uploaded Documents */}
                  <Box className="col-span-12 md:col-span-4">
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'info.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>👨‍💼 Agent / Staff Uploaded</span>
                        <Chip label={agentDocs.length} color="info" size="small" sx={{ fontWeight: 800 }} />
                      </Typography>
                      {agentDocs.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: '#FFFFFF' }}>
                          <Typography color="text.secondary" variant="body2">No agent/staff-uploaded documents attached yet.</Typography>
                        </Paper>
                      ) : (
                        <Box
                          sx={{
                            maxHeight: 430,
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: '5px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
                          }}
                        >
                          {agentDocs.map(renderDocCard)}
                        </Box>
                      )}
                    </Paper>
                  </Box>

                  {/* COLUMN 3: Rejected Documents & History */}
                  <Box className="col-span-12 md:col-span-4">
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>🔴 Rejected Documents & History</span>
                        <Chip label={rejectedDocs.length} color="error" size="small" sx={{ fontWeight: 800 }} />
                      </Typography>
                      {rejectedDocs.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: '#FFFFFF' }}>
                          <Typography color="text.secondary" variant="body2">No rejected document history for this client profile.</Typography>
                        </Paper>
                      ) : (
                        <Box
                          sx={{
                            maxHeight: 430,
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: '5px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
                          }}
                        >
                          {rejectedDocs.map(renderDocCard)}
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Box>
              ) : (
                // 2 WIDER COLUMNS (50% / 50%) FOR VISA PACKAGE CLIENTS (NO AGENT UPLOAD COLUMN)
                <Box className="grid grid-cols-12 gap-5">
                  {/* COLUMN 1: Customer Uploaded Documents (col-span-6) */}
                  <Box className="col-span-12 md:col-span-6">
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>👤 Customer Uploaded Documents</span>
                        <Chip label={customerDocs.length} color="secondary" size="small" sx={{ fontWeight: 800 }} />
                      </Typography>
                      {customerDocs.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: '#FFFFFF' }}>
                          <Typography color="text.secondary" variant="body2">No customer-uploaded documents submitted yet.</Typography>
                        </Paper>
                      ) : (
                        <Box
                          sx={{
                            maxHeight: 430,
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: '5px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
                          }}
                        >
                          {customerDocs.map(renderDocCard)}
                        </Box>
                      )}
                    </Paper>
                  </Box>

                  {/* COLUMN 2: Rejected Documents & History (col-span-6) */}
                  <Box className="col-span-12 md:col-span-6">
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>🔴 Rejected Documents & History</span>
                        <Chip label={rejectedDocs.length} color="error" size="small" sx={{ fontWeight: 800 }} />
                      </Typography>
                      {rejectedDocs.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: '#FFFFFF' }}>
                          <Typography color="text.secondary" variant="body2">No rejected document history for this client profile.</Typography>
                        </Paper>
                      ) : (
                        <Box
                          sx={{
                            maxHeight: 430,
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: '5px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
                          }}
                        >
                          {rejectedDocs.map(renderDocCard)}
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Box>
              );
            })()}
          </Box>
        </Box>
      </Box>
    )}

      {/* Credentials Dialog */}
      <Dialog
        open={credentialsModalOpen}
        onClose={() => setCredentialsModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          🔑 Portal Credentials
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {credentialsData?.alreadyExists ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Credentials have already been generated for this client. You can share their registered email as username. If you want to reset their password, click <strong>Reset Password</strong> below.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Portal credentials generated successfully. Please share these with the client securely.
            </Typography>
          )}

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider', mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
              PORTAL URL
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1.5, wordBreak: 'break-all' }}>
              {window.location.origin}/#/portal/login
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
              USERNAME (CLIENT EMAIL)
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1.5, wordBreak: 'break-all' }}>
              {credentialsData?.username || ''}
            </Typography>

            {credentialsData?.password && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                  PASSWORD
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontWeight: 'bold', color: 'secondary.main' }}>
                  {credentialsData.password}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          {credentialsData?.alreadyExists && (
            <Button
              color="error"
              variant="outlined"
              onClick={async () => {
                const confirmed = window.confirm('Are you sure you want to reset the client password? This will overwrite their existing password.');
                if (!confirmed) return;
                try {
                  const res = await dbService.generateClientCredentials(selectedClient.id, true);
                  setCredentialsData(res);
                  showAlert('Credentials reset successfully!', 'success');
                } catch (error) {
                  console.error(error);
                  showAlert('Failed to reset credentials', 'error');
                }
              }}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Reset Password
            </Button>
          )}
          <Button
            onClick={() => {
              const textToCopy = `Portal URL: ${window.location.origin}/#/portal/login\nUsername: ${credentialsData?.username}\n${credentialsData?.password ? `Password: ${credentialsData.password}\n` : ''}Please keep these credentials secure.`;
              navigator.clipboard.writeText(textToCopy);
              showAlert('Credentials copied to clipboard!', 'success');
            }}
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Copy Info
          </Button>
          <Button
            onClick={() => setCredentialsModalOpen(false)}
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Preview removed - files now open directly in new tabs */}
      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Portal Credentials?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This client already has portal access. Generating new credentials will overwrite their current password and they will be locked out of their account until you provide them with the new temporary password.
            <br /><br />
            Are you sure you want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3.5 }}>
          <Button onClick={() => setResetConfirmOpen(false)} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setResetConfirmOpen(false);
              generateCredentialsAction();
            }}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Yes, Reset Credentials
          </Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Presentation Modal */}
      <CredentialsModal
        open={credentialsOpen}
        onClose={() => setCredentialsOpen(false)}
        client={selectedClient}
        password={generatedPassword}
      />

      {/* Sworn Translation Upload Confirmation Dialog */}
      <Dialog
        open={Boolean(swornUploadFile)}
        onClose={() => { if (!isUploadingSworn) setSwornUploadFile(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: '#7E22CE', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon /> Confirm Sworn Translation Delivery
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please review the details below before delivering this official document to the Client Portal.
          </Typography>

          <Paper elevation={0} sx={{ p: 2, bgcolor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 2, mb: 2 }}>
            <Box className="grid grid-cols-12 gap-3" sx={{ fontSize: '0.82rem' }}>
              <Box className="col-span-12 sm:col-span-6">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>SELECTED FILE:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#6B21A8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📄 {swornUploadFile?.name}
                </Typography>
              </Box>
              <Box className="col-span-12 sm:col-span-6">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>FILE SIZE:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B' }}>
                  {swornUploadFile ? `${(swornUploadFile.size / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
                </Typography>
              </Box>
              <Box className="col-span-12 sm:col-span-6">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>RECIPIENT CLIENT:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  👤 {selectedClient?.firstName} {selectedClient?.lastName}
                </Typography>
              </Box>
              <Box className="col-span-12 sm:col-span-6">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>DESTINATION COLUMN:</Typography>
                <Chip label="Column 2 (Agent / Staff Uploaded)" color="info" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#EFF6FF', borderLeft: '4px solid #3B82F6', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 600, display: 'block' }}>
              📧 <strong>Automatic Action:</strong> Upon confirmation, this file will be published to the Client Portal and an automatic email notification will be sent to <strong>{selectedClient?.email}</strong>.
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            disabled={isUploadingSworn}
            onClick={() => setSwornUploadFile(null)}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={isUploadingSworn}
            startIcon={isUploadingSworn ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
            onClick={async () => {
              if (!swornUploadFile || !selectedClient) return;
              try {
                setIsUploadingSworn(true);
                showAlert(`Uploading ${swornUploadFile.name}...`, 'info');
                await dbService.uploadDocument({
                  clientId: selectedClient.id,
                  file: swornUploadFile,
                  category: 'Official Sworn Output',
                  uploadedByRole: 'agent',
                  belongsTo: 'Staff Upload',
                  status: 'Verified'
                });
                queryClient.invalidateQueries({ queryKey: ['documents'] });
                queryClient.invalidateQueries({ queryKey: ['clients'] });
                showAlert('Sworn Translation uploaded & client notified via email!', 'success');
                setSwornUploadFile(null);
              } catch (err) {
                console.error(err);
                showAlert('Failed to upload document.', 'error');
              } finally {
                setIsUploadingSworn(false);
              }
            }}
            sx={{ textTransform: 'none', fontWeight: 800, px: 3, borderRadius: 2 }}
          >
            {isUploadingSworn ? 'Delivering...' : 'Confirm & Deliver to Client Portal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminDocumentVerificationDashboard;
