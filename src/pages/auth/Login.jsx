import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../contexts/AlertContext';

// Icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FaceIcon from '@mui/icons-material/Face';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SecurityIcon from '@mui/icons-material/Security';
import WorkIcon from '@mui/icons-material/Work';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GavelIcon from '@mui/icons-material/Gavel';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

const schema = yup.object().shape({
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required') });

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showAlert } = useAlert();

  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
    const paymentStatus = queryParams.get('payment');
    const paymentId = queryParams.get('id');

    if (paymentStatus === 'success' && paymentId) {
      const verifyPayment = async () => {
        try {
          await dbService.verifyCheckoutSession(null, paymentId);
          showAlert('Payment successfully processed & verified! Please log in to your portal.', 'success');
          const cleanUrl = window.location.hash.split('?')[0];
          navigate(cleanUrl, { replace: true });
        } catch (err) {
          console.error('Payment verification failed:', err);
          showAlert('Verification failed, but your payment was processed. Please log in or contact support.', 'warning');
        }
      };
      verifyPayment();
    }
  }, [navigate, showAlert]);

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const dynamicRoles = customizationSettings?.rolesDefinition || [
    { id: 'admin', label: 'Admin', icon: 'SupervisorAccountIcon' },
    { id: 'operations', label: 'Operations', icon: 'SettingsSuggestIcon' },
    { id: 'finance', label: 'Finance', icon: 'AccountBalanceWalletIcon' },
    { id: 'consultant', label: 'Consultant', icon: 'SupportAgentIcon' },
    { id: 'marketing', label: 'Marketing', icon: 'CampaignIcon' }
  ];

  const getRoleIcon = (role) => {
    const iconName = role.icon || {
      'admin': 'SupervisorAccountIcon',
      'operations': 'SettingsSuggestIcon',
      'finance': 'AccountBalanceWalletIcon',
      'consultant': 'SupportAgentIcon',
      'marketing': 'CampaignIcon'
    }[role.id] || 'SupportAgentIcon';

    switch (iconName) {
      case 'SupervisorAccountIcon': return <SupervisorAccountIcon />;
      case 'SettingsSuggestIcon': return <SettingsSuggestIcon />;
      case 'AccountBalanceWalletIcon': return <AccountBalanceWalletIcon />;
      case 'CampaignIcon': return <CampaignIcon />;
      case 'FaceIcon': return <FaceIcon />;
      case 'GroupIcon': return <GroupIcon />;
      case 'StarIcon': return <StarIcon />;
      case 'VerifiedUserIcon': return <VerifiedUserIcon />;
      case 'EmojiEventsIcon': return <EmojiEventsIcon />;
      case 'AssignmentIndIcon': return <AssignmentIndIcon />;
      case 'SecurityIcon': return <SecurityIcon />;
      case 'WorkIcon': return <WorkIcon />;
      case 'BusinessCenterIcon': return <BusinessCenterIcon />;
      case 'GavelIcon': return <GavelIcon />;
      case 'AssuredWorkloadIcon': return <AssuredWorkloadIcon />;
      case 'RecordVoiceOverIcon': return <RecordVoiceOverIcon />;
      case 'LocalPoliceIcon': return <LocalPoliceIcon />;
      case 'SupportAgentIcon':
      default:
        return <SupportAgentIcon />;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '' } });

  const onSubmit = async (data) => {
    try {
      const res = await dbService.authLogin(data.email.toLowerCase().trim(), data.password);
      login(res.user, res.token);
      showAlert(`Logged in successfully as ${res.user.role}`, 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      showAlert(error.response?.data?.message || 'Invalid login credentials. Please check email/password.', 'error');
    }
  };

  const handleQuickLogin = async (role) => {
    let email = 'admin@aaaconsultancy.com';
    if (role === 'super_admin') email = 'superadmin@aaaconsultancy.com';
    else if (role === 'marketing') email = 'marketing@aaaconsultancy.com';
    else if (role === 'consultant') email = 'agent@aaaconsultancy.com';
    else if (role === 'finance') email = 'finance@aaaconsultancy.com';
    else if (role === 'operations') email = 'operations@aaaconsultancy.com';

    try {
      const res = await dbService.authLogin(email, 'password123');
      if (res && res.token) {
        login(res.user, res.token);
        showAlert(`Logged in successfully as ${res.user.role}`, 'success');
        navigate('/dashboard');
        return;
      }
      // Backend responded but no token — unexpected
      showAlert('Login failed: unexpected server response.', 'error');
    } catch (err) {
      console.error('Quick login failed:', err);
      const msg = err?.response?.data?.message || 'Cannot connect to server. Please ensure the backend is running.';
      showAlert(msg, 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          component={RouterLink}
          to="/"
          variant="text"
          color="secondary"
          size="small"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Back to Homepage
        </Button>
      </Box>
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your credentials to access the CRM portal.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <TextField
            {...register('email')}
            label="Email Address"
            variant="outlined"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            {...register('password')}
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2" color="secondary" underline="hover">
              Forgot password?
            </Link>
          </Box>

          <Button type="submit" variant="contained" color="secondary" size="large" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
        </Box>
      </form>


      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Are you a client looking for your portal?
        </Typography>
        <Button 
          component={RouterLink} 
          to="/portal/login" 
          variant="text" 
          color="primary"
          sx={{ fontWeight: 'bold' }}
        >
          Go to Client Portal Login
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
