import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

// Icons
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SendIcon from '@mui/icons-material/Send';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';

import { dbService } from '../services/dbService';
import { useAlert } from '../contexts/AlertContext';

export const CommunicationHistoryTab = ({ clientId, leadId }) => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const [channel, setChannel] = useState('WHATSAPP');
  const [direction, setDirection] = useState('OUTBOUND');
  const [content, setContent] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['communications', clientId, leadId],
    queryFn: () => dbService.getCommunications({ clientId, leadId }),
    refetchInterval: 5000
  });

  const addLogMutation = useMutation({
    mutationFn: dbService.createCommunicationLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications', clientId, leadId] });
      showAlert('Communication logged successfully', 'success');
      setContent('');
    },
    onError: (err) => {
      showAlert(err.response?.data?.message || 'Error logging communication', 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      showAlert('Please enter communication content or notes', 'warning');
      return;
    }
    if (!clientId) {
      showAlert('Cannot log entry: No linked client account ID found for this lead yet.', 'warning');
      return;
    }
    addLogMutation.mutate({
      clientId,
      channel,
      direction,
      content: content.trim(),
      deliveryStatus: 'DELIVERED'
    });
  };

  const getChannelIcon = (ch) => {
    switch (ch?.toUpperCase()) {
      case 'WHATSAPP':
        return <WhatsAppIcon sx={{ color: '#25D366' }} />;
      case 'EMAIL':
        return <EmailIcon sx={{ color: '#EA4335' }} />;
      case 'CALL':
      case 'PHONE':
        return <PhoneIcon sx={{ color: '#34A853' }} />;
      case 'MEETING':
        return <VideoCallIcon sx={{ color: '#4285F4' }} />;
      default:
        return <EmailIcon sx={{ color: '#9CA3AF' }} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Log Manual Communication Card */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          📝 Log New Communication / Call Note
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="channel-label">Channel</InputLabel>
              <Select
                labelId="channel-label"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                label="Channel"
              >
                <MenuItem value="WHATSAPP">💬 WhatsApp</MenuItem>
                <MenuItem value="EMAIL">✉️ Email</MenuItem>
                <MenuItem value="CALL">📞 Phone Call</MenuItem>
                <MenuItem value="MEETING">🎥 Meeting Log</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="direction-label">Direction</InputLabel>
              <Select
                labelId="direction-label"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                label="Direction"
              >
                <MenuItem value="OUTBOUND">📤 Outbound (Sent)</MenuItem>
                <MenuItem value="INBOUND">📥 Inbound (Received)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="Type message content, email summary, or call notes..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            disabled={addLogMutation.isPending}
          >
            {addLogMutation.isPending ? 'Saving Log...' : 'Save Communication Log'}
          </Button>
        </form>
      </Paper>

      {/* Communication Timeline Log */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          📜 Communication History ({logs.length})
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No communication history recorded yet. Use the form above to log calls, WhatsApps, or emails.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {logs.map((log) => (
              <Paper
                key={log.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                  borderLeft: '4px solid',
                  borderColor: log.channel === 'WHATSAPP' ? '#25D366' : log.channel === 'EMAIL' ? '#EA4335' : log.channel === 'MEETING' ? '#4285F4' : '#34A853',
                  boxShadow: 'none'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getChannelIcon(log.channel)}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {log.channel}
                    </Typography>
                    <Chip
                      icon={log.direction === 'INBOUND' ? <CallReceivedIcon fontSize="small" /> : <CallMadeIcon fontSize="small" />}
                      label={log.direction}
                      size="small"
                      color={log.direction === 'INBOUND' ? 'info' : 'default'}
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                    {log.respondedByUser?.fullName && (
                      <Chip
                        label={`Staff: ${log.respondedByUser.fullName}`}
                        size="small"
                        color="secondary"
                        sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', mt: 0.5 }}>
                  {log.content}
                </Typography>

                {log.meetingLink && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      href={log.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      🔗 Open Meeting Link
                    </Button>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CommunicationHistoryTab;
