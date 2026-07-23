import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const AppModal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby="app-modal-title"
      aria-describedby="app-modal-description"
    >
      {title && (
        <DialogTitle
          id="app-modal-title"
          sx={{
            m: 0,
            p: 2.5,
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {title}
          {!loading && onClose && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      {/* pt:2.5 pb:1 — removes the extra empty space at the bottom before action buttons */}
      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1, mt: title ? 0 : 2 }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            px: 2.5,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AppModal;
