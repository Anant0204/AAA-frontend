import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StorageIcon from '@mui/icons-material/Storage';
import BackupIcon from '@mui/icons-material/Backup';
import LinearProgress from '@mui/material/LinearProgress';

// Components
import PageHeader from '../../components/PageHeader';
import { useAlert } from '../../contexts/AlertContext';

export const SuperAdminStorageBackup = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [backingUp, setBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const { data: backupLogs = [], isLoading } = useQuery({
    queryKey: ['backup-logs'],
    queryFn: dbService.getBackupLogs
  });

  const triggerBackupMutation = useMutation({
    mutationFn: dbService.triggerAWSBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-logs'] });
    }
  });

  const handleStartAWSBackup = () => {
    setBackingUp(true);
    setBackupProgress(10);
    showAlert('Contacting AWS S3 Server...', 'info');

    // Simulate backup progress
    const timer = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setBackingUp(false);
          
          // Trigger mock log entries for backup
          const randomId = Math.floor(Math.random() * 900) + 100;
          triggerBackupMutation.mutate({
            name: `backup_archive_q2_2026_v${randomId}.tar.gz`,
            size: `${(Math.random() * 20 + 5).toFixed(1)} MB`,
            category: 'Secure Backup Storage'
          });

          showAlert('Database secure backup uploaded to AWS S3 bucket successfully!', 'success');
          return 0;
        }
        return prev + 30;
      });
    }, 600);
  };

  const getStorageMetrics = () => {
    // Return count of documents per storage type
    const metrics = {
      invoices: backupLogs.filter(b => b.category === 'Invoice Storage' || b.name.includes('INV')).length,
      receipts: backupLogs.filter(b => b.category === 'Receipt Storage' || b.name.includes('receipt')).length,
      financials: backupLogs.filter(b => b.category === 'Financial Document Storage').length,
      backups: backupLogs.filter(b => b.category === 'Secure Backup Storage').length };
    return metrics;
  };

  const metrics = getStorageMetrics();

  return (
    <Box>
      <PageHeader
        title="AWS Secure Storage & Backups"
        subtitle="Manage cloud document backups, view AWS S3 repository statistics, and audit secure receipts archiving."
      />

      <Box className="grid grid-cols-12 gap-2">
        {/* Storage Types Summary */}
        <Box className="col-span-12 sm:col-span-6 md:col-span-3">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            <StorageIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                INVOICE STORAGE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {metrics.invoices || 12} files
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Box className="col-span-12 sm:col-span-6 md:col-span-3">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudUploadIcon color="secondary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                RECEIPT STORAGE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {metrics.receipts || 8} files
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Box className="col-span-12 sm:col-span-6 md:col-span-3">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            <StorageIcon color="warning" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                FINANCIAL DOCS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {metrics.financials || 4} files
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Box className="col-span-12 sm:col-span-6 md:col-span-3">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            <BackupIcon color="success" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                AWS BACKUPS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {metrics.backups || 3} Archives
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* AWS Trigger Action Panel */}
        <Box className="col-span-12">
          <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', textAlign: 'center' }}>
            <BackupIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Secure AWS S3 Automated Ledger Backup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Compile current client accounts, billing records, transaction logs, and receipts, and upload encrypted archives to secure AWS bucket infrastructure.
            </Typography>

            {backingUp ? (
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                  Uploading Encrypted Ledger: {backupProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={backupProgress} color="primary" sx={{ height: 8, borderRadius: 2 }} />
              </Box>
            ) : (
              <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={handleStartAWSBackup}>
                Initiate Secure Backup
              </Button>
            )}
          </Paper>
        </Box>

        {/* Cloud Audit Logs */}
        <Box className="col-span-12">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              AWS S3 Backup Registry & Audit Trail
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Audit status, file sizes, and date uploads to cloud servers.
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Backup ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Archive Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>File Size</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Storage Class Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>AWS Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backupLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{log.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{log.name}</TableCell>
                      <TableCell>{log.size}</TableCell>
                      <TableCell>
                        <Chip label={log.category} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={log.status} color="success" size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SuperAdminStorageBackup;
