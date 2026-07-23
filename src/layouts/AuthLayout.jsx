import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

export const AuthLayout = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: theme.palette.background.default,
        overflow: 'hidden',
      }}
    >
      {/* Left Pane: Brand Banner (Hidden on mobile/tablet) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '55%',
          height: '100%',
          position: 'relative',
          backgroundImage: 'url("https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#FFFFFF',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(11, 27, 61, 0.75)', // Overlay brand Royal Navy
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                backgroundColor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              A³
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>
              AAA Business Consultancy
            </Typography>
          </Box>
        </Box>

        <Box sx={{ zIndex: 2, mb: 4, textAlign: 'left' }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 2, lineHeight: 1.2 }}>
            Your Trusted Partner for a Better Future in Spain.
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 520 }}>
            Specializing in Digital Nomad Visas (DNV), Non-Lucrative Residency, Study Visas, and complete relocation administrative assistance in Madrid, Barcelona, and Valencia.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ zIndex: 2, color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
          © {new Date().getFullYear()} AAA Business Consultancy LLC. Advise • Assist • Achieve.
        </Typography>
      </Box>

      {/* Right Pane: Login Card (Spans full width on mobile) */}
      <Box
        sx={{
          width: { xs: '100%', md: '45%' },
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 3,
          py: 4,
          position: 'relative',
          overflowY: 'hidden',
          background:
            theme.palette.mode === 'light'
              ? 'radial-gradient(circle at 0% 0%, #FFFFFF 0%, #EEF2F6 100%)'
              : 'radial-gradient(circle at 0% 0%, #0B1426 0%, #050A14 100%)',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 450,
            borderRadius: 4,
            border: '1px solid',
            borderColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            background:
              theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.65)'
                : 'rgba(11, 20, 38, 0.75)',
            backdropFilter: 'blur(20px)',
            boxShadow:
              theme.palette.mode === 'light'
                ? '0px 25px 50px -12px rgba(15, 23, 42, 0.1)'
                : '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
            p: { xs: 3, sm: 3.5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          {/* Brand Header (Only visible on mobile/tablet screens) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #3F51B5 0%, #C59B27 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              A³
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: theme.palette.mode === 'light' ? 'primary.main' : 'white' }}>
                AAA Business Consultancy
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Spain Visa, Residency & Relocation Portal
              </Typography>
            </Box>
          </Box>

          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
};

export default AuthLayout;
