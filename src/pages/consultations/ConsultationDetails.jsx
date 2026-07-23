import React, { useState, useEffect, useRef } from 'react';
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

// Services & Components
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import AppCard from '../../components/AppCard';
import AppModal from '../../components/AppModal';
import { useAlert } from '../../contexts/AlertContext';
import { SERVICES } from '../../constants/mockData';

export const ConsultationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser } = useAuth();

  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const claimMutation = useMutation({
    mutationFn: () => dbService.assignConsultation(cons.id, currentUser?.id || 'c1'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      showAlert('Consultation claimed successfully!', 'success');
    },
    onError: () => showAlert('Error claiming consultation.', 'error')
  });
  const [clientRequested, setClientRequested] = useState('dnv');
  const [aaaRecommended, setAaaRecommended] = useState('dnv');
  const [outcomeNotes, setOutcomeNotes] = useState('');

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

  const cons = consultations.find((c) => c.id === id);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => dbService.updateConsultationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      showAlert('Consultation status updated', 'success');
    }
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, outcome, notes }) => dbService.completeConsultation(id, outcome, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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

  const handleCompleteSubmit = () => {
    const requestedObj = SERVICES.find((s) => s.id === clientRequested);
    const recommendedObj = SERVICES.find((s) => s.id === aaaRecommended);
    completeMutation.mutate({
      id: cons.id,
      outcome: {
        clientRequestedService: requestedObj ? requestedObj.name : 'Digital Nomad Visa (DNV)',
        aaaRecommendedService: recommendedObj ? recommendedObj.name : 'Digital Nomad Visa (DNV)'
      },
      notes: outcomeNotes
    });
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
          cons.status === 'Scheduled' && (
            <Stack direction="row" spacing={1}>
              {!cons.assignedConsultantId ? (
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
              ) : (
                (cons.assignedConsultantId === currentUser?.id || currentUser?.role === 'admin' || currentUser?.role === 'operations') && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => setCompleteModalOpen(true)}
                    >
                      Mark Complete
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
                      startIcon={<HighlightOffIcon />}
                      onClick={() => handleStatusChange('Cancelled')}
                    >
                      Cancel Meeting
                    </Button>
                  </>
                )
              )}
            </Stack>
          )
        }
      />

      <Box className="grid grid-cols-12 gap-2">
        {/* Left pane: Details */}
        <Box className="col-span-12 md:col-span-7 flex flex-col h-full">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            {/* Session Info */}
            <AppCard title="Session Details">
              <Box className="grid grid-cols-12 gap-2">
                <Box className="col-span-6">
                  <Typography variant="caption" color="text.secondary">Client / Lead Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{cons.clientName}</Typography>
                </Box>
                <Box className="col-span-6">
                  <Typography variant="caption" color="text.secondary">Meeting Link</Typography>
                  <Box>
                    <Link href={cons.meetingLink} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                      <VideoCallIcon fontSize="small" /> Virtual Meeting
                    </Link>
                  </Box>
                </Box>
                <Box className="col-span-6">
                  <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{cons.meetingDate} at {cons.meetingTime}</Typography>
                </Box>
                <Box className="col-span-6">
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{cons.durationMinutes} Minutes</Typography>
                </Box>
                <Box className="col-span-6">
                  <Typography variant="caption" color="text.secondary">Meeting Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusBadge status={cons.status} />
                  </Box>
                </Box>
              </Box>
            </AppCard>

            {/* Recording Section */}
            {cons.status === 'Completed' && (
              <AppCard title="Automated Meeting Recording (Zoom Cloud)">
                {cons.recordingUrl ? (
                  cons.recordingUrl.includes('zoom.us') || cons.recordingUrl.includes('zoom.com') ? (
                    /* Zoom Cloud playback page (Opens in new tab) */
                    <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                        <VideoCallIcon color="primary" sx={{ fontSize: 32 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Assessment Meeting Recording (Zoom Cloud)
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                            Meeting Link: {cons.recordingUrl}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        href={cons.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<PlayArrowIcon />}
                        sx={{ mt: 1, px: 3, fontWeight: 700 }}
                      >
                        Play Recording on Zoom Cloud
                      </Button>
                    </Box>
                  ) : (
                    /* Legacy direct audio stream playback (e.g. S3 files) */
                    <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                      <audio
                        ref={audioRef}
                        src={cons.recordingUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleAudioEnded}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <IconButton 
                          onClick={handlePlayPause} 
                          color="secondary" 
                          sx={{ 
                            width: 48, 
                            height: 48, 
                            bgcolor: 'secondary.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'secondary.dark' } 
                          }}
                        >
                          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {getRecordingFilename(cons.recordingUrl)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                            S3 Path: {cons.recordingUrl}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Slider Timeline */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                          {formatTime(currentTime)}
                        </Typography>
                        <Slider
                          size="small"
                          value={currentTime}
                          min={0}
                          max={duration || 1}
                          onChange={handleSliderChange}
                          color="secondary"
                          sx={{ flexGrow: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                          {formatTime(duration)}
                        </Typography>
                      </Box>

                      {/* Volume Controller */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                        <VolumeUpIcon fontSize="small" color="action" />
                        <Slider
                          size="small"
                          value={volume}
                          onChange={(e, val) => setVolume(val)}
                          min={0}
                          max={100}
                          sx={{ width: 80, color: 'text.secondary' }}
                        />
                      </Box>
                    </Box>
                  )
                ) : (
                  /* No recording available fallback */
                  <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      No Meeting Recording Logged
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      If this consultation was conducted manually (e.g. phone or WhatsApp call), no recording is captured. If it was a Zoom meeting, the recording may still be processing on Zoom Cloud.
                    </Typography>
                  </Box>
                )}
              </AppCard>
            )}

            {/* Outcome and notes section */}
            {cons.status === 'Completed' && cons.outcome && (
              <AppCard title="Meeting Assessment Outcome">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Client Requested Service</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {cons.outcome.clientRequestedService}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">AAA Recommended Visa Pathway</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                      {cons.outcome.aaaRecommendedService}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Agent Notes & Recommendations</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'background.neutral', p: 2, borderRadius: 2, mt: 0.5 }}>
                      {cons.notes || 'No recommendations logged.'}
                    </Typography>
                  </Box>
                </Box>
              </AppCard>
            )}
          </Box>
        </Box>

        {/* Right pane: Host profile */}
        <Box className="col-span-12 md:col-span-5 flex flex-col h-full">
          <AppCard title="Assigned Spain Visa Expert">
            {consultant ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 2, minWidth: 0, width: '100%' }}>
                <Avatar src={consultant.avatar} sx={{ width: 72, height: 72, mb: 2, flexShrink: 0 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{consultant.name}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  title={consultant.email}
                  sx={{
                    mb: 2,
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
                <Divider sx={{ width: '100%', my: 2 }} />
                <Box sx={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
        title="Log Meeting Assessment Outcome"
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
              Submit Outcome
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="body2">
            Log the final results of the visa consultation. This updates the Lead qualification state and enables package invoice generation.
          </Typography>

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
          >
            {SERVICES.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} (Base fee: €{s.basePrice})
              </MenuItem>
            ))}
          </TextField>

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
        </Box>
      </AppModal>
    </Box>
  );
};

export default ConsultationDetails;
