import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

const AlertContext = createContext({
  showAlert: (message, severity = 'success') => {},
});

export const useAlert = () => useContext(AlertContext);

const SlideTransition = React.forwardRef(function SlideTransition(props, ref) {
  return <Slide ref={ref} {...props} direction="left" />;
});

export const AlertProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const showAlert = useCallback((msg, sev = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};
