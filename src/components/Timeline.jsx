import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import dayjs from 'dayjs';

export const Timeline = ({ items = [] }) => {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        No timeline events recorded.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', pl: 3.5, py: 1 }}>
      {/* Central vertical line */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: '11px',
          width: '2px',
          height: 'calc(100% - 16px)',
          backgroundColor: 'divider',
        }}
      />

      {items.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            mb: idx === items.length - 1 ? 0 : 3,
          }}
        >
          {/* Bullet dot */}
          <Box
            sx={{
              position: 'absolute',
              top: '4px',
              left: '-28px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              border: '2px solid',
              borderColor: 'background.paper',
              boxShadow: '0 0 0 2px rgba(15, 23, 42, 0.1)',
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {item.event}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {dayjs(item.date).format('MMM DD, YYYY HH:mm')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Avatar sx={{ width: 18, height: 18, fontSize: '10px', bgcolor: 'primary.main' }}>
              {item.user ? item.user[0] : 'S'}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              By {item.user || 'System'}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Timeline;
