import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAlert } from '../../contexts/AlertContext';
import { dbService } from '../../services/dbService';
import spainSevillePlaza from '../../assets/spain_seville_plaza.png';

export const ClientPortalChangePassword = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const clientData = JSON.parse(localStorage.getItem('clientData'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showAlert('Please enter both fields.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      if (!clientData || !clientData.id) {
        throw new Error('No client session found. Please log in again.');
      }
      await dbService.changeClientPassword(clientData.id, password);
      showAlert('Password updated successfully!', 'success');
      
      // Update local storage to reflect the change
      const updatedClientData = { ...clientData, isTemporaryPassword: false };
      localStorage.setItem('clientData', JSON.stringify(updatedClientData));

      // Redirect to dashboard
      navigate(`/portal/documents/${clientData.id}`);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Failed to update password.', 'error');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {/* Background Image */}
      <Box
        component="img"
        src={spainSevillePlaza}
        alt="Spain background"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Dark navy gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(5,26,59,0.94) 0%, rgba(5,26,59,0.78) 50%, rgba(197,155,39,0.22) 100%)',
          zIndex: 1,
        }}
      />

      {/* Decorative gold orbs */}
      <Box sx={{
        position: 'absolute', top: '10%', right: '8%',
        width: 220, height: 220,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(197,155,39,0.18) 0%, transparent 70%)',
        zIndex: 1, filter: 'blur(10px)'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '15%', left: '6%',
        width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(197,155,39,0.12) 0%, transparent 70%)',
        zIndex: 1, filter: 'blur(16px)'
      }} />

      {/* Glassmorphism card */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 2,
          p: { xs: 4, sm: 5.5 },
          borderRadius: 4,
          maxWidth: 420,
          width: '100%',
          mx: 2,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              mx: 'auto',
              borderRadius: 2,
              background: 'linear-gradient(135deg, #051A3B 0%, #C59B27 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.5rem',
              mb: 2,
              boxShadow: '0 4px 16px rgba(197,155,39,0.35)',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            A³
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', mb: 0.5 }}
          >
            Change Password
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}
          >
            For your security, please update your temporary password to continue.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  color: 'white',
                  background: 'rgba(255,255,255,0.07)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(197,155,39,0.6)' },
                  '&.Mui-focused fieldset': { borderColor: '#C59B27' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.55)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#C59B27' },
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  color: 'white',
                  background: 'rgba(255,255,255,0.07)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(197,155,39,0.6)' },
                  '&.Mui-focused fieldset': { borderColor: '#C59B27' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.55)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#C59B27' },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 0.5,
                py: 1.5,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: 'Outfit, sans-serif',
                background: 'linear-gradient(135deg, #C59B27 0%, #E8B93A 100%)',
                color: '#051A3B',
                boxShadow: '0 4px 20px rgba(197,155,39,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B8902A 0%, #C59B27 100%)',
                  boxShadow: '0 6px 24px rgba(197,155,39,0.55)',
                },
              }}
            >
              Update Password
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ClientPortalChangePassword;


