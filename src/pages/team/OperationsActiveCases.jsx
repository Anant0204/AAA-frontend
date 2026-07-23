import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';

// Services & Components
import PageHeader from '../../components/PageHeader';
import { dbService } from '../../services/dbService';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../hooks/useAuth';
import { SERVICES } from '../../constants/mockData';

export const OperationsActiveCases = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser, isAdmin, isOperations, isConsultant } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [visaFilter, setVisaFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  // Fetch collections
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents });

  const { data: allDocuments = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: dbService.getDocuments });

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });
  const { isViewOnlyMenu } = useAuth();
  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Active Cases');

  const updateClientMutation = useMutation({
    mutationFn: dbService.updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } });



  const clientsList = Array.isArray(clients) ? clients : [];
  const agentsList = Array.isArray(agents) ? agents : [];

  // Filter clients to display only paid/active customers
  const paidClients = clientsList.filter(
    (c) => c && (c.status === 'Active' || c.status === 'Processing' || c.visaStatus !== 'Not Started')
  );

  // Apply search, filter, and privacy criteria
  const filteredPaidClients = paidClients.filter((c) => {
    if (!c) return false;

    // Data Privacy: restrict visibility based on role
    if (!isAdmin) {
      if (isOperations) {
        // Operations can only see cases assigned to them
        if (c.assignedHandlerId !== currentUser?.id && c.assignedHandlerName !== currentUser?.name) return false;
      } else if (isConsultant) {
        // Consultants can only see cases assigned to them
        if (c.assignedConsultantId !== currentUser?.id && c.assignedConsultantName !== currentUser?.name) return false;
      }
    }

    const clientName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch =
      clientName.includes(searchText.toLowerCase()) ||
      (c.id && c.id.toLowerCase().includes(searchText.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (c.phone && c.phone.includes(searchText));

    const matchesVisa = visaFilter === 'all' || c.visaStatus === visaFilter;
    const matchesService = serviceFilter === 'all' || c.serviceId === serviceFilter;

    return matchesSearch && matchesVisa && matchesService;
  });

  // Operations & Admin handlers
  const handlers = agentsList.filter((a) => a && a.role === 'operations');
  // Consultant agents
  const consultants = agentsList.filter((a) => a && (a.role === 'consultant' || a.role === 'agent'));

  // Visa required checklists
  const REQUIRED_DOCUMENTS = {
    dnv: ['Passport (Copy)', 'Employment Verification Letter', 'Remote Income Bank Statements', 'Social Security Certificate'],
    nlv: ['Passport (Copy)', 'Spanish Health Insurance Policy', 'Clean Criminal Record Certificate', 'Savings Bank Statements'],
    study: ['Passport (Copy)', 'University Acceptance Letter', 'Sufficient Funds Statements', 'Medical Certificate'],
    family: ['Passport (Copy)', 'Marriage / Birth Certificates', 'Spanish Spouse ID', 'Financial Proof'],
    sworn_translation: ['Original Document (Clear Copy)'],
    property: ['Passport (Copy)', 'Spain Land Registry Certificate', 'Deed of Purchase', 'Bank Certificate'],
    default: ['Passport (Copy)', 'Application Form EX-01', 'Proof of Sufficient Funds'] };

  const handleAssignHandler = (client, handlerId) => {
    const matchedHandler = handlers.find((h) => h.id === handlerId);
    updateClientMutation.mutate({
      ...client,
      assignedHandlerId: handlerId,
      assignedHandlerName: matchedHandler ? matchedHandler.name : ''
    }, {
      onSuccess: () => {
        showAlert(`Case handler assigned to ${matchedHandler ? matchedHandler.name : 'Staff'}.`, 'success');
      }
    });
  };

  const handleAssignConsultant = (client, consultantId) => {
    const matchedConsultant = agentsList.find((a) => a.id === consultantId);
    updateClientMutation.mutate({
      ...client,
      assignedConsultantId: consultantId,
      assignedConsultantName: matchedConsultant ? matchedConsultant.name : ''
    }, {
      onSuccess: () => {
        showAlert(`Consultant assigned to ${matchedConsultant ? matchedConsultant.name : 'Agent'}.`, 'success');
      }
    });
  };

  const getMissingDocuments = (client) => {
    if (!client) return { uploaded: [], missing: [] };
    const serviceId = client.serviceId || 'default';
    const requiredList = REQUIRED_DOCUMENTS[serviceId] || REQUIRED_DOCUMENTS['default'];

    const docs = Array.isArray(allDocuments) ? allDocuments : [];
    const uploadedDocs = docs.filter((d) => d && d.clientId === client.id);
    const uploadedNames = uploadedDocs.map((d) => (d && d.name) ? d.name.toLowerCase() : '');

    const missing = [];
    requiredList.forEach((reqName) => {
      const hasDoc = uploadedNames.some((upName) =>
        upName.includes(reqName.toLowerCase()) ||
        reqName.toLowerCase().split(' ').every((word) => upName.includes(word.replace(/[()]/g, '')))
      );
      if (!hasDoc) missing.push(reqName);
    });

    return { uploaded: uploadedDocs, missing };
  };

  if (isClientsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Active Cases Dashboard"
        subtitle="Operations directory to monitor paid customers, inspect client documentation completeness, and delegate case files."
      />

      {paidClients.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3 }}>
          <Typography color="text.secondary">No paid customers currently assigned for operations processing.</Typography>
        </Paper>
      ) : (
        <Box className="grid grid-cols-12 gap-2">
          <Box className="col-span-12">
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Active Case Allocation & Processing (
                {filteredPaidClients.length === paidClients.length
                  ? paidClients.length
                  : `${filteredPaidClients.length} of ${paidClients.length}`}
                )
              </Typography>

              {/* Search and Filters Panel */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 3.5,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  p: 2.5,
                  bgcolor: '#FAFBFD',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider' }}
              >
                <TextField
                  placeholder="Search client name, ID, email or phone..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                  sx={{
                    flexGrow: 1,
                    minWidth: '260px',
                    bgcolor: '#FFFFFF',
                    '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ) }}
                />

                <FormControl size="small" sx={{ minWidth: '160px', bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <InputLabel>Visa Status</InputLabel>
                  <Select value={visaFilter} label="Visa Status" onChange={(e) => setVisaFilter(e.target.value)}>
                    <MenuItem value="all">All Visa Statuses</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="In Review">In Review</MenuItem>
                    <MenuItem value="Processing">Processing</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Not Started">Not Started</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: '200px', bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <InputLabel>Service Type</InputLabel>
                  <Select value={serviceFilter} label="Service Type" onChange={(e) => setServiceFilter(e.target.value)}>
                    <MenuItem value="all">All Services</MenuItem>
                    {SERVICES.map((srv) => (
                      <MenuItem key={srv.id} value={srv.id}>{srv.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {filteredPaidClients.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 3, bgcolor: '#FAFBFD' }}>
                  <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                    No matching cases found. Try adjusting your search query or filters.
                  </Typography>
                </Box>
              ) : (
                filteredPaidClients.map((client) => {
                  const serviceName = SERVICES.find((s) => s.id === client.serviceId)?.name || 'Immigration Services';
                  const { uploaded, missing } = getMissingDocuments(client);

                  // Handler (Operations/Admin)
                  const matchedHandler = agentsList.find((a) => a.id === client.assignedHandlerId);
                  const handlerRoleLabel = matchedHandler
                    ? (matchedHandler.role === 'admin' ? 'Admin' : 'Operations')
                    : null;

                  // Consultant/Agent
                  const matchedConsultant = agentsList.find((a) => a.id === client.assignedConsultantId);

                  return (
                    <Accordion
                      key={client.id}
                      sx={{
                        mb: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 'none',
                        borderRadius: '8px !important',
                        overflow: 'hidden',
                        '&:before': { display: 'none' } }}
                    >
                      {/* ── Accordion Header ── */}
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, pr: 2 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                              {client.firstName} {client.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Client ID: <strong>{client.id}</strong> &nbsp;|&nbsp; {client.email} &nbsp;|&nbsp; {client.phone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                            {matchedHandler && (
                              <Chip
                                icon={<PersonIcon sx={{ fontSize: '0.85rem !important' }} />}
                                label={`${matchedHandler.name} (${handlerRoleLabel})`}
                                size="small"
                                sx={{ fontWeight: 700, bgcolor: '#EDE9FE', color: '#5B21B6' }}
                              />
                            )}
                            {matchedConsultant && (
                              <Chip
                                icon={<PersonIcon sx={{ fontSize: '0.85rem !important' }} />}
                                label={`${matchedConsultant.name} (Agent)`}
                                size="small"
                                sx={{ fontWeight: 700, bgcolor: '#DBEAFE', color: '#1D4ED8' }}
                              />
                            )}
                            <Chip label={serviceName} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                            <Chip
                              label={client.visaStatus || 'Processing'}
                              size="small"
                              color={
                                client.visaStatus === 'Approved'
                                  ? 'success'
                                  : client.visaStatus === 'In Review'
                                  ? 'warning'
                                  : 'info'
                              }
                              sx={{ fontWeight: 800 }}
                            />
                            {missing.length > 0 && (
                              <Chip
                                icon={<ErrorIcon sx={{ fontSize: '0.85rem !important' }} />}
                                label={`${missing.length} Missing`}
                                size="small"
                                color="error"
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                            {missing.length === 0 && uploaded.length > 0 && (
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />}
                                label="Docs Complete"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </AccordionSummary>

                      {/* ── Accordion Body ── */}
                      <AccordionDetails sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#FAFBFD' }}>
                        <Box className="grid grid-cols-12 gap-2" sx={{ flexWrap: 'nowrap' }}>

                          {/* ── Column 1: Operations Handler ── */}
                          <Box className="col-span-4" sx={{ minWidth: 0 }}>
                            <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1, fontSize: '0.65rem', letterSpacing: 1 }}>
                                Operations Handler
                              </Typography>

                              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                                <InputLabel>Assign Case Handler</InputLabel>
                                <Select
                                  value={client.assignedHandlerId || ''}
                                  label="Assign Case Handler"
                                  disabled={isViewOnly}
                                  onChange={(e) => handleAssignHandler(client, e.target.value)}
                                >
                                  <MenuItem value=""><em>None Assigned</em></MenuItem>
                                  {handlers.map((h) => (
                                    <MenuItem key={h.id} value={h.id}>
                                      {h.name} ({h.role === 'admin' ? 'Admin' : 'Operations'})
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {matchedHandler ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#F5F3FF', borderRadius: 1.5, border: '1px solid #DDD6FE' }}>
                                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#7C3AED', fontSize: '0.75rem', fontWeight: 700 }}>
                                    {matchedHandler.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#5B21B6', display: 'block' }}>{matchedHandler.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                      {matchedHandler.role === 'admin' ? 'Admin' : 'Operations'} · {matchedHandler.casesCount || 0} cases
                                    </Typography>
                                  </Box>
                                </Box>
                              ) : (
                                <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">No handler assigned yet</Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>

                          {/* ── Column 2: Consultant / Agent ── */}
                          <Box className="col-span-4" sx={{ minWidth: 0 }}>
                            <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1, fontSize: '0.65rem', letterSpacing: 1 }}>
                                Agent / Consultant
                              </Typography>

                              {/* Removed manual assignment, automatically display consultant */}

                              {matchedConsultant ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#EFF6FF', borderRadius: 1.5, border: '1px solid #BFDBFE' }}>
                                  <Avatar
                                    src={matchedConsultant.avatar || ''}
                                    sx={{ width: 28, height: 28, bgcolor: '#1D4ED8', fontSize: '0.75rem', fontWeight: 700 }}
                                  >
                                    {matchedConsultant.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1D4ED8', display: 'block' }}>{matchedConsultant.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                      Agent · {matchedConsultant.casesCount || 0} cases
                                    </Typography>
                                  </Box>
                                </Box>
                              ) : (
                                <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">No consultant assigned yet</Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>

                          {/* ── Column 3: Document Completeness ── */}
                          <Box className="col-span-4" sx={{ minWidth: 0 }}>
                            <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1, fontSize: '0.65rem', letterSpacing: 1 }}>
                                Document Completeness
                              </Typography>

                              {/* Uploaded Files */}
                              {uploaded.length > 0 ? (
                                <Box sx={{ mb: 1.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 0.5, fontSize: '0.68rem' }}>
                                    Files Submitted ({uploaded.length})
                                  </Typography>
                                  <Stack spacing={0.8}>
                                    {uploaded.map((d) => {
                                      const isApproved = d.status === 'Approved';
                                      const isRejected = d.status === 'Rejected';
                                      const isPending = !isApproved && !isRejected;

                                      return (
                                        <Box
                                          key={d.id}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            py: 0.5,
                                            px: 1,
                                            bgcolor: '#FAFBFD',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 1.5
                                          }}
                                        >
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                                            <InsertDriveFileIcon sx={{ color: 'secondary.main', fontSize: '0.95rem', flexShrink: 0 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                                              {d.category || 'General'}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ flexShrink: 0, ml: 1 }}>
                                            {isApproved && (
                                              <Chip label="Approved" size="small" color="success" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 'bold' }} />
                                            )}
                                            {isRejected && (
                                              <Tooltip title={d.comment || "Rejected document"}>
                                                <Chip label="Rejected" size="small" color="error" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 'bold' }} />
                                              </Tooltip>
                                            )}
                                            {isPending && (
                                              <Chip label="Pending" size="small" color="warning" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 'bold' }} />
                                            )}
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </Stack>
                                </Box>
                              ) : (
                                <Box sx={{ mb: 1, p: 0.8, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>No files uploaded.</Typography>
                                </Box>
                              )}

                              {/* Missing Files Status */}
                              {missing.length === 0 ? (
                                <Box sx={{ p: 0.8, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 1.5, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: '0.85rem' }} />
                                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                                    All documents received
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ p: 0.8, bgcolor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 1.5 }}>
                                  <Typography variant="caption" color="error" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.65rem' }}>
                                    <ErrorIcon sx={{ fontSize: '0.85rem' }} /> {missing.length} Missing: {missing.join(', ')}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>

                        </Box>
                        
                        {/* ── Case Comments Section ── */}
                        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#FFFFFF', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1, fontSize: '0.65rem', letterSpacing: 1 }}>
                            Case Comments & Notes
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                            <TextField 
                              fullWidth 
                              placeholder="Write a comment... (e.g. Sent documents to legal)" 
                              size="small"
                              id={`comment-input-${client.id}`}
                              sx={{ 
                                '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.8 } }}
                            />
                            <Button 
                              variant="contained" 
                              color="secondary"
                              size="small"
                              disabled={isViewOnly}
                              sx={{ px: 3, fontWeight: 'bold', fontSize: '0.7rem' }}
                              onClick={() => {
                                const input = document.getElementById(`comment-input-${client.id}`);
                                if (!input.value) return;
                                const newComment = {
                                  text: input.value,
                                  author: currentUser ? currentUser.name : 'Staff',
                                  date: new Date().toLocaleDateString(),
                                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                };
                                const updatedComments = [...(client.comments || []), newComment];
                                updateClientMutation.mutate({ ...client, comments: updatedComments }, {
                                  onSuccess: () => {
                                    input.value = '';
                                    showAlert('Comment added successfully!', 'success');
                                  }
                                });
                              }}
                            >
                              Post
                            </Button>
                          </Box>
                          
                          <List disablePadding>
                            {(client.comments || []).map((c, idx) => (
                              <Paper key={idx} sx={{ p: 1.2, mb: 1, bgcolor: '#F8FAFC', boxShadow: 'none', border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.7rem', color: 'primary.main' }}>{c.author}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{c.date} at {c.time}</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{c.text}</Typography>
                              </Paper>
                            ))}
                            {(!client.comments || client.comments.length === 0) && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 1 }}>No comments yet.</Typography>
                            )}
                          </List>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OperationsActiveCases;
