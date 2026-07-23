import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';
import { useAuth } from '../hooks/useAuth';

// Icons
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ShieldAlertIcon from '@mui/icons-material/Shield';

export const AiSummaryModal = ({ open, onClose, clientData, isLead = false }) => {
  const { currentUser } = useAuth();
  const isClient = currentUser?.role === 'client';

  // Dynamic AI query execution on open
  const { data: aiRes, isLoading, error } = useQuery({
    queryKey: ['client-summary', clientData?.id],
    queryFn: () => dbService.summarizeClient(clientData.id),
    enabled: open && !!clientData?.id,
    staleTime: 60000, // 1 min cache
  });

  if (!clientData) return null;

  const aiData = aiRes?.data || {};

  // Color mappings
  const getPriorityColor = (p) => {
    const cleanP = (p || '').toLowerCase();
    if (cleanP.includes('high')) return 'error';
    if (cleanP.includes('medium')) return 'warning';
    return 'success';
  };

  const getTempColor = (t) => {
    const cleanT = (t || '').toLowerCase();
    if (cleanT.includes('hot')) return '#EF4444';
    if (cleanT.includes('warm')) return '#F59E0B';
    return '#3B82F6'; // Cold
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'background.neutral', py: 2 }}>
        <SmartToyIcon color="secondary" />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>AI Client Profile Analyzer</Typography>
          <Typography variant="caption" color="text.secondary">Automated Case Digest & Prediction Report</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 1 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <CircularProgress size={24} color="secondary" />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                AI is compiling client communication history and document checklists...
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={80} />
              </Grid>
            </Grid>
          </Box>
        ) : error ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="error" sx={{ fontWeight: 600 }}>
              Failed to load AI summary. Please ensure backend services are active.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Top Overview Cards */}
            <Grid item xs={12} md={isClient ? 6 : 4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justify: 'center', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Overall Progress</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, my: 1, color: 'secondary.main' }}>
                  {aiData.overallCaseProgress || 15}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={aiData.overallCaseProgress || 15} 
                  color="secondary" 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }} 
                />
                <Typography variant="caption" color="text.secondary">
                  Step: {clientData.visaStatus || clientData.status || 'Intake'}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={isClient ? 6 : 4}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justify: 'center', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Lead Temperature & Priority</Typography>
                <Box sx={{ my: 1.5, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Chip 
                    icon={<LocalFireDepartmentIcon sx={{ '&&': { color: '#fff' } }} />} 
                    label={aiData.leadTemperature || 'Warm Lead'} 
                    sx={{ bgcolor: getTempColor(aiData.leadTemperature), color: '#fff', fontWeight: 700 }} 
                  />
                  <Chip 
                    label={aiData.priorityLevel || 'Medium Priority'} 
                    color={getPriorityColor(aiData.priorityLevel)} 
                    sx={{ fontWeight: 700 }} 
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">Calculated from recent CRM activities.</Typography>
              </Paper>
            </Grid>

            {!isClient && (
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justify: 'center', border: '1px dashed', borderColor: 'error.main', bgcolor: '#FEF2F2', boxShadow: 'none' }}>
                  <Typography variant="caption" color="error" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justify: 'center', gap: 0.5 }}>
                    <ShieldAlertIcon sx={{ fontSize: '1rem' }} /> Success Probability
                  </Typography>
                  <Typography variant="h3" color="error.main" sx={{ fontWeight: 900, my: 0.5 }}>
                    {aiData.estimatedSuccessProbability || 85}%
                  </Typography>
                  <Typography variant="caption" color="error" sx={{ fontWeight: 700, opacity: 0.8 }}>
                    * INTERNAL USE ONLY - HIDDEN FROM CLIENT
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* AI In-depth Sections */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>🎯 Client Objective & Interest</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {aiData.clientObjective || 'Objective analysis pending.'}
                </Typography>
                <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 700, mt: 1 }}>
                  Recommended Package: {aiData.recommendedPackage || 'Option B (Full Processing)'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>⚠️ Missing Requirements & Potential Risks</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {aiData.missingRequirements && aiData.missingRequirements.length > 0 ? (
                    aiData.missingRequirements.map((req, idx) => (
                      <Typography key={idx} variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                        <WarningIcon sx={{ fontSize: '1rem' }} /> {req}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                      <CheckCircleIcon sx={{ fontSize: '1rem' }} /> All core profile items submitted.
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>⚖️ Eligibility Assessment Digest</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {aiData.eligibilityAssessment || 'No eligibility records generated.'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>💬 Communication Summary</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {aiData.communicationSummary || 'No recent interactions summarized.'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>📅 Last Activity & Status</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {aiData.lastActivity || 'No history tracked.'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>🚀 Next Recommended Action</Typography>
                <Typography variant="body2" sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 2, borderLeft: '3px solid', borderColor: 'secondary.main', fontWeight: 600 }}>
                  {aiData.nextRecommendedAction || 'Follow up with the client.'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
        <Button onClick={onClose} variant="contained" color="secondary">
          Close Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AiSummaryModal;
