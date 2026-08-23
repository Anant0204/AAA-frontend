import React from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';

import { dbService } from '../services/dbService';

export const CommunicationHistoryTab = ({ clientId, leadId }) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['communications', clientId, leadId],
    queryFn: () => dbService.getCommunications({ clientId, leadId }),
    refetchInterval: 5000
  });

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
            No communication history recorded yet.
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
                    {dayjs(log.createdAt).format('DD/MM/YYYY, hh:mm:ss A')}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', mt: 0.5 }}>
                  {(log.content || '').replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, '$3/$2/$1')}
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
