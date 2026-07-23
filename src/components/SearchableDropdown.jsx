import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchableDropdown({
  value,
  onChange,
  error,
  helperText,
  label,
  options,
  sx = {}
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const open = Boolean(anchorEl);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // When dropdown opens, focus search input and reset state
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setActiveIndex(-1);
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleOpen = (event) => {
    if (event && event.currentTarget) {
      setAnchorEl(event.currentTarget);
    } else {
      setAnchorEl(containerRef.current);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (option) => {
    onChange(option);
    handleClose();
  };

  // Scroll active item into view within the popover list
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        handleOpen(e);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => {
        const next = prev + 1;
        return next < filteredOptions.length ? next : 0;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => {
        const next = prev - 1;
        return next >= 0 ? next : filteredOptions.length - 1;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        handleSelect(filteredOptions[activeIndex]);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <Box ref={containerRef} sx={{ ...sx, position: 'relative' }}>
      <TextField
        label={label}
        value={value || ''}
        error={error}
        helperText={helperText}
        fullWidth
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </InputAdornment>
          ),
          style: { cursor: 'pointer' }
        }}
        inputProps={{
          style: { cursor: 'pointer' }
        }}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableAutoFocus
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          style: {
            width: anchorEl ? anchorEl.offsetWidth : 'auto',
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 280, width: '100%' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              inputRef={searchInputRef}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <List ref={listRef} sx={{ overflowY: 'auto', p: 0, flex: 1 }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <ListItemButton
                  key={option}
                  selected={idx === activeIndex}
                  onClick={() => handleSelect(option)}
                  sx={{
                    py: 1,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemText primary={option} />
                </ListItemButton>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                No results found
              </Box>
            )}
          </List>
        </Box>
      </Popover>
    </Box>
  );
}
