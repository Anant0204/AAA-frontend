import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../services/dbService';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/dialogtitle';
import DialogContent from '@mui/dialogcontent';
import DialogActions from '@mui/dialogactions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import GavelIcon from '@mui/icons-material/Gavel';
import dayjs from 'dayjs';

export const RefusalActionModal = ({ open, onClose, client, onSuccessAlert }) => {
  const queryClient = useQueryClient();
  const [option, setOption] = useState('resubmission'); // 'resubmission' | 'appeal'

  // Resubmission Fields
  const [refusalDate, setRefusalDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [refusalReason, setRefusalReason] = useState('');
  const [changesMade, setChangesMade] = useState('');

  // Appeal Fields
  const [lawyerAssigned, setLawyerAssigned] = useState('Senior Immigration Lawyer');
  const [appealSubmissionDate, setAppealSubmissionDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [appealDeadline, setAppealDeadline] = useState(dayjs().add(30, 'day').format('YYYY-MM-DD'));
  const [appealNotes, setAppealNotes] = useState('');

  const submitCycleMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        clientId: client.id,
        type: option,
        serviceType: client.serviceType || client.packageName || 'Spanish Visa Package',
        refusalDate,
        refusalReason,
        ...(option === 'resubmission' ? {
          originalSubmissionDate: client.createdAt,
          changesMade
        } : {
          lawyerAssigned,
          appealSubmissionDate,
          appealDeadline,
          appealDocuments: appealNotes ? { notes: appealNotes } : null
        })
      };

      return await dbService.createApplicationCycle(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['activeCases'] });
      queryClient.invalidateQueries({ queryKey: ['closedCases'] });
      queryClient.invalidateQueries({ queryKey: ['caseTimeline'] });

      if (onSuccessAlert) {
        onSuccessAlert(
          option === 'resubmission'
            ? 'Resubmission workflow initiated! Updated checklist generated.'
            : 'Legal Appeal initiated! Lawyer assigned & deadline set.',
          'success'
        );
      }
      onClose();
    }
  });

  if (!client) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        ⚠️ Visa Refusal Resolution — Select Action Path
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Client <strong>{client.firstName} {client.lastName}</strong>'s visa application has been marked as Refused. Select the legal action path below:
        </Typography>

        <RadioGroup value={option} onChange={(e) => setOption(e.target.value)}>
          <Box className="grid grid-cols-12 gap-3" sx={{ mb: 3 }}>
            {/* Option 1 Card: Resubmission */}
            <Paper
              elevation={0}
              onClick={() => setOption('resubmission')}
              sx={{
                p: 2.5,
                border: '2px solid',
                borderColor: option === 'resubmission' ? 'primary.main' : 'divider',
                borderRadius: 3,
                bgcolor: option === 'resubmission' ? 'rgba(37, 99, 235, 0.04)' : 'background.paper',
                cursor: 'pointer'
              }}
              className="col-span-12 md:col-span-6"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Radio value="resubmission" checked={option === 'resubmission'} />
                <RefreshIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Option 1: Resubmission
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 4, fontSize: '0.825rem' }}>
                Client agrees to submit a new corrected application. Automatically resets document checklist for updated proofs.
              </Typography>
            </Paper>

            {/* Option 2 Card: Appeal */}
            <Paper
              elevation={0}
              onClick={() => setOption('appeal')}
              sx={{
                p: 2.5,
                border: '2px solid',
                borderColor: option === 'appeal' ? 'secondary.main' : 'divider',
                borderRadius: 3,
                bgcolor: option === 'appeal' ? 'rgba(124, 58, 237, 0.04)' : 'background.paper',
                cursor: 'pointer'
              }}
              className="col-span-12 md:col-span-6"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Radio value="appeal" checked={option === 'appeal'} />
                <GavelIcon color="secondary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Option 2: Legal Appeal
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 4, fontSize: '0.825rem' }}>
                Lawyer files formal legal appeal with Spanish authorities. Sets 30-day legal deadline & tracks court decision.
              </Typography>
            </Paper>
          </Box>
        </RadioGroup>

        {/* Inputs for Resubmission */}
        {option === 'resubmission' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Resubmission Details</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Refusal Date"
                type="date"
                size="small"
                fullWidth
                value={refusalDate}
                onChange={(e) => setRefusalDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Original Submission Date"
                type="date"
                size="small"
                fullWidth
                value={dayjs(client.createdAt).format('YYYY-MM-DD')}
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Reason for Refusal (from Consulate Notice)"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              placeholder="e.g. Bank statement was older than 30 days..."
            />
            <TextField
              label="Changes Made / Required Updated Documents"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={changesMade}
              onChange={(e) => setChangesMade(e.target.value)}
              placeholder="e.g. Requesting fresh 90-day bank balance certificate with bank stamp..."
            />
          </Box>
        )}

        {/* Inputs for Appeal */}
        {option === 'appeal' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Legal Appeal Details</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Lawyer Assigned"
                size="small"
                fullWidth
                value={lawyerAssigned}
                onChange={(e) => setLawyerAssigned(e.target.value)}
              />
              <TextField
                label="Appeal Submission Date"
                type="date"
                size="small"
                fullWidth
                value={appealSubmissionDate}
                onChange={(e) => setAppealSubmissionDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Legal Appeal Deadline (30-Day Limit)"
              type="date"
              size="small"
              fullWidth
              value={appealDeadline}
              onChange={(e) => setAppealDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Legal Brief / Appeal Notes"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={appealNotes}
              onChange={(e) => setAppealNotes(e.target.value)}
              placeholder="e.g. Legal argument on Article 14 of Immigration Decree..."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          color={option === 'resubmission' ? 'primary' : 'secondary'}
          onClick={() => submitCycleMutation.mutate()}
          disabled={submitCycleMutation.isLoading}
          startIcon={submitCycleMutation.isLoading ? <CircularProgress size={18} /> : null}
        >
          {option === 'resubmission' ? 'Confirm Resubmission Workflow' : 'Confirm Legal Appeal Workflow'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefusalActionModal;
