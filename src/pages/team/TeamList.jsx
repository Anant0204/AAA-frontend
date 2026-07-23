import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import IconButton from '@mui/material/IconButton';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// Services & Components
import PageHeader from '../../components/PageHeader';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../contexts/AlertContext';

export const TeamList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser, isAdmin } = useAuth();
  const { showAlert } = useAlert();

  // Dialog State
  const [openAddModal, setOpenAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('consultant');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [languages, setLanguages] = useState('');
  const [nationalities, setNationalities] = useState('');
  const [bio, setBio] = useState('');

  // Fetch Consultants dynamically
  const { data: consultants = [], isLoading } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants });

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });
  const { isViewOnlyMenu } = useAuth();
  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Agents');

  // Create Consultant Mutation
  const createConsultantMutation = useMutation({
    mutationFn: (consultantData) => dbService.createConsultant(consultantData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      showAlert('Consultant registered successfully!', 'success');
      setOpenAddModal(false);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('consultant');
      setAvatarBase64('');
      setLanguages('');
      setNationalities('');
      setBio('');
    },
    onError: () => {
      showAlert('Error registering consultant.', 'error');
    }
  });

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, newRole }) => dbService.updateConsultantRole(id, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      showAlert('Staff role updated successfully!', 'success');
    },
    onError: () => {
      showAlert('Error updating staff role.', 'error');
    }
  });

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Image must be less than 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || !languages.trim()) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }

    const langsArray = languages.split(',').map(l => l.trim()).filter(Boolean);
    const nationalitiesArray = nationalities.split(',').map(n => n.trim()).filter(Boolean);

    createConsultantMutation.mutate({
      name,
      email,
      password,
      phone,
      role,
      avatar: avatarBase64,
      languages: langsArray,
      nationalities: nationalitiesArray,
      bio });
  };

  const handleRoleChange = (id, newRole) => {
    updateRoleMutation.mutate({ id, newRole });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Staff & Roles Management"
        subtitle="Manage team members, performance metrics, and assign access roles."
        action={
          !isViewOnly && isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{ borderRadius: 2.5, fontWeight: 700 }}
            >
              Add New Staff
            </Button>
          )
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)' },
          gap: 3,
          pb: 1 }}
      >
        {consultants.map((c) => (
          <Paper
            key={c.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              '&:hover': {
                boxShadow: '0px 8px 24px -4px rgba(15, 23, 42, 0.12)',
                transform: 'translateY(-3px)' } }}
          >
            {/* Card Body */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: 3,
                flexGrow: 1,
                minWidth: 0,
                width: '100%',
                boxSizing: 'border-box' }}
            >
              <Avatar
                src={c.avatar}
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2, flexShrink: 0 }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' }}
              >
                {c.name}
              </Typography>

              {/* Email — truncated so it never overflows */}
              <Typography
                variant="body2"
                component="a"
                href={`mailto:${c.email}`}
                title={c.email}
                sx={{
                  mb: 2,
                  fontSize: '0.75rem',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  px: 1,
                  boxSizing: 'border-box',
                  color: 'secondary.main',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    textDecoration: 'underline' } }}
              >
                {c.email}
              </Typography>

              {/* Language chips — wrap instead of overflow */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 0.75,
                  mb: 1,
                  flexWrap: 'wrap',
                  width: '100%' }}
              >
                {c.languages.map((l) => (
                  <Chip
                    key={l}
                    label={l}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                ))}
              </Box>

              {/* Role Dropdown */}
              <Box sx={{ width: '100%', mt: 1, px: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={c.role || 'consultant'}
                    label="Role"
                    onChange={(e) => handleRoleChange(c.id, e.target.value)}
                    disabled={isViewOnly || !isAdmin || updateRoleMutation.isPending}
                    sx={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'left' }}
                  >
                    {customizationSettings?.rolesDefinition?.map(r => (
                      <MenuItem key={r.id} value={r.id} sx={{ fontSize: '0.8rem' }}>{r.label.split('(')[0].trim()}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider />

            {/* Stats row */}
            <Box sx={{ px: 2, py: 2, width: '100%', boxSizing: 'border-box' }}>
              <Box className="grid grid-cols-12 gap-1" sx={{ mb: 2 }}>
                <Box className="col-span-4">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                      Cases
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {c.casesCount}
                    </Typography>
                  </Box>
                </Box>
                <Box className="col-span-4">
                  <Box sx={{ textAlign: 'center', borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                      Conv. Rate
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {c.conversionRate}%
                    </Typography>
                  </Box>
                </Box>
                <Box className="col-span-4">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                      Revenue
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      €{c.revenueGenerated.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Button — always inside the card */}
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                size="small"
                onClick={() => navigate(`/team/profile/${c.id}`)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  py: 0.9,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' }}
              >
                View Performance Portfolio
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* DIALOG MODAL: Add New Consultant */}
      <Dialog
        open={openAddModal}
        onClose={handleCloseAddModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1,
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.4rem', pb: 1 }}>
          Register Team Member
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={avatarBase64} 
              sx={{ width: 100, height: 100, mb: 1, border: '2px dashed', borderColor: 'divider' }}
            />
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<PhotoCamera />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Upload Photo
              <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Max size 2MB. Leave blank for default.
            </Typography>
          </Box>

          <TextField
            label="Staff Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Corporate Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Account Password *"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            helperText="This password will be used by the staff to log into the CRM."
          />
          <FormControl fullWidth>
            <InputLabel>Access Role *</InputLabel>
            <Select
              value={role}
              label="Access Role *"
              onChange={(e) => setRole(e.target.value)}
            >
              {customizationSettings?.rolesDefinition?.map(r => (
                <MenuItem key={r.id} value={r.id}>{r.label.split('(')[0].trim()}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Contact Hotline Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Spoken Languages (comma-separated, e.g., English, Spanish, Arabic) *"
            placeholder="English, Spanish, Arabic"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Nationalities (comma-separated, e.g., British, Spanish)"
            placeholder="British, Spanish"
            value={nationalities}
            onChange={(e) => setNationalities(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Immigration Bio & Specialty Description"
            multiline
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleCloseAddModal} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="secondary"
            disabled={createConsultantMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            {createConsultantMutation.isPending ? 'Registering...' : 'Register Staff'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamList;
