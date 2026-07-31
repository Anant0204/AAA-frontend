import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import AppCard from './AppCard';
import AppModal from './AppModal';
import StatusBadge from './StatusBadge';

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000';

export const UploadedDocumentsCard = ({ 
  documents = [], 
  title = "Uploaded Documents & Verification", 
  onReviewDoc, 
  canReview = true 
}) => {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenReject = (doc) => {
    setSelectedDoc(doc);
    setRejectionReason('');
    setErrorMsg('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason || rejectionReason.trim() === '') {
      setErrorMsg('Mandatory: Rejection reason cannot be empty.');
      return;
    }
    if (onReviewDoc && selectedDoc) {
      await onReviewDoc(selectedDoc.id, {
        status: 'REJECTED',
        comment: rejectionReason.trim()
      });
      setRejectModalOpen(false);
      setSelectedDoc(null);
      setRejectionReason('');
    }
  };

  const handleVerify = async (doc) => {
    if (onReviewDoc) {
      await onReviewDoc(doc.id, {
        status: 'VERIFIED',
        comment: null
      });
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <AppCard title={title}>
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          <InsertDriveFileIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
          <Typography variant="body2">No uploaded documents attached to this case yet.</Typography>
        </Box>
      </AppCard>
    );
  }

  return (
    <AppCard title={`${title} (${documents.length})`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {documents.map((doc, idx) => {
          const docUrl = doc.url?.startsWith('http') ? doc.url : `${API_BASE}${doc.url}`;
          const isVerified = doc.status === 'VERIFIED';
          const isRejected = doc.status === 'REJECTED';

          return (
            <Paper
              key={doc.id || idx}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: isVerified ? '#f0fdf4' : isRejected ? '#fef2f2' : '#f8fafc',
                borderLeft: '4px solid',
                borderLeftColor: isVerified ? '#16a34a' : isRejected ? '#dc2626' : '#0284c7'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, overflow: 'hidden' }}>
                  <InsertDriveFileIcon color={isVerified ? 'success' : isRejected ? 'error' : 'primary'} sx={{ mt: 0.5 }} />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {doc.name || `Document #${idx + 1}`}
                      </Typography>
                      {doc.version && (
                        <Chip
                          label={`V${doc.version}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '10px', height: '18px', fontWeight: 700 }}
                        />
                      )}
                      <StatusBadge status={doc.status} size="small" />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={doc.category || 'General'}
                        size="small"
                        sx={{ fontSize: '10px', height: '20px', backgroundColor: '#e2e8f0' }}
                      />
                      {doc.belongsTo && (
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          Belongs to: {doc.belongsTo}
                        </Typography>
                      )}
                      {doc.size && (
                        <Typography variant="caption" color="text.secondary">
                          ({doc.size})
                        </Typography>
                      )}
                    </Box>

                    {doc.comment && (
                      <Typography variant="body2" sx={{ mt: 1, color: isRejected ? '#dc2626' : '#15803d', fontStyle: 'italic', fontSize: '0.78rem' }}>
                        Notes: {doc.comment}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    component="a"
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    component="a"
                    href={docUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </Button>

                  {canReview && onReviewDoc && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        disabled={isVerified}
                        onClick={() => handleVerify(doc)}
                      >
                        Verify
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        disabled={isRejected}
                        onClick={() => handleOpenReject(doc)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Mandatory Rejection Reason Modal */}
      <AppModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Document — Mandatory Reason Required"
        actions={
          <>
            <Button onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleConfirmReject}>
              Submit Rejection
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Document: <strong>{selectedDoc?.name}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Please enter a specific, detailed explanation for the rejection. The client will see this message in their portal to correct and re-upload the document.
          </Typography>
          <TextField
            label="Rejection Reason *"
            multiline
            rows={3}
            fullWidth
            required
            error={Boolean(errorMsg)}
            helperText={errorMsg || "Mandatory reason explaining why the document was rejected."}
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (e.target.value.trim()) setErrorMsg('');
            }}
          />
        </Box>
      </AppModal>
    </AppCard>
  );
};

export default UploadedDocumentsCard;
