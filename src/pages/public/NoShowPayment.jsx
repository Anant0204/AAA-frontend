import React, { useState } from 'react';
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
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default NoShowPayment;
