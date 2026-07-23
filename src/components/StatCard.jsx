import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'up',
  color = '#2563EB',
  onClick,
  trendLabel,
}) => {
  const isUp = trendDirection === 'up';

  return (
    <Paper
      onClick={onClick}
      className={`flex justify-between relative overflow-hidden transition-all duration-200 border border-solid border-divider shadow-none rounded-[8px] h-full`}
      sx={{
        p: { xs: 1.25, sm: 2 },
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'all 0.2s ease-in-out' : 'none',
        '&:hover': onClick ? {
          borderColor: color,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: color,
        }
      }}
    >
      <Box className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1 pr-1">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: { xs: '0.6rem', sm: '0.7rem' },
            lineHeight: 1.3,
            display: 'block',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            lineHeight: 1.1,
            color: 'text.primary',
          }}
        >
          {value}
        </Typography>
        {trend && (
          <Box className="flex items-center gap-1" sx={{ flexWrap: 'nowrap' }}>
            <Box
              className="flex items-center font-bold"
              sx={{
                color: isUp ? 'success.main' : 'error.main',
                fontSize: { xs: '0.65rem', sm: '0.72rem' },
              }}
            >
              {isUp ? <ArrowUpwardIcon sx={{ fontSize: 'inherit' }} /> : <ArrowDownwardIcon sx={{ fontSize: 'inherit' }} />}
              {trend}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, display: { xs: 'none', sm: 'block' } }}
            >
              {trendLabel || 'vs last period'}
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: 34, sm: 44 },
          height: { xs: 34, sm: 44 },
          borderRadius: '8px',
          flexShrink: 0,
          backgroundColor: `${color}15`,
          color: color,
          '& svg': {
            fontSize: { xs: '1.1rem', sm: '1.4rem' },
          },
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

export default StatCard;
