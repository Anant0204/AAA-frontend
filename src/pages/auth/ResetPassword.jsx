import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAlert } from '../../contexts/AlertContext';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    showAlert('Password reset successful! You can now log in with your new password.', 'success');
    navigate('/login');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your new password below.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="New Password"
            variant="outlined"
            type="password"
            fullWidth
            required
          />

          <TextField
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Confirm New Password"
            variant="outlined"
            type="password"
            fullWidth
            required
          />

          <Button type="submit" variant="contained" color="secondary" size="large" fullWidth disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, underline: 'none', '&:hover': { color: 'primary.main' } }}
            >
              <ArrowBackIcon fontSize="inherit" />
              Back to Login
            </Link>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default ResetPassword;
