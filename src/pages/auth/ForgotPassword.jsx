import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAlert } from '../../contexts/AlertContext';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showAlert('Please enter your email address.', 'warning');
      return;
    }
    setLoading(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    showAlert('Password reset request has been sent to info@aaabusinessconsultancy.com. Management will review your request and send your new credentials shortly.', 'success');
    navigate('/login');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your corporate email address to request management to reset your password.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email Address"
            variant="outlined"
            type="email"
            fullWidth
            required
          />

          <Button type="submit" variant="contained" color="secondary" size="large" fullWidth disabled={loading}>
            {loading ? 'Submitting Request...' : 'Send Request'}
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

export default ForgotPassword;
