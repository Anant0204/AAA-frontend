import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';

// Icons
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import LockOpenIcon from '@mui/icons-material/LockOpen';

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import AppCard from '../../components/AppCard';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import { SERVICES } from '../../constants/mockData';

import { useAuth } from '../../hooks/useAuth';

export const SuperAdminConsultationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser } = useAuth();

  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const claimMutation = useMutation({
    mutationFn: () => dbService.assignConsultation(id, currentUser?.id || 'c1'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      showAlert('Consultation claimed successfully!', 'success');
    },
    onError: () => showAlert('Error claiming consultation.', 'error')
  });
  const [clientRequested, setClientRequested] = useState('dnv');
  const [aaaRecommended, setAaaRecommended] = useState('dnv');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [eligibilityStatus, setEligibilityStatus] = useState('Eligible');
  const [recommendedPackage, setRecommendedPackage] = useState('Option B');

  // Interactive Audio Player States (for legacy S3 playback)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); 
  const [volume, setVolume] = useState(80);
  const audioRef = useRef(null);

  // Sync isPlaying with audio element
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err.message);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sync volume with audio element
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e, newValue) => {
    setCurrentTime(newValue);
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getRecordingFilename = (url) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      return 'Assessment_Recording.mp4';
    }
  };

  // Fetch consultation details (poll every 5s if meeting is active to capture completion)
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations,
    refetchInterval: 5000 });

  // Fetch consultants dynamically
  const { data: consultants = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants
  });

  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages
  });

  const cons = consultations.find((c) => c.id === id);

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });
  const roleConfig = (customizationSettings?.[currentUser?.id] || customizationSettings?.[currentUser?.role]) || {};
  const consultationActions = roleConfig.actions?.consultations || { canCreate: true, canAssignAgent: true, canComplete: true };

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => dbService.updateConsultationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      showAlert('Consultation status updated', 'success');
    }
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, outcome, notes, recommendedService, recommendedPackageId }) => dbService.completeConsultation(id, outcome, notes, recommendedService, recommendedPackageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Consultation marked completed. Outcome recorded!', 'success');
      setCompleteModalOpen(false);
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cons) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Consultation not found</Typography>
        <Button startIcon={<KeyboardArrowLeftIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  const consultant = consultants.find((c) => c.id === cons.assignedConsultantId);

  const handleStatusChange = (status) => {
    updateStatusMutation.mutate({ id: cons.id, status });
  };

  const [followUpStatus, setFollowUpStatus] = useState('Completed');

  const handleCompleteSubmit = () => {
    if (cons?.type === 'follow_up' || cons?.clientId) {
      completeMutation.mutate({
        id: cons.id,
        status: followUpStatus || 'Completed',
        notes: outcomeNotes,
        internalNotes: outcomeNotes
      });
      setCompleteModalOpen(false);
    } else {
      const requestedObj = SERVICES.find((s) => s.id === clientRequested);
      const recommendedObj = SERVICES.find((s) => s.id === aaaRecommended);
      completeMutation.mutate({
        id: cons.id,
        outcome: {
          eligibility: eligibilityStatus,
          clientRequestedService: requestedObj ? requestedObj.name : 'Digital Nomad Visa (DNV)',
          aaaRecommendedService: recommendedObj ? recommendedObj.name : 'Digital Nomad Visa (DNV)'
        },
        notes: outcomeNotes,
        recommendedService: eligibilityStatus === 'Eligible' ? (recommendedObj ? recommendedObj.name : 'Digital Nomad Visa (DNV)') : null,
        recommendedPackageId: eligibilityStatus === 'Eligible' ? recommendedPackage : null
      });
      setCompleteModalOpen(false);
    }
  };

  return (
    <Box>
      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Calendar
      </Button>

      <PageHeader
        title={`Meeting / Consultation Session - ${cons.clientName}`}
        subtitle={`Session ID: ${cons.id}`}
        action={
          <Stack direction="row" spacing={1}>
            {(cons.status === 'No Show' || cons.status === 'no_show' || cons.status === 'No-Show') && (
              <Button
                variant="contained"
                color="success"
                startIcon={<LockOpenIcon />}
                onClick={() => handleStatusChange('Scheduled')}
                sx={{
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: 'white',
                  fontWeight: 700,
                  '&:hover': { opacity: 0.9 }
                }}
              >
                🔓 Unblock & Restore Lead
              </Button>
            )}
            {cons.status === 'Scheduled' && !cons.assignedConsultantId && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending}
                sx={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
                  color: 'white',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                Claim Consultation (Pick Up)
              </Button>
            )}
            {(cons.status === 'Scheduled' || cons.status === 'Unblocked') && cons.assignedConsultantId && (cons.assignedConsultantId === currentUser?.id || currentUser?.role === 'super_admin') && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setCompleteModalOpen(true)}
                >
                  {cons.type === 'follow_up' || cons.clientId ? 'Complete Follow-up' : 'Mark Complete'}
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => handleStatusChange('No Show')}
                >
                  Mark No Show
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<HighlightOffIcon sx={{ fontSize: '0.9rem' }} />}
                  onClick={() => handleStatusChange('Cancelled')}
                >
                  Cancel Meeting
                </Button>
              </>
            )}
          </Stack>
        }
      />

      <Box className="grid grid-cols-12 gap-3 items-start">
        {/* Left pane: Details */}
        <Box className="col-span-12 md:col-span-7 flex flex-col">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Session Info */}
            <AppCard title="Session Details" sx={{ height: 'auto' }}>
              <Box className="grid grid-cols-12 gap-2">
                <Box className="col-span-12 sm:col-span-6">
                  <Typography variant="caption" color="text.secondary">Client / Lead Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{cons.clientName}</Typography>
                </Box>
                <Box className="col-span-12 sm:col-span-6">
                  <Typography variant="caption" color="text.secondary">Meeting Link</Typography>
                  <Box>
                    {cons.status === 'Pending Acceptance' ? (
                      <Link
                        component="button"
                        underline="none"
                        onClick={() => showAlert('Please accept the meeting first to access the video link.', 'warning')}
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600, color: 'text.secondary', cursor: 'pointer' }}
                      >
                        <VideoCallIcon fontSize="small" /> Virtual Meeting
                      </Link>
                    ) : (
                      <Link
                        href={cons.meetingLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!cons.meetingLink) {
                            e.preventDefault();
                            showAlert('Meeting link has not been generated yet.', 'warning');
                          }
                        }}
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
                      >
                        <VideoCallIcon fontSize="small" /> Virtual Meeting
                      </Link>
                    )}
                  </Box>
                </Box>
                <Box className="col-span-12 sm:col-span-6">
                  <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {(cons.meetingDate || cons.date) ? `${dayjs(cons.meetingDate || cons.date).format('DD/MM/YYYY')} at ${cons.meetingTime || cons.timeSlot || ''}` : 'Pending Lead Submission'}
                  </Typography>
                </Box>
                <Box className="col-span-12 sm:col-span-6">
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{cons.durationMinutes} Minutes</Typography>
                </Box>
                <Box className="col-span-12 sm:col-span-6">
                  <Typography variant="caption" color="text.secondary">Meeting Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusBadge status={cons.status} />
                  </Box>
                </Box>
              </Box>
            </AppCard>

            {/* Recording Section */}
            {cons.recordingUrl && (
              <AppCard title="Zoom Meeting Recording & Playback" sx={{ height: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Cloud Audio/Video Recording File: {getRecordingFilename(cons.recordingUrl)}
                  </Typography>
                  
                  {/* Custom Audio Player UI */}
                  <Paper sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <audio
                      ref={audioRef}
                      src={cons.recordingUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleAudioEnded}
                      style={{ display: 'none' }}
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconButton
                        onClick={handlePlayPause}
                        color="primary"
                        sx={{ bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}
                      >
                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                      </IconButton>
                      
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', minWidth: 40 }}>
                          {formatTime(currentTime)}
                        </Typography>
                        <Slider
                          size="small"
                          value={currentTime}
                          max={duration || 100}
                          onChange={handleSliderChange}
                          sx={{ color: 'primary.main' }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', minWidth: 40 }}>
                          {formatTime(duration)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                        <VolumeUpIcon fontSize="small" color="action" />
                        <Slider
                          size="small"
                          value={volume}
                          onChange={(e, val) => setVolume(val)}
                          sx={{ width: 60, color: 'text.secondary' }}
                        />
                      </Box>
                    </Box>
                  </Paper>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      href={cons.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<VideoCallIcon />}
                      sx={{ fontWeight: 600 }}
                    >
                      Open Recording in New Tab
                    </Button>
                  </Box>
                </Box>
              </AppCard>
            )}

            {/* Outcome Display (If completed) */}
            {(cons.status === 'Completed' || cons.status === 'Meeting Completed' || cons.status === 'Assessment Completed') && (
              <AppCard title="Consultation Meeting Notes & Assessment Result" sx={{ height: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cons.outcome?.eligibility && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Assessment Outcome</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: cons.outcome.eligibility === 'Eligible' ? 'success.main' : 'error.main' }}>
                        {cons.outcome.eligibility}
                      </Typography>
                    </Box>
                  )}
                  {cons.outcome?.aaaRecommendedService && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">AAA Recommended Visa Pathway</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                        {cons.outcome.aaaRecommendedService}
                      </Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      Agent Notes & Recommendations
                    </Typography>
                    <Box
                      sx={{
                        whiteSpace: 'pre-wrap',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        p: 2,
                        borderRadius: 2,
                        mt: 0.5,
                        color: '#0F172A',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        fontWeight: 500
                      }}
                    >
                      {cons.notes || cons.internalNotes || cons.outcome?.notes || cons.outcome?.agentNotes || cons.lead?.notes || (
                        <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>
                          No recommendations or notes logged for this session.
                        </span>
                      )}
                    </Box>
                  </Box>
                </Box>
              </AppCard>
            )}
          </Box>
        </Box>

        {/* Right pane: Host profile */}
        <Box className="col-span-12 md:col-span-5 flex flex-col">
          <AppCard title="Assigned Spain Visa Expert" sx={{ height: 'auto' }}>
            {consultant ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 1, minWidth: 0, width: '100%' }}>
                <Avatar src={consultant.avatar} sx={{ width: 64, height: 64, mb: 1, flexShrink: 0 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{consultant.name}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  title={consultant.email}
                  sx={{
                    mb: 1,
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    px: 1,
                    boxSizing: 'border-box'
                  }}
                >
                  {consultant.email}
                </Typography>
                <Divider sx={{ width: '100%', my: 1.5 }} />
                <Box sx={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Language Proficiencies</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{(consultant.languages || []).join(', ')}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Immigration Nationalities Handled</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{(consultant.nationalities || []).join(', ')}</Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">No agent assigned to this session.</Typography>
            )}
          </AppCard>
        </Box>
      </Box>

      {/* MODAL: Complete Consultation Form */}
      <AppModal
        open={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title={cons?.type === 'follow_up' || cons?.clientId ? "Complete Follow-up Consultation" : "Log Meeting Assessment Outcome"}
        actions={
          <>
            <Button onClick={() => setCompleteModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSubmit}
              variant="contained"
              color="success"
              disabled={completeMutation.isPending}
            >
              {cons?.type === 'follow_up' || cons?.clientId ? "Save Follow-up Notes" : "Submit Outcome"}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {(cons?.type === 'follow_up' || cons?.clientId) ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Update session status and enter internal staff remarks/notes for this follow-up consultation.
              </Typography>

              <TextField
                select
                value={followUpStatus}
                onChange={(e) => setFollowUpStatus(e.target.value)}
                label="Follow-up Meeting Status *"
                fullWidth
                size="small"
              >
                <MenuItem value="Completed">Completed ✅</MenuItem>
                <MenuItem value="Cancelled">Cancelled ❌</MenuItem>
                <MenuItem value="No Show">No Show 🚫</MenuItem>
              </TextField>

              <TextField
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                label="Staff Follow-up Notes & Remarks"
                multiline
                rows={4}
                fullWidth
                placeholder="Enter details discussed during the follow-up meeting (e.g. document preparation status, visa appointment updates)."
              />
            </>
          ) : (
            <>
              <Typography variant="body2">
                Log the final results of the visa consultation. This updates the Lead qualification state and enables package invoice generation.
              </Typography>

              <TextField
                select
                value={eligibilityStatus}
                onChange={(e) => setEligibilityStatus(e.target.value)}
                label="Eligibility Status *"
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="Eligible">Eligible</MenuItem>
                <MenuItem value="Not Eligible">Not Eligible</MenuItem>
              </TextField>

              {eligibilityStatus === 'Eligible' && (
                <>
                  <TextField
                    select
                    value={clientRequested}
                    onChange={(e) => setClientRequested(e.target.value)}
                    label="Client Requested Service (Assessment Start)"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {SERVICES.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    value={aaaRecommended}
                    onChange={(e) => setAaaRecommended(e.target.value)}
                    label="Recommended Spain Visa Pathway"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {SERVICES.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    value={recommendedPackage}
                    onChange={(e) => setRecommendedPackage(e.target.value)}
                    label="Recommended Relocation Package *"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="OPTION_A">Option A: Professional Case Assessment (€250)</MenuItem>
                    <MenuItem value="OPTION_B">Option B: Full Processing Package (€3,500)</MenuItem>
                    <MenuItem value="OPTION_C">Option C: Administrative Relocation Package (€1,750)</MenuItem>
                    <MenuItem value="OPTION_D">Option D: Premium Package (€4,750)</MenuItem>
                    <MenuItem value="Tourist Visa">Schengen Tourist Visa (€500)</MenuItem>
                  </TextField>
                </>
              )}

              <TextField
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                label="Eligibility Notes & Relocation Recommendations"
                multiline
                rows={4}
                fullWidth
                required
                placeholder="Document client's passport status, income statements audited, and recommended translations checklist."
              />
            </>
          )}
        </Box>
      </AppModal>
    </Box>
  );
};

export default SuperAdminConsultationDetails;
