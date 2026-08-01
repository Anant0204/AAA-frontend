import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LockIcon from '@mui/icons-material/Lock';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { dbService } from '../../services/dbService';

const API_URL = import.meta.env.VITE_API_URL || 'https://aaa-consultancy-backend-production.up.railway.app/api/v1';

const NoShowPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const leadIdParam = searchParams.get('leadId') || searchParams.get('id') || searchParams.get('clientId') || '';
  const clientNameParam = searchParams.get('name') || '';
  const emailParam = searchParams.get('email') || '';
  const amountParam = searchParams.get('amount') || '250';

  const [clientName, setClientName] = useState(clientNameParam);
  const [email, setEmail] = useState(emailParam);
  const [amount, setAmount] = useState(amountParam);
  const [loading, setLoading] = useState(false);
  const [fetchingLead, setFetchingLead] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (leadIdParam && (!clientName || !email)) {
      setFetchingLead(true);
      axios.get(`${API_URL}/leads/${leadIdParam}/public-details`)
        .then((res) => {
          if (res.data) {
            if (res.data.firstName || res.data.lastName) {
              setClientName(`${res.data.firstName || ''} ${res.data.lastName || ''}`.trim());
            }
            if (res.data.email) {
              setEmail(res.data.email);
            }
          }
        })
        .catch((err) => console.warn('[NoShowPayment] Lead prefill fetch notice:', err.message))
        .finally(() => setFetchingLead(false));
    }
  }, [leadIdParam]);

  const handlePayNoShowFee = async (e) => {
    e.preventDefault();
    if (!email || !clientName) {
      setErrorMessage('Please fill in your name and email.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const res = await dbService.createCheckoutSession({
        packageId: 'no_show_fee',
        amount: Number(amount) || 250,
        clientName: clientName,
        email: email,
        paymentMethod: 'Credit Card',
        clientId: leadIdParam,
        leadId: leadIdParam
      });

      if (res && res.url) {
        window.location.href = res.url;
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #051A3B 0%, #0c2b5c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <Paper
        elevation={10}
        sx={{
          maxWidth: 520,
          width: '100%',
          p: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(197, 155, 39, 0.3)',
          textAlign: 'center'
        }}
      >
        {/* Brand Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'rgba(5, 26, 59, 0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#051A3B',
              mb: 1.5
            }}
          >
            <EventBusyIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#051A3B' }}>
            AAA Business Consultancy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
            Reschedule Fee Authorization & Clearance
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {success ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
              Fee Paid Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Your consultation appointment slot has been un-locked. Your Case Officer will reach out shortly.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ bgcolor: '#051A3B', color: '#E5C058', fontWeight: 700, px: 4, py: 1.25, borderRadius: 2.5 }}
            >
              Return to Homepage
            </Button>
          </Box>
        ) : (
          <form onSubmit={handlePayNoShowFee}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'left', lineHeight: 1.6 }}>
              To reschedule your missed consultation slot, please complete the fee authorization below:
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                {errorMessage}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
              <TextField
                label="Full Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Fee Amount (€)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, fontWeight: 700 }}>€</Typography>
                }}
              />
            </Box>

            <Paper sx={{ p: 2, mb: 3, bgcolor: '#FAF6ED', border: '1px solid rgba(197, 155, 39, 0.3)', borderRadius: 2, textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                SUMMARY:
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B' }}>
                Reschedule & Clearance Fee: €{amount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Includes priority calendar re-booking slot.
              </Typography>
            </Paper>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
              fullWidth
              sx={{
                bgcolor: '#051A3B',
                color: '#E5C058',
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(5, 26, 59, 0.25)',
                '&:hover': {
                  bgcolor: '#0A2540'
                }
              }}
            >
              {loading ? 'Processing...' : `Authorize Secure Checkout (€${amount})`}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default NoShowPayment;
