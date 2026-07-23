import { createTheme } from '@mui/material/styles';

const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#3F51B5', // Indigo
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C59B27', // Rich Gold
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#D2A33C', // Warm Gold Accent
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#22C55E', // Green 500
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B', // Amber 500
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444', // Red 500
      contrastText: '#FFFFFF',
    },
    background: {
      default: mode === 'light' ? '#F4F6F9' : '#070D19', // Soft Ice Blue overall background
      paper: mode === 'light' ? '#FFFFFF' : '#0B1426',  // Pure White cards
      neutral: mode === 'light' ? '#E9EDF5' : '#122038',
    },
    text: {
      primary: mode === 'light' ? '#283593' : '#F9FAFB', // Deep Indigo for text contrast
      secondary: mode === 'light' ? 'rgba(40, 53, 147, 0.85)' : '#9CA3AF',
    },
    divider: mode === 'light' ? 'rgba(63, 81, 181, 0.3)' : '#1F2E4D',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1.35rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1.2rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1.05rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '0.85rem',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '0.75rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '0.9rem',
      fontWeight: 600,
    },
    subtitle2: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '0.8rem',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '0.825rem',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '0.775rem',
      lineHeight: 1.57,
    },
    button: {
      fontFamily: '"Outfit", sans-serif',
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.775rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px 0px rgba(15, 23, 42, 0.05)',
    '0px 1px 3px 0px rgba(15, 23, 42, 0.1), 0px 1px 2px -1px rgba(15, 23, 42, 0.1)',
    '0px 4px 6px -1px rgba(15, 23, 42, 0.1), 0px 2px 4px -2px rgba(15, 23, 42, 0.1)',
    '0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -4px rgba(15, 23, 42, 0.1)',
    '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 8px 10px -6px rgba(15, 23, 42, 0.1)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    ...Array(18).fill('none'), // fill rest of shadows array to satisfy MUI
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '5px 10px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3F51B5 0%, #303F9F 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          '&:hover': {
            background: 'linear-gradient(135deg, #303F9F 0%, #1A237E 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #C59B27 0%, #A57F1E 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #A57F1E 0%, #8A6916 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          border: mode === 'light' ? '1px solid #3F51B5' : '1px solid #1F2E4D',
          boxShadow: '0px 1px 3px 0px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: mode === 'light' ? '#FFFFFF' : 'transparent', // Make input fields white in light mode
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#3F51B5' : '#1F2E4D',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#C59B27' : '#C59B27',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.15)',
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#0B1426', // Keep dialog cards white
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: mode === 'light' ? 'rgba(63, 81, 181, 0.2)' : '#1F2E4D',
          padding: '8px 12px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'light' ? '#E9EDF5' : '#122038',
          color: mode === 'light' ? '#283593' : '#9CA3AF',
          borderBottom: mode === 'light' ? '2px solid rgba(63, 81, 181, 0.4)' : '2px solid #1F2E4D',
          padding: '10px 12px',
        },
      },
    },
  },
});

export default createAppTheme;
