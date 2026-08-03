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
import Typography from '@mui/material/Typography';
import { COUNTRY_CODES } from '../constants/countryCodes';

export default function SearchableCountryCodeSelect({
  value = '+971',
  onChange,
  disabled = false,
  sx = {}
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const open = Boolean(anchorEl);

  const filteredOptions = COUNTRY_CODES.filter(item =>
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    if (disabled) return;
    if (event && event.currentTarget) {
      setAnchorEl(event.currentTarget);
    } else {
      setAnchorEl(containerRef.current);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code) => {
    onChange(code);
    handleClose();
  };

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
        handleSelect(filteredOptions[activeIndex].code);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].code);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  const matchedItem = COUNTRY_CODES.find(c => c.code === value);
  const displayLabel = value || '+971';

  return (
    <Box ref={containerRef} sx={{ ...sx, position: 'relative', width: 105, flexShrink: 0 }}>
      <TextField
        size="small"
        value={displayLabel}
        fullWidth
        disabled={disabled}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end" sx={{ ml: -0.5 }}>
              {open ? <ArrowDropUpIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />}
            </InputAdornment>
          ),
          style: { cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem' }
        }}
        inputProps={{
          style: { cursor: disabled ? 'not-allowed' : 'pointer', paddingRight: 0 }
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
            width: 230,
            marginTop: 4,
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column' }, maxHeight: 280, width: '100%' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <TextField
              size="small"
              placeholder="Search code/country..."
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
          <List ref={listRef} sx={{ overflowY: 'auto', p: 0, maxHeight: 220 }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, idx) => (
                <ListItemButton
                  key={item.code + item.name}
                  selected={item.code === value || idx === activeIndex}
                  onClick={() => handleSelect(item.code)}
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      fontWeight: 700
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mr: 1 }}>
                    {item.code}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </Typography>
                </ListItemButton>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', fontSize: '0.85rem' }}>
                No country code found
              </Box>
            )}
          </List>
        </Box>
      </Popover>
    </Box>
  );
}
