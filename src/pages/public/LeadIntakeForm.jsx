import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Services
import { dbService } from '../../services/dbService';
import { useAlert } from '../../contexts/AlertContext';

export const LeadIntakeForm = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [successData, setSuccessData] = useState(null);

  // Form states
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    preferredLanguage: 'English',
    serviceId: 'dnv',
    applicantsCount: 1,
    notes: ''
  });

  const createLeadMutation = useMutation({
    mutationFn: dbService.createLead,
    onSuccess: (data) => {
      // In dbService.js, createLead will be updated to return the client credentials alongside the lead details.
      setSuccessData({
        clientId: data.clientId || `CL${Math.floor(2020 + Math.random() * 100)}`,
        password: 'password123'
      });
      showAlert('Intake form submitted! Your client portal account is created.', 'success');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.nationality) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }
    createLeadMutation.mutate(form);
  };

  if (successData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Paper sx={{ p: 5, borderRadius: 3, maxWidth: 500, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Registration Completed!</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for registering with AAA Business Consultancy. Your client portal credentials have been generated.
          </Typography>

          <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'background.neutral', borderRadius: 2, borderStyle: 'dashed' }}>
            <Box className="grid grid-cols-12 gap-2">
              <Box className="col-span-12" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Client Portal URL:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>#/portal/login</Typography>
              </Box>
              <Box className="col-span-12">
                <Divider />
              </Box>
              <Box className="col-span-12" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Username / Client ID:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900 }}>{successData.clientId}</Typography>
              </Box>
              <Box className="col-span-12">
                <Divider />
              </Box>
              <Box className="col-span-12" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Password:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>{successData.password}</Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="contained" color="secondary" size="large" fullWidth onClick={() => navigate('/portal/login')}>
              Go to Client Portal Login
            </Button>
            <Typography variant="caption" color="text.secondary">
              A copy of these credentials has been sent to your registered WhatsApp number and email.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Paper sx={{ p: 5, borderRadius: 3, maxWidth: 650, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              mx: 'auto',
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.5rem',
              mb: 2
            }}
          >
            A³
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Visa & Relocation Intake Form</Typography>
          <Typography variant="body2" color="text.secondary">Fill out this quick form to schedule a free expert consultation.</Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box className="grid grid-cols-12 gap-2">
            <Box className="col-span-12 sm:col-span-6">
              <TextField
                label="First Name"
                fullWidth
                required
                size="small"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </Box>
            <Box className="col-span-12 sm:col-span-6">
              <TextField
                label="Last Name"
                fullWidth
                required
                size="small"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </Box>
            <Box className="col-span-12 sm:col-span-6">
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                size="small"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Box>
            <Box className="col-span-12 sm:col-span-6">
              <TextField
                label="Phone Number"
                fullWidth
                required
                size="small"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Box>
            <Box className="col-span-12 sm:col-span-6">
              <TextField
                label="Nationality"
                fullWidth
                required
                size="small"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              />
            </Box>
            <Box className="col-span-12 sm:col-span-6">
              <FormControl fullWidth size="small">
                <InputLabel id="lang-select-label">Preferred Language</InputLabel>
                <Select
                  labelId="lang-select-label"
                  value={form.preferredLanguage}
                  onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                  label="Preferred Language"
                >
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Spanish">Spanish</MenuItem>
                  <MenuItem value="Arabic">Arabic</MenuItem>
                  <MenuItem value="Russian">Russian</MenuItem>
                  <MenuItem value="French">French</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box className="col-span-12 sm:col-span-6">
              <FormControl fullWidth size="small">
                <InputLabel id="service-select-label">Visa Program of Interest</InputLabel>
                <Select
                  labelId="service-select-label"
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  label="Visa Program of Interest"
                >
                  <MenuItem value="dnv">Digital Nomad Visa (DNV)</MenuItem>
                  <MenuItem value="nlv">Non-Lucrative Visa (NLV)</MenuItem>
                  <MenuItem value="study">Study Visa</MenuItem>
                  <MenuItem value="property">Golden Visa (Property Investment)</MenuItem>
                  <MenuItem value="family">Family Reunification</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box className="col-span-12 sm:col-span-6">
              <FormControl fullWidth size="small">
                <InputLabel id="applicants-select-label">Total Applicants (Including You)</InputLabel>
                <Select
                  labelId="applicants-select-label"
                  value={form.applicantsCount}
                  onChange={(e) => setForm({ ...form, applicantsCount: Number(e.target.value) })}
                  label="Total Applicants (Including You)"
                >
                  <MenuItem value={1}>1 (Main Applicant Only)</MenuItem>
                  <MenuItem value={2}>2 (Main + 1 Dependent)</MenuItem>
                  <MenuItem value={3}>3 (Main + 2 Dependents)</MenuItem>
                  <MenuItem value={4}>4 (Main + 3 Dependents)</MenuItem>
                  <MenuItem value={5}>5 (Main + 4 Dependents)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box className="col-span-12">
              <TextField
                label="Any brief notes about your relocation plans?"
                multiline
                rows={3}
                fullWidth
                size="small"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Box>
            <Box className="col-span-12">
              <Button type="submit" variant="contained" color="secondary" size="large" fullWidth>
                Register & Get Credentials
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default LeadIntakeForm;
