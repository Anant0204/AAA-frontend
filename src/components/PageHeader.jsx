import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: { xs: 1, md: 2 },
        mb: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 0.5, '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
          >
            {breadcrumbs.map((bc, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return isLast ? (
                <Typography key={idx} variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {bc.label}
                </Typography>
              ) : (
                <Link
                  key={idx}
                  underline="hover"
                  color="inherit"
                  href={bc.href || '#'}
                  sx={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  {bc.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.35rem' },
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              fontSize: { xs: '0.72rem', sm: '0.8rem' },
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: { xs: 2, sm: 'none' },
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
