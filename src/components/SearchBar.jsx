import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

export const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  sx = {},
}) => {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      variant="outlined"
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          backgroundColor: 'background.paper',
        },
        ...sx,
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary', fontSize: '20px' }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton onClick={onClear} size="small" edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }
      }}
    />
  );
};

export default SearchBar;
