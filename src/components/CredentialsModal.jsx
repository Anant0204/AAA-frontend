import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAlert } from '../contexts/AlertContext';
import { dbService } from '../services/dbService';

export const CredentialsModal = ({ open, onClose, client, password }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [localPassword, setLocalPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    setLocalPassword(password || '');
  }, [password, open]);

  if (!client) return null;

  const portalUrl = `${window.location.origin}/#/portal/login`;
  const username = client.email || client.id;
  const clientName = `${client.firstName} ${client.lastName}`;

  const triggerCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleSavePassword = async () => {
    if (!localPassword || localPassword.length < 6) {
      showAlert('Password must be at least 6 characters long', 'error');
      return;
    }
    setSaving(true);
    try {
      await dbService.changeClientPassword(client.id, localPassword);
      showAlert('Portal credentials updated successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to update password:', error);
      showAlert('Failed to save portal credentials.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyAllText = `AAA Immigration Portal Credentials:
---------------------------------------------
Client Name: ${clientName}
Portal URL : ${portalUrl}
Username   : ${username}
Password   : ${localPassword}
---------------------------------------------
Please login and change your password immediately.`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1.5,
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AvatarContainer>
          <LockOutlinedIcon sx={{ color: '#E11D48' }} />
        </AvatarContainer>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Portal Access Credentials
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Generated for {clientName}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            borderRadius: 2.5, 
            bgcolor: '#FFFBEB', 
            border: '1px solid #FEF3C7',
            color: '#B45309',
            '& .MuiAlert-icon': { color: '#D97706' }
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Important Security Notice
          </Typography>
          This temporary password is shown <strong>only once</strong> for security reasons. Copy and share it with the client immediately. You will not be able to retrieve it in plain text again.
        </Alert>

        {/* Portal URL */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Portal Login Link
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={portalUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => triggerCopy(portalUrl, 'url')} size="small">
                    {copiedField === 'url' ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Username/ID */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Username / Client ID
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={username}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => triggerCopy(username, 'username')} size="small">
                    {copiedField === 'username' ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Password */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Temporary Password
          </Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            value={localPassword}
            onChange={(e) => setLocalPassword(e.target.value)}
            placeholder="Type a secure temporary password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} size="small" sx={{ mr: 0.5 }}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                  <IconButton onClick={() => triggerCopy(localPassword, 'password')} size="small">
                    {copiedField === 'password' ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          onClick={handleSavePassword}
          disabled={saving || !localPassword}
          sx={{ textTransform: 'none', fontWeight: 700, py: 1, borderRadius: 2 }}
        >
          {saving ? 'Saving...' : 'Save Credentials'}
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={copiedField === 'all' ? <CheckIcon /> : <ContentCopyIcon />}
          onClick={() => triggerCopy(copyAllText, 'all')}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700, 
            py: 1, 
            borderRadius: 2,
            background: copiedField === 'all' ? '#22C55E' : 'linear-gradient(135deg, #051A3B 0%, #1E3A8A 100%)',
            '&:hover': {
              background: copiedField === 'all' ? '#16A34A' : '#051A3B'
            }
          }}
        >
          {copiedField === 'all' ? 'Copied Full Invite!' : 'Copy All Credentials'}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 600, py: 1, borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Simple styled wrapper for icon
const AvatarContainer = ({ children }) => (
  <Box
    sx={{
      width: 40,
      height: 40,
      borderRadius: '20%',
      bgcolor: 'rgba(225, 29, 72, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </Box>
);

export default CredentialsModal;
