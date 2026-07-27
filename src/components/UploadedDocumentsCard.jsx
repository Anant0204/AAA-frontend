import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Chip from '@mui/material/Chip';
import AppCard from './AppCard';

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000';

export const UploadedDocumentsCard = ({ documents = [], title = "Uploaded Translation Documents" }) => {
  if (!documents || documents.length === 0) {
    return (
      <AppCard title={title}>
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          <InsertDriveFileIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
          <Typography variant="body2">No uploaded documents attached to this lead yet.</Typography>
        </Box>
      </AppCard>
    );
  }

  return (
    <AppCard title={`${title} (${documents.length})`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {documents.map((doc, idx) => {
          const docUrl = doc.url?.startsWith('http') ? doc.url : `${API_BASE}${doc.url}`;
          return (
            <Paper
              key={doc.id || idx}
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                <InsertDriveFileIcon color="primary" />
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                    {doc.name || `Document #${idx + 1}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={doc.category || 'General'}
                      size="small"
                      sx={{ fontSize: '10px', height: '20px', backgroundColor: '#e2e8f0' }}
                    />
                    {doc.size && (
                      <Typography variant="caption" color="text.secondary">
                        {doc.size}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  component="a"
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </Button>
                <Button
                  size="small"
                  variant="contained"
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
              </Box>
            </Paper>
          );
        })}
      </Box>
    </AppCard>
  );
};

export default UploadedDocumentsCard;
