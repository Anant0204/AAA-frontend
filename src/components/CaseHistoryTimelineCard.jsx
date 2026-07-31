import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import AppCard from './AppCard';
import AppModal from './AppModal';
import StatusBadge from './StatusBadge';
import HistoryIcon from '@mui/icons-material/History';
import GavelIcon from '@mui/icons-material/Gavel';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChecklistIcon from '@mui/icons-material/Checklist';
import dayjs from 'dayjs';

export const CaseHistoryTimelineCard = ({
  cycles = [],
  client,
  onRefresh,
  onCreateCycle,
  onUpdateCycle,
  onOpenChecklistModal,
  onResubmitCycle,
  onRecordGovernmentDecision
}) => {
  const [resubmissionModalOpen, setResubmissionModalOpen] = useState(false);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [fileResubmissionModalOpen, setFileResubmissionModalOpen] = useState(false);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  // New Resubmission Cycle state
  const [refusalReason, setRefusalReason] = useState('');
  const [refusalDate, setRefusalDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [originalSubmissionDate, setOriginalSubmissionDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [changesMade, setChangesMade] = useState('');

  // File Resubmission Package state
  const [resubmissionDate, setResubmissionDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [submissionReference, setSubmissionReference] = useState('');
  const [resubmissionChanges, setResubmissionChanges] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionReceiptUrl, setSubmissionReceiptUrl] = useState('');

  // Appeal state
  const [lawyerAssigned, setLawyerAssigned] = useState('');
  const [appealSubmissionDate, setAppealSubmissionDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [appealDeadline, setAppealDeadline] = useState(dayjs().add(30, 'day').format('YYYY-MM-DD'));

  // Government Decision state
  const [governmentDecision, setGovernmentDecision] = useState('Approved');
  const [governmentDecisionDate, setGovernmentDecisionDate] = useState(dayjs().format('YYYY-MM-DD'));

  const handleResubmissionSubmit = async () => {
    if (onCreateCycle) {
      await onCreateCycle({
        clientId: client.id,
        type: 'resubmission',
        originalSubmissionDate,
        refusalReason,
        refusalDate,
        changesMade,
        serviceType: client.serviceType || 'Visa Resubmission'
      });
      setResubmissionModalOpen(false);
      setRefusalReason('');
      setChangesMade('');
    }
  };

  const handleAppealSubmit = async () => {
    if (onCreateCycle) {
      await onCreateCycle({
        clientId: client.id,
        type: 'appeal',
        lawyerAssigned,
        appealSubmissionDate,
        appealDeadline,
        serviceType: client.serviceType || 'Legal Appeal'
      });
      setAppealModalOpen(false);
      setLawyerAssigned('');
    }
  };

  const handleOpenFileResubmission = (cycle) => {
    setSelectedCycle(cycle);
    setResubmissionDate(dayjs().format('YYYY-MM-DD'));
    setSubmissionReference(`REF-SUB-${Math.floor(100000 + Math.random() * 900000)}`);
    setResubmissionChanges(cycle.changesMade || '');
    setSubmissionNotes('');
    setSubmissionReceiptUrl('');
    setFileResubmissionModalOpen(true);
  };

  const handleConfirmFileResubmission = async () => {
    if (onResubmitCycle && selectedCycle) {
      await onResubmitCycle(selectedCycle.id, {
        resubmissionDate,
        submissionReference,
        changesMade: resubmissionChanges,
        submissionNotes,
        submissionReceiptUrl
      });
      setFileResubmissionModalOpen(false);
      setSelectedCycle(null);
    }
  };

  const handleOpenDecisionModal = (cycle) => {
    setSelectedCycle(cycle);
    setGovernmentDecision('Approved');
    setGovernmentDecisionDate(dayjs().format('YYYY-MM-DD'));
    setDecisionModalOpen(true);
  };

  const handleConfirmGovernmentDecision = async () => {
    if (onRecordGovernmentDecision && selectedCycle) {
      await onRecordGovernmentDecision(selectedCycle.id, {
        governmentDecision,
        governmentDecisionDate
      });
      setDecisionModalOpen(false);
      setSelectedCycle(null);
    }
  };

  return (
    <AppCard
      title="Case History & Application Journey"
      action={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => setResubmissionModalOpen(true)}
          >
            Initiate Resubmission Cycle
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<GavelIcon />}
            onClick={() => setAppealModalOpen(true)}
          >
            Initiate Legal Appeal
          </Button>
        </Box>
      }
    >
      {cycles.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          <HistoryIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
          <Typography variant="body2">No previous application cycles recorded. Case is on initial application cycle.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cycles.map((cycle, index) => {
            const appNum = cycles.length - index;
            const isReadyForResubmission = cycle.status === 'Ready for Resubmission';
            const isResubmitted = cycle.status === 'Resubmitted';

            return (
              <Paper
                key={cycle.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  backgroundColor: index === 0 ? '#f0f9ff' : '#f8fafc',
                  borderLeft: '5px solid',
                  borderLeftColor: cycle.type === 'appeal' ? '#9333ea' : '#0284c7'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Application #{appNum} — {cycle.type === 'appeal' ? 'Legal Appeal' : 'Resubmission Cycle'}
                    </Typography>
                    <Chip
                      label={cycle.type?.toUpperCase() || 'RESUBMISSION'}
                      size="small"
                      color={cycle.type === 'appeal' ? 'secondary' : 'primary'}
                      sx={{ fontSize: '10px', height: '20px', fontWeight: 700 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <StatusBadge status={cycle.status} size="small" />

                    {onOpenChecklistModal && cycle.type !== 'appeal' && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ChecklistIcon />}
                        onClick={() => onOpenChecklistModal(cycle)}
                      >
                        Checklist ({cycle.checklistItems?.length || 0})
                      </Button>
                    )}

                    {isReadyForResubmission && onResubmitCycle && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<SendIcon />}
                        onClick={() => handleOpenFileResubmission(cycle)}
                      >
                        File Resubmission
                      </Button>
                    )}

                    {isResubmitted && onRecordGovernmentDecision && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<VerifiedIcon />}
                        onClick={() => handleOpenDecisionModal(cycle)}
                      >
                        Record Decision
                      </Button>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, fontSize: '0.85rem' }}>
                  {cycle.originalSubmissionDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Original Submission Date:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{dayjs(cycle.originalSubmissionDate).format('DD/MM/YYYY')}</Typography>
                    </Box>
                  )}
                  {cycle.refusalDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Refusal Date:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#dc2626' }}>{dayjs(cycle.refusalDate).format('DD/MM/YYYY')}</Typography>
                    </Box>
                  )}
                  {cycle.refusalReason && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Refusal Reason:</Typography>
                      <Typography variant="body2">{cycle.refusalReason}</Typography>
                    </Box>
                  )}
                  {cycle.changesMade && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Changes Made for Resubmission:</Typography>
                      <Typography variant="body2">{cycle.changesMade}</Typography>
                    </Box>
                  )}

                  {/* Resubmission Filed Details */}
                  {cycle.resubmissionDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Resubmission Filing Date:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0284c7' }}>{dayjs(cycle.resubmissionDate).format('DD/MM/YYYY')}</Typography>
                    </Box>
                  )}
                  {cycle.submissionReference && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Submission Reference:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{cycle.submissionReference}</Typography>
                    </Box>
                  )}
                  {cycle.submissionNotes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Submission Notes:</Typography>
                      <Typography variant="body2">{cycle.submissionNotes}</Typography>
                    </Box>
                  )}
                  {cycle.submissionReceiptUrl && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Filing Receipt:</Typography>
                      <Typography variant="body2">
                        <Link href={cycle.submissionReceiptUrl} target="_blank" rel="noopener">View Receipt</Link>
                      </Typography>
                    </Box>
                  )}

                  {/* Appeal Fields */}
                  {cycle.lawyerAssigned && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Lawyer Assigned:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{cycle.lawyerAssigned}</Typography>
                    </Box>
                  )}
                  {cycle.appealDeadline && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Appeal Legal Deadline:</Typography>
                      <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>{dayjs(cycle.appealDeadline).format('DD/MM/YYYY')}</Typography>
                    </Box>
                  )}

                  {/* Final Government Decision Recording */}
                  {cycle.governmentDecision && (
                    <Box sx={{ p: 1.5, bgcolor: cycle.governmentDecision === 'Approved' ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', border: '1px solid', borderColor: cycle.governmentDecision === 'Approved' ? '#bbf7d0' : '#fecaca' }}>
                      <Typography variant="caption" color="text.secondary">Final Government Decision:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: cycle.governmentDecision === 'Approved' ? '#16a34a' : '#dc2626' }}>
                        {cycle.governmentDecision} ({cycle.governmentDecisionDate ? dayjs(cycle.governmentDecisionDate).format('DD/MM/YYYY') : 'Date recorded'})
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Modal 1: Initiate Resubmission Cycle */}
      <AppModal
        open={resubmissionModalOpen}
        onClose={() => setResubmissionModalOpen(false)}
        title="Initiate Resubmission Cycle"
        actions={
          <>
            <Button onClick={() => setResubmissionModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleResubmissionSubmit}>
              Generate Resubmission Checklist
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Record refusal details to auto-generate a structured document checklist for the client under <b>Same Client ID ({client?.clientCode || client?.id})</b>.
          </Typography>
          <TextField
            label="Original Submission Date"
            type="date"
            fullWidth
            value={originalSubmissionDate}
            onChange={(e) => setOriginalSubmissionDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Official Refusal Notice Date"
            type="date"
            fullWidth
            value={refusalDate}
            onChange={(e) => setRefusalDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Reason for Refusal *"
            multiline
            rows={3}
            fullWidth
            required
            placeholder="Official refusal reason stated in embassy notice..."
            value={refusalReason}
            onChange={(e) => setRefusalReason(e.target.value)}
          />
          <TextField
            label="Planned Changes / Improvements for Resubmission"
            multiline
            rows={3}
            fullWidth
            placeholder="e.g. Updated tax filings, additional passive income proof, apostilled certificates..."
            value={changesMade}
            onChange={(e) => setChangesMade(e.target.value)}
          />
        </Box>
      </AppModal>

      {/* Modal 2: File Resubmission Package */}
      <AppModal
        open={fileResubmissionModalOpen}
        onClose={() => setFileResubmissionModalOpen(false)}
        title="Record Official Resubmission Filing"
        actions={
          <>
            <Button onClick={() => setFileResubmissionModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="success" onClick={handleConfirmFileResubmission}>
              Confirm & Transition to Resubmitted
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Record official filing details after submitting the completed resubmission package to the embassy or ministry.
          </Typography>
          <TextField
            label="Resubmission Filing Date"
            type="date"
            fullWidth
            value={resubmissionDate}
            onChange={(e) => setResubmissionDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Embassy / Official Submission Reference *"
            fullWidth
            required
            value={submissionReference}
            onChange={(e) => setSubmissionReference(e.target.value)}
          />
          <TextField
            label="Final Summary of Changes Made"
            multiline
            rows={2}
            fullWidth
            value={resubmissionChanges}
            onChange={(e) => setResubmissionChanges(e.target.value)}
          />
          <TextField
            label="Submission Notes"
            multiline
            rows={2}
            fullWidth
            placeholder="Additional notes regarding appointment or filing channel..."
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
          />
          <TextField
            label="Submission Receipt URL (Optional)"
            fullWidth
            placeholder="https://..."
            value={submissionReceiptUrl}
            onChange={(e) => setSubmissionReceiptUrl(e.target.value)}
          />
        </Box>
      </AppModal>

      {/* Modal 3: Record Government Decision */}
      <AppModal
        open={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title="Record Final Government Decision"
        actions={
          <>
            <Button onClick={() => setDecisionModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleConfirmGovernmentDecision}>
              Record Decision
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Record official decision from embassy or government authority. This updates <strong>Client.visaStatus</strong> to <em>Visa Approved</em> or <em>Visa Refused</em> and preserves complete Case History.
          </Typography>
          <TextField
            select
            label="Government Decision *"
            fullWidth
            value={governmentDecision}
            onChange={(e) => setGovernmentDecision(e.target.value)}
          >
            <MenuItem value="Approved">Approved (Visa Granted)</MenuItem>
            <MenuItem value="Refused">Refused (Visa Rejected)</MenuItem>
          </TextField>
          <TextField
            label="Decision Date"
            type="date"
            fullWidth
            value={governmentDecisionDate}
            onChange={(e) => setGovernmentDecisionDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </AppModal>

      {/* Modal 4: Initiate Legal Appeal */}
      <AppModal
        open={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        title="Initiate Legal Appeal"
        actions={
          <>
            <Button onClick={() => setAppealModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" onClick={handleAppealSubmit}>
              File Legal Appeal
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Assign lawyer and record statutory appeal deadline under <b>Same Client ID ({client?.clientCode || client?.id})</b>.
          </Typography>
          <TextField
            label="Assigned Lawyer / Specialist *"
            fullWidth
            required
            placeholder="e.g. Maria Perez (Spanish Abogado)"
            value={lawyerAssigned}
            onChange={(e) => setLawyerAssigned(e.target.value)}
          />
          <TextField
            label="Appeal Filing Date"
            type="date"
            fullWidth
            value={appealSubmissionDate}
            onChange={(e) => setAppealSubmissionDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Appeal Legal Deadline *"
            type="date"
            fullWidth
            required
            value={appealDeadline}
            onChange={(e) => setAppealDeadline(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </AppModal>
    </AppCard>
  );
};

export default CaseHistoryTimelineCard;
