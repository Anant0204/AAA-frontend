import React from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { SERVICES } from '../constants/mockData';
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';

export const FilterPanel = ({
  filters = {},
  onFilterChange,
  onClearFilters,
  statusOptions = [],
  showConsultantFilter = true,
  showServiceFilter = true,
  sx = {} }) => {
  const { data: consultants = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: dbService.getConsultants });
  const handleSelectChange = (field, event) => {
    onFilterChange(field, event.target.value);
  };

  const activeColumnsCount = [
    showServiceFilter,
    statusOptions.length > 0,
    showConsultantFilter,
    true // Clear button is always present
  ].filter(Boolean).length;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        backgroundColor: 'background.neutral',
        border: '1px dashed',
        borderColor: 'divider',
        width: '100%',
        boxSizing: 'border-box',
        ...sx }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          gap: 1,
          alignItems: 'center',
          width: '100%',
          overflowX: 'auto' }}
      >
        {showServiceFilter && (
          <FormControl size="small" sx={{ flex: '1 1 0', minWidth: 0 }}>
            <Select
              value={filters.serviceId || ''}
              onChange={(e) => handleSelectChange('serviceId', e)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <Box component="span" sx={{ color: 'text.secondary', fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>Service</Box>;
                }
                const name = SERVICES.find((s) => s.id === selected)?.name || selected;
                return <Box component="span" sx={{ fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>{name}</Box>;
              }}
              sx={{ fontSize: { xs: '0.72rem', sm: '0.875rem' } }}
            >
              <MenuItem value="">All Services</MenuItem>
              {SERVICES.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {statusOptions.length > 0 && (
          <FormControl size="small" sx={{ flex: '1 1 0', minWidth: 0 }}>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleSelectChange('status', e)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <Box component="span" sx={{ color: 'text.secondary', fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>Status</Box>;
                }
                return <Box component="span" sx={{ fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>{selected}</Box>;
              }}
              sx={{ fontSize: { xs: '0.72rem', sm: '0.875rem' } }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {showConsultantFilter && (
          <FormControl size="small" sx={{ flex: '1 1 0', minWidth: 0 }}>
            <Select
              value={filters.assignedConsultantId || ''}
              onChange={(e) => handleSelectChange('assignedConsultantId', e)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <Box component="span" sx={{ color: 'text.secondary', fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>Agent</Box>;
                }
                const c = consultants.find((cons) => cons.id === selected);
                return <Box component="span" sx={{ fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>{c ? c.name : selected}</Box>;
              }}
              sx={{ fontSize: { xs: '0.72rem', sm: '0.875rem' } }}
            >
              <MenuItem value="">All Agents</MenuItem>
              {consultants.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={onClearFilters}
          startIcon={<FilterAltOffIcon />}
          sx={{ height: 38, flexShrink: 0, whiteSpace: 'nowrap', px: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default FilterPanel;
