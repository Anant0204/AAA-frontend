import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

// Components & Services
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import AppCard from '../../components/AppCard';
import Timeline from '../../components/Timeline';
import AppModal from '../../components/AppModal';
import FileUploader from '../../components/FileUploader';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../hooks/useAuth';
import { SERVICES, PACKAGES } from '../../constants/mockData';
import { getPackageDisplayName } from '../../utils/packageHelper';
import { maskIBAN } from '../../utils/ibanValidator';

export const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { isAdmin, isOperations } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  let defaultTab = 0;
  if (tabParam === 'documents' || tabParam === '1') {
    defaultTab = 1;
  } else if (location.state?.initialTab !== undefined) {
    defaultTab = location.state.initialTab;
  }

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedVisaStatus, setSelectedVisaStatus] = useState('');
  const [selectedBillingStatus, setSelectedBillingStatus] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');

  // Fetch client details
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients });

  const client = clients.find((c) => c.id === id);

  // Fetch payments, documents, consultations
  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments });

  const { data: documents = [], refetch: refetchDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: dbService.getDocuments });

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations });

  // Fetch Consultants dynamically
  const { data: consultants = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants });

  const { data: dbPackages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: dbService.getPackages });

  // Fetch Leads dynamically
  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: dbService.getLeads });

  // Fetch dynamic lifecycle stages
  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages });

  // Fetch refund requests for client profile display
  const { data: refundRequests = [] } = useQuery({
    queryKey: ['refundRequests'],
    queryFn: dbService.getRefundRequests });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ clientId, visaStatus, status, packageId }) =>
      dbService.updateClientVisaStatus(clientId, visaStatus, status, null, packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      showAlert('Client status & package updated successfully', 'success');
      setStatusModalOpen(false);
    } });

  const uploadDocMutation = useMutation({
    mutationFn: dbService.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      refetchDocs();
      showAlert('Document uploaded and queued for review', 'success');
    } });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Client not found</Typography>
        <Button startIcon={<KeyboardArrowLeftIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  // Linked details
  const originalLead = leads.find((l) => l.clientId === client.id || l.email === client.email);
  const clientPayments = payments.filter((p) => p.clientId === client.id);
  const clientDocuments = documents.filter((d) => d.clientId === client.id);
  const clientConsultations = consultations.filter((c) => c.leadId === originalLead?.id || c.clientName === `${client.firstName} ${client.lastName}`);
  const consultationsWithRecordings = clientConsultations.filter(c => c.recordingUrl);

  const serviceObj = SERVICES.find((s) => s.id === client.serviceId);
  const packageObj = PACKAGES.find((p) => p.id === client.packageId);
  const consultantObj = consultants.find((c) => c.id === client.assignedConsultantId);

  const handleOpenStatusModal = () => {
    setSelectedVisaStatus(client.visaStatus);
    setSelectedBillingStatus(client.status);
    setSelectedPackageId(client.packageId || '');
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = () => {
    updateStatusMutation.mutate({
      clientId: client.id,
      visaStatus: selectedVisaStatus,
      status: selectedBillingStatus,
      packageId: selectedPackageId
    });
  };

  const handleDocUploaded = (docData) => {
    uploadDocMutation.mutate(docData);
  };

  const visaStatuses = [
    'Not Started',
    'Document Preparation',
    'Document Review',
    'Apostille & Translations',
    'Submitted - Pending Decision',
    'NIE / Local Registration',
    'Visa Approved',
    'Rejected',
    'Closed',
  ];

  const billingStatuses = [
    'Waiting for Payment',
    'Partially Paid',
    'Payment Completed',
    'Documents Pending',
    'Under Process',
    'Completed',
    'Case Closed',
  ];

  return (
    <Box>
      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Clients
      </Button>

      <PageHeader
        title={`${client.firstName} ${client.lastName}`}
        subtitle={`Client Registry: ${client.id} | Managed by: ${consultantObj ? consultantObj.name : 'Unknown'}`}
        action={
          <Button variant="outlined" onClick={handleOpenStatusModal}>
            Update Progression Status
          </Button>
        }
      />

      <Box className="grid grid-cols-12 gap-4" sx={{ mb: 3, alignItems: 'stretch' }}>
        {/* Left pane: Profile summary info */}
        <Box className="col-span-12 md:col-span-3">
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 72, height: 72, mx: 'auto', mb: 1.5, bgcolor: 'secondary.main', fontSize: '1.8rem', fontWeight: 600 }}
              >
                {client.firstName[0]}
                {client.lastName[0]}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {client.firstName} {client.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', wordBreak: 'break-all' }}>
                {client.email}
              </Typography>
              <Stack direction="column" spacing={1} sx={{ alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Visa Process</Typography>
                  <StatusBadge status={client.visaStatus} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Billing Status</Typography>
                  <StatusBadge status={client.status} />
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Target Service Pathway</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{serviceObj?.name || client.serviceId}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Enrolled Package</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{getPackageDisplayName(client.packageId, dbPackages)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Phone Contact</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{client.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Nationality</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{client.nationality}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Language Preference</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{client.preferredLanguage}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Country of Residence</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{client.residence || 'Not Specified'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Number of Applicants</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{client.applicantsCount || 1}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Total Payment Paid</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  €{payments.filter(p => p.clientId === client.id && p.status === 'Paid').reduce((sum, p) => sum + p.amount - p.discount, 0).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right pane: Tabs contents */}
        <Box className="col-span-12 md:col-span-9" sx={{ display: 'flex', flexDirection: 'column' }}>
          <AppCard noPadding sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newTab) => setActiveTab(newTab)}
              sx={{ px: 3, pt: 1, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab value={0} label="Profile Summary" sx={{ fontWeight: 600 }} />
              <Tab value={1} label="Documents Upload" sx={{ fontWeight: 600 }} />
              <Tab value={2} label="Payments & Invoices" sx={{ fontWeight: 600 }} />
              <Tab value={3} label="Meetings / Consultations" sx={{ fontWeight: 600 }} />
              <Tab value={4} label="Zoom Recordings" sx={{ fontWeight: 600 }} />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* TAB 0: Profile */}
              {activeTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Case Notes & Profile Summary
                    </Typography>
                    <Typography variant="body2" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                      {client.profileSummary || 'No case brief uploaded.'}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Case Comments
                    </Typography>
                    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <TextField 
                          fullWidth 
                          placeholder="Write a comment... (e.g. Documents sent to lawyer)" 
                          size="small"
                          id="comment-input"
                        />
                        <Button 
                          variant="contained" 
                          color="secondary"
                          onClick={() => {
                            const input = document.getElementById('comment-input');
                            if (!input.value) return;
                            const newComment = {
                              text: input.value,
                              author: 'Staff',
                              date: new Date().toLocaleDateString(),
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                            const updatedComments = [...(client.comments || []), newComment];
                            // In real app, call mutation
                            client.comments = updatedComments; // mock local update
                            input.value = '';
                            showAlert('Comment added successfully!', 'success');
                          }}
                        >
                          Add Comment
                        </Button>
                      </Box>
                      <List disablePadding>
                        {(client.comments || []).map((c, idx) => (
                          <Paper key={idx} sx={{ p: 1.5, mb: 1.5, bgcolor: 'background.neutral', boxShadow: 'none' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{c.author}</Typography>
                              <Typography variant="caption" color="text.secondary">{c.date} at {c.time}</Typography>
                            </Box>
                            <Typography variant="body2">{c.text}</Typography>
                          </Paper>
                        ))}
                        {(!client.comments || client.comments.length === 0) && (
                          <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                        )}
                      </List>
                    </Paper>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Application History & Cycles
                    </Typography>
                    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
                      {client.applicationCycles && client.applicationCycles.length > 0 ? (
                        <List disablePadding>
                          {client.applicationCycles.map((cycle, index) => (
                            <Paper key={cycle.id || index} sx={{ p: 2, mb: 2, bgcolor: 'background.neutral', boxShadow: 'none', borderLeft: '4px solid', borderColor: 'secondary.main' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                  Cycle #{index + 1}: {cycle.serviceType.replace('_', ' ').toUpperCase()} ({cycle.status})
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Started: {new Date(cycle.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">Current Progression Status:</Typography>
                                <Chip label={cycle.status} color="primary" size="small" sx={{ fontWeight: 600 }} />
                              </Box>
                            </Paper>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No active visa processing cycles registered for this client.
                        </Typography>
                      )}
                    </Paper>
                  </Box>

                  {originalLead && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                        Original Lead History & Timeline
                      </Typography>
                      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
                        {originalLead.notes && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                              Lead Intake Notes
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.neutral', borderLeft: '3px solid', borderColor: 'secondary.main', whiteSpace: 'pre-line' }}>
                              {originalLead.notes}
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Intake Event Timeline
                        </Typography>
                        <Timeline items={originalLead.timeline || []} />
                      </Paper>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      Enrolled Package Benefits Checklist
                    </Typography>
                    <Box className="grid grid-cols-12 gap-2">
                      {packageObj?.includes.map((benefit, idx) => (
                        <Box className="col-span-12 sm:col-span-6" key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2">{benefit}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* TAB 1: Documents & Dropzone */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Upload Checklist Documents
                  </Typography>
                  <FileUploader
                    onUpload={handleDocUploaded}
                    clientId={client.id}
                    clientName={`${client.firstName} ${client.lastName}`}
                    isLoading={uploadDocMutation.isPending}
                  />

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Uploaded Documents List
                  </Typography>

                  {clientDocuments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No documents uploaded yet.
                    </Typography>
                  ) : (
                    <List disablePadding>
                      {clientDocuments.map((doc) => (
                        <Paper
                          key={doc.id}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center' }}
                        >
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {doc.fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Category: {doc.category} | Size: {doc.fileSize}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <StatusBadge status={doc.status} />
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => navigate('/documents/review')}
                            >
                              Review
                            </Button>
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {/* TAB 2: Payments & Invoices */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Invoices & Retainers
                  </Typography>

                    {clientPayments.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                        No invoices found.
                      </Typography>
                    ) : (
                      clientPayments.map((pay) => (
                        <Paper
                          key={pay.id}
                          sx={{
                            p: 2.5,
                            mb: 2,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2 }}
                        >
                          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 4, md: 6 }, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Box sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }} display="block">
                                Invoice ID
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B' }}>
                                {pay.invoiceNumber || pay.invoiceNo || `INV-2026-${(pay.id || '').replace(/-/g, '').slice(-6).toUpperCase()}`}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: 120 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }} display="block">
                                Due Date
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151' }}>
                                {(() => {
                                  if (!pay.dueDate) return 'N/A';
                                  try {
                                    const d = new Date(pay.dueDate);
                                    return isNaN(d.getTime()) ? String(pay.dueDate).split('T')[0] : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                  } catch (e) {
                                    return String(pay.dueDate).split('T')[0];
                                  }
                                })()}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: 90 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }} display="block">
                                Amount
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B' }}>
                                €{Number(pay.amount - (pay.discount || 0)).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <StatusBadge status={pay.status} />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/payments/invoice-details/${pay.id}`)}
                              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                            >
                              View details
                            </Button>
                          </Box>
                        </Paper>
                      ))
                    )}

                  {/* REFUND & GUARANTEE CLAIMS HISTORY CARD */}
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      🛡️ Refund & Guarantee Claims
                    </Typography>

                    {(() => {
                      const clientRefunds = refundRequests.filter(r => r.clientId === client.id);
                      if (clientRefunds.length === 0) {
                        return (
                          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.neutral' }}>
                            <Typography variant="body2" color="text.secondary">
                              No refund requests submitted for this client. (100% Refund Guarantee applies to eligible embassy visa refusal cases).
                            </Typography>
                          </Paper>
                        );
                      }
                      return clientRefunds.map((ref) => (
                        <Paper
                          key={ref.id}
                          sx={{
                            p: 2.5,
                            mb: 2,
                            border: '1px solid',
                            borderColor: ref.status === 'Processed' ? '#16A34A' : ref.status === 'Rejected' ? '#EF4444' : 'divider',
                            borderRadius: 3,
                            boxShadow: 'none',
                            bgcolor: ref.status === 'Processed' ? '#F0FDF4' : ref.status === 'Rejected' ? '#FEF2F2' : '#FAF6ED'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                Claim Ticket #{ref.id?.substring(0, 8)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Submitted On: {ref.createdAt ? dayjs(ref.createdAt).format('DD/MM/YYYY hh:mm A') : 'Recent'}
                              </Typography>
                            </Box>
                            <Chip
                              label={ref.status || 'Pending Review'}
                              color={ref.status === 'Processed' ? 'success' : ref.status === 'Rejected' ? 'error' : 'warning'}
                              size="small"
                              sx={{ fontWeight: 800 }}
                            />
                          </Box>

                          <Box className="grid grid-cols-12 gap-2" sx={{ my: 1, p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                            <Box className="col-span-6">
                              <Typography variant="caption" color="text.secondary" display="block">Category</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{ref.category}</Typography>
                            </Box>
                            <Box className="col-span-6">
                              <Typography variant="caption" color="text.secondary" display="block">Claim Amount</Typography>
                              <Typography variant="body2" color="error.main" sx={{ fontWeight: 800 }}>€{ref.amount?.toLocaleString()}</Typography>
                            </Box>
                            {ref.reason && (
                              <Box className="col-span-12" sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" display="block">Client Reason/Statement</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, fontStyle: 'italic' }}>{ref.reason}</Typography>
                              </Box>
                            )}
                            {ref.bankIban && (
                              <Box className="col-span-12" sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" display="block">Bank Payout Info</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  Name: {ref.bankAccountName || 'N/A'} | IBAN: <span style={{ fontFamily: 'monospace' }}>{maskIBAN(ref.bankIban)}</span>
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {ref.proofUrl && (
                            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                📄 Embassy Rejection Letter Proof Attached
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                href={ref.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<VisibilityIcon />}
                                sx={{ fontWeight: 700 }}
                              >
                                View Rejection Document PDF
                              </Button>
                            </Box>
                          )}
                        </Paper>
                      ));
                    })()}
                  </Box>
                </Box>
              )}

              {/* TAB 3: Consultations */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Session Log
                  </Typography>

                  {clientConsultations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No scheduled meetings linked.
                    </Typography>
                  ) : (
                    clientConsultations.map((cons) => (
                      <Paper
                        key={cons.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center' }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Eligibility Meeting Session
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Scheduled: {cons.meetingDate} at {cons.meetingTime} | Duration: {cons.durationMinutes} min
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <StatusBadge status={cons.status} />
                          <Button
                            size="small"
                            onClick={() => navigate(`/consultations/details/${cons.id}`)}
                          >
                            Outcome Details
                          </Button>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    Zoom Meeting Recordings
                  </Typography>
                  {consultationsWithRecordings.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No Zoom recordings available yet.
                    </Typography>
                  ) : (
                    consultationsWithRecordings.map((cons) => (
                      <Paper
                        key={cons.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: 'none' }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {cons.type === 'eligibility' ? 'Eligibility Assessment' : 'Consultation Meeting'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Date: {cons.date || cons.meetingDate} at {cons.timeSlot || cons.meetingTime}
                          </Typography>
                        </Box>
                        <Box>
                          {(cons.recordingUrl.includes('.mp4') || cons.recordingUrl.includes('.webm')) ? (
                            <video src={cons.recordingUrl} controls style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }} />
                          ) : (
                            <Button variant="contained" color="primary" href={cons.recordingUrl} target="_blank">
                              Watch Recording on Zoom
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}
            </Box>
          </AppCard>
        </Box>
      </Box>

      {/* MODAL: Update Statuses */}
      <AppModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Customer Registry Statuses"
        actions={
          <>
            <Button onClick={() => setStatusModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleStatusSubmit}
              variant="contained"
              color="secondary"
              disabled={updateStatusMutation.isPending}
            >
              Update
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="client-visa-status-select-label">Spain Visa Progression</InputLabel>
            <Select
              labelId="client-visa-status-select-label"
              value={selectedVisaStatus || ''}
              onChange={(e) => setSelectedVisaStatus(e.target.value)}
              label="Spain Visa Progression"
              MenuProps={{
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                PaperProps: { style: { maxHeight: 260 } }
              }}
              sx={{ borderRadius: 2 }}
            >
              {visaStatuses.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="client-billing-status-select-label">Billing Status</InputLabel>
            <Select
              labelId="client-billing-status-select-label"
              value={selectedBillingStatus || ''}
              onChange={(e) => setSelectedBillingStatus(e.target.value)}
              label="Billing Status"
              MenuProps={{
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                PaperProps: { style: { maxHeight: 260 } }
              }}
              sx={{ borderRadius: 2 }}
            >
              {billingStatuses.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="client-package-select-label">Assigned Client Package</InputLabel>
            <Select
              labelId="client-package-select-label"
              value={selectedPackageId || ''}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              label="Assigned Client Package"
              MenuProps={{
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                PaperProps: { style: { maxHeight: 280 } }
              }}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">
                <em>-- No Package Assigned --</em>
              </MenuItem>
              {dbPackages.map((pkg) => (
                <MenuItem key={pkg.id || pkg.code} value={pkg.id || pkg.code}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {pkg.name || pkg.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {pkg.price !== undefined && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          €{Number(pkg.price).toLocaleString()}
                        </Typography>
                      )}
                      {pkg.isRefundable ? (
                        <Chip size="small" label="100% Refundable" color="success" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
                      ) : (
                        <Chip size="small" label="Non-Refundable" color="default" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }} />
                      )}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </AppModal>
    </Box>
  );
};

export default ClientDetails;
