import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createAppTheme from '../theme/theme';

const ThemeModeContext = createContext({
  toggleTheme: () => { },
  mode: 'light',
});

export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeModeProvider = ({ children }) => {
  const [mode] = useState('light');

  const toggleTheme = () => {
    // Dark theme disabled by client request
  };

  const theme = useMemo(() => createAppTheme('light'), []);

  return (
    <ThemeModeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
