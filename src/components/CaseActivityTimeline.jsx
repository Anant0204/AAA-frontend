import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/dbService';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ForumIcon from '@mui/icons-material/Forum';
import HistoryIcon from '@mui/icons-material/History';
import dayjs from 'dayjs';

export const CaseActivityTimeline = ({ clientId, leadId, applicationId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['caseTimeline', clientId, leadId, applicationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clientId) params.append('clientId', clientId);
      if (leadId) params.append('leadId', leadId);
      if (applicationId) params.append('applicationId', applicationId);

      const res = await apiClient.get(`/audit-logs/timeline?${params.toString()}`);
      return res.data;
    },
    enabled: Boolean(clientId || leadId || applicationId),
    refetchInterval: 10000 // Auto refresh every 10 seconds
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'DOC_UPLOADED':
        return <DescriptionIcon fontSize="small" sx={{ color: '#2563EB' }} />;
      case 'DOC_VERIFIED':
        return <CheckCircleIcon fontSize="small" sx={{ color: '#059669' }} />;
      case 'DOC_REJECTED':
        return <CancelIcon fontSize="small" sx={{ color: '#DC2626' }} />;
      case 'STATUS_CHANGED':
      case 'CASE_STATUS_CHANGED':
      case 'LEAD_STATUS_CHANGED':
        return <SwapHorizIcon fontSize="small" sx={{ color: '#7C3AED' }} />;
      case 'NOTE_ADDED':
        return <NoteAltIcon fontSize="small" sx={{ color: '#D97706' }} />;
      default:
        return <ForumIcon fontSize="small" sx={{ color: '#0284C7' }} />;
    }
  };

  const getEventBadgeColor = (type) => {
    if (type === 'DOC_VERIFIED') return 'success';
    if (type === 'DOC_REJECTED') return 'error';
    if (type === 'DOC_UPLOADED') return 'primary';
    if (type.includes('STATUS')) return 'secondary';
    if (type === 'NOTE_ADDED') return 'warning';
    return 'info';
  };

  const timeline = data?.timeline || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ p: 2 }}>
        Unable to load activity log timeline.
      </Typography>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: '#FAFBFD' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <HistoryIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
          Activity Log & Case Timeline
        </Typography>
        <Chip label={`${timeline.length} Events`} size="small" variant="outlined" sx={{ ml: 'auto', fontWeight: 600 }} />
      </Box>

      {timeline.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
          <Typography variant="body2">No activity recorded yet for this profile.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {timeline.map((item, idx) => (
            <Box key={item.id || idx} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              {/* Timeline Connector Line */}
              {idx < timeline.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 17,
                    top: 36,
                    bottom: -16,
                    width: 2,
                    bgcolor: 'divider'
                  }}
                />
              )}

              {/* Icon Container */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  zIndex: 1
                }}
              >
                {getEventIcon(item.type)}
              </Box>

              {/* Content Details */}
              <Paper
                elevation={0}
                sx={{
                  flexGrow: 1,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={item.type.replace(/_/g, ' ')}
                      color={getEventBadgeColor(item.type)}
                      size="small"
                      sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {item.actorName}
                    </Typography>
                    {item.actorRole && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', bgcolor: '#F1F5F9', px: 0.8, py: 0.2, borderRadius: 1 }}>
                        {item.actorRole}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {dayjs(item.timestamp).format('DD MMM YYYY, hh:mm A')}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', fontSize: '0.85rem' }}>
                  {item.description}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default CaseActivityTimeline;
