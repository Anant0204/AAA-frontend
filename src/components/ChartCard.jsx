import React from 'react';
import AppCard from './AppCard';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export const ChartCard = ({
  title,
  subheader,
  action,
  children,
  height = 300,
  loading = false,
  sx = {},
}) => {
  return (
    <AppCard title={title} subheader={subheader} action={action} sx={sx} noPadding>
      <Box
        sx={{
          height: height,
          width: '100%',
          p: 2,
          position: 'relative',
          ...(loading ? { display: 'flex', justifyContent: 'center', alignItems: 'center' } : {})
        }}
      >
        {loading ? (
          <CircularProgress size={40} thickness={4} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            {children}
          </Box>
        )}
      </Box>
    </AppCard>
  );
};

export default ChartCard;
