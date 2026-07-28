import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AppCard from './AppCard';
import AppModal from './AppModal';
import StatusBadge from './StatusBadge';
import HistoryIcon from '@mui/icons-material/History';
import GavelIcon from '@mui/icons-material/Gavel';
import RefreshIcon from '@mui/icons-material/Refresh';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import dayjs from 'dayjs';

export const CaseHistoryTimelineCard = ({
  cycles = [],
  client,
  onRefresh,
  onCreateCycle,
  onUpdateCycle
}) => {
  const [resubmissionModalOpen, setResubmissionModalOpen] = useState(false);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  // Resubmission state
  const [refusalReason, setRefusalReason] = useState('');
  const [refusalDate, setRefusalDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [changesMade, setChangesMade] = useState('');

  // Appeal state
  const [lawyerAssigned, setLawyerAssigned] = useState('');
  const [appealSubmissionDate, setAppealSubmissionDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [appealDeadline, setAppealDeadline] = useState(dayjs().add(30, 'day').format('YYYY-MM-DD'));

  // Refund state
  const [refundStatus, setRefundStatus] = useState('Refund Eligible');
  const [refundReason, setRefundReason] = useState('');

  const handleResubmissionSubmit = async () => {
    if (onCreateCycle) {
      await onCreateCycle({
        clientId: client.id,
        type: 'resubmission',
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

  const handleRefundSubmit = async () => {
    if (onUpdateCycle && cycles.length > 0) {
      const latestCycle = cycles[0];
      await onUpdateCycle(latestCycle.id, {
        refundStatus,
        refundReason
      });
      setRefundModalOpen(false);
    }
  };

  return (
    <AppCard
      title="Case History & Resubmission/Appeal Journey"
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => setResubmissionModalOpen(true)}
          >
            Option 1: Resubmission
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<GavelIcon />}
            onClick={() => setAppealModalOpen(true)}
          >
            Option 2: Legal Appeal
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<MonetizationOnIcon />}
            onClick={() => setRefundModalOpen(true)}
          >
            Refund Policy
          </Button>
        </Box>
      }
    >
      {/* Cycles Timeline Display */}
      {cycles.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          <HistoryIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
          <Typography variant="body2">Application Cycle #1 is currently active.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cycles.map((cycle, index) => {
            const appNum = cycles.length - index;
            return (
              <Paper
                key={cycle.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  backgroundColor: index === 0 ? '#f0f9ff' : '#f8fafc',
                  borderLeft: '4px solid',
                  borderLeftColor: cycle.type === 'appeal' ? '#9333ea' : '#0284c7'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Application #{appNum} — {cycle.type === 'appeal' ? 'Legal Appeal' : 'Resubmission'}
                    </Typography>
                    <Chip
                      label={cycle.type?.toUpperCase() || 'RESUBMISSION'}
                      size="small"
                      color={cycle.type === 'appeal' ? 'secondary' : 'primary'}
                      sx={{ fontSize: '10px', height: '20px' }}
                    />
                  </Box>
                  <StatusBadge status={cycle.status} size="small" />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1.5, fontSize: '0.85rem' }}>
                  {cycle.refusalDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Refusal Date:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{dayjs(cycle.refusalDate).format('DD/MM/YYYY')}</Typography>
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
                      <Typography variant="caption" color="text.secondary">Changes Made:</Typography>
                      <Typography variant="body2">{cycle.changesMade}</Typography>
                    </Box>
                  )}
                  {cycle.lawyerAssigned && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Lawyer Assigned:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{cycle.lawyerAssigned}</Typography>
                    </Box>
                  )}
                  {cycle.appealDeadline && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Appeal Deadline:</Typography>
                      <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>{dayjs(cycle.appealDeadline).format('DD/MM/YYYY')}</Typography>
                    </Box>
                  )}
                  {cycle.governmentDecision && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Government Decision:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: cycle.governmentDecision === 'Approved' ? '#16a34a' : '#dc2626' }}>
                        {cycle.governmentDecision}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Modal: Resubmission */}
      <AppModal
        open={resubmissionModalOpen}
        onClose={() => setResubmissionModalOpen(false)}
        title="Initiate Option 1: Visa Resubmission"
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
            Record refusal details and auto-generate a fresh document checklist for the client portal under the <b>same Client ID ({client?.clientCode || 'CID-12001'})</b>.
          </Typography>
          <TextField
            label="Refusal Date"
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
            placeholder="Document official reason provided by Spanish Embassy/Ministry..."
            value={refusalReason}
            onChange={(e) => setRefusalReason(e.target.value)}
          />
          <TextField
            label="Changes Required Before Resubmission"
            multiline
            rows={3}
            fullWidth
            placeholder="e.g. Updated tax filings, additional proof of passive income, new apostilled police clearance..."
            value={changesMade}
            onChange={(e) => setChangesMade(e.target.value)}
          />
        </Box>
      </AppModal>

      {/* Modal: Legal Appeal */}
      <AppModal
        open={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        title="Initiate Option 2: Legal Appeal"
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
            Assign lawyer and record court/ministry appeal deadlines under the <b>same Client ID ({client?.clientCode || 'CID-12001'})</b>.
          </Typography>
          <TextField
            label="Assigned Lawyer / Legal Specialist *"
            fullWidth
            required
            placeholder="e.g. Maria Perez (Spanish Abogado)"
            value={lawyerAssigned}
            onChange={(e) => setLawyerAssigned(e.target.value)}
          />
          <TextField
            label="Appeal Submission Date"
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

      {/* Modal: Refund Policy */}
      <AppModal
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Update Refund Policy Status"
        actions={
          <>
            <Button onClick={() => setRefundModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="warning" onClick={handleRefundSubmit}>
              Update Refund Status
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Refund Status"
            fullWidth
            value={refundStatus}
            onChange={(e) => setRefundStatus(e.target.value)}
          >
            <MenuItem value="Refund Eligible">Refund Eligible</MenuItem>
            <MenuItem value="Refund Under Review">Refund Under Review</MenuItem>
            <MenuItem value="Refund Approved">Refund Approved</MenuItem>
            <MenuItem value="Refund Completed">Refund Completed</MenuItem>
            <MenuItem value="Refund Rejected">Refund Rejected</MenuItem>
          </TextField>
          <TextField
            label="Refund Reason / Notes"
            multiline
            rows={3}
            fullWidth
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
        </Box>
      </AppModal>
    </AppCard>
  );
};

export default CaseHistoryTimelineCard;
