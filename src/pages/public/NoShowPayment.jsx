import React, { useState } from 'react';
<<<<<<< HEAD
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

const NoShowPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const consultationId = searchParams.get('id') || '';
  const clientNameParam = searchParams.get('name') || '';
  const emailParam = searchParams.get('email') || '';
  const amountParam = searchParams.get('amount') || '50';

  const [clientName, setClientName] = useState(clientNameParam);
  const [email, setEmail] = useState(emailParam);
  const [amount, setAmount] = useState(amountParam);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayNoShowFee = async (e) => {
    e.preventDefault();
    if (!email || !clientName) {
      setErrorMessage('Please fill in your name and email.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      // Create Checkout session or update consultation status
      const res = await dbService.createCheckoutSession({
        packageId: 'no_show_fee',
        amount: Number(amount) || 50,
        clientName: clientName,
        paymentMethod: 'Credit Card'
      });

      if (res && res.url) {
        window.location.href = res.url;
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || 'Payment initiation failed. Please try again.');
=======
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://aaa-consultancy-backend-production.up.railway.app/api/v1';

const NoShowPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const clientId = query.get('clientId') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayNow = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_URL}/payment/no-show-checkout`, { clientId });
      if (res.data.success && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        setError('Failed to generate payment link. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing payment request.');
>>>>>>> 35f578d1325c63bef5e5c324ced25b5707563cdd
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #051A3B 0%, #0c2b5c 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '40px 30px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid #EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px'
          }}
        >
          💳
        </div>

        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, margin: 0 }}>
          Re-activation & Case Assessment Fee
        </h2>

        <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
          Your account requires a €250 (plus 5% VAT) Professional Case Assessment fee to unlock full portal access and reschedule your 1-to-1 consultation session.
        </p>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '13px', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handlePayNow}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
            marginTop: '10px'
          }}
        >
          {loading ? 'Initializing Stripe Payment...' : 'Proceed to Pay €262.50 (incl. VAT)'}
        </button>

        <button
          onClick={() => navigate('/portal/login')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '13px',
            cursor: 'pointer',
            marginTop: '6px'
          }}
        >
          ← Return to Portal Login
        </button>
      </div>
    </div>
>>>>>>> 35f578d1325c63bef5e5c324ced25b5707563cdd
  );
};

export default NoShowPayment;
