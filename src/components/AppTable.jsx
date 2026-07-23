import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import StatusBadge from './StatusBadge';

import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';
import { useAuth } from '../hooks/useAuth';

const DEFAULT_COLUMNS = {
  leads: ['id', 'name', 'phone', 'email', 'nationality', 'service', 'status', 'assignedConsultant', 'source', 'createdDate'],
  clients: ['id', 'name', 'nationality', 'service', 'package', 'status', 'visaStatus', 'assignedConsultant']
};

export const AppTable = ({
  columns,
  context, // 'leads' or 'clients'
  data = [],
  onRowClick,
  actions,
  page = 0,
  rowsPerPage = 10,
  count = 0,
  onPageChange,
  onRowsPerPageChange,
  sortColumn,
  sortDirection = 'asc',
  onSort,
  loading = false,
  maxHeight = 600,
}) => {
  const { currentUser } = useAuth();
  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings,
    enabled: !!currentUser
  });

  const handleSort = (property) => {
    if (onSort) {
      onSort(property);
    }
  };

  let visibleColumns = columns;
  if (context && customizationSettings && currentUser && currentUser.role !== 'super_admin') {
    const roleConfig = (customizationSettings[currentUser.id] || customizationSettings[currentUser.role]) || {};
    const allowedColumns = roleConfig.columns?.[context] || DEFAULT_COLUMNS[context];
    if (allowedColumns) {
      visibleColumns = columns.filter(col => allowedColumns.includes(col.id));
    }
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <TableContainer sx={{ maxHeight, overflowX: 'auto' }}>
        <Table stickyHeader aria-label="customized table">
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={sortColumn === column.id ? sortDirection : false}
                  sx={{
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions && (
                <TableCell align="right" sx={{ py: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (actions ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Box sx={{ color: 'text.secondary', fontWeight: 500 }}>Loading records...</Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (actions ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Box sx={{ color: 'text.secondary', fontWeight: 500 }}>No records found</Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  {visibleColumns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        sx={{
                          py: 0.8,
                          fontSize: '0.8rem',
                          whiteSpace: column.wrap ? 'normal' : 'nowrap',
                          minWidth: column.minWidth || '120px',
                        }}
                      >
                        {column.render ? (
                          column.render(row)
                        ) : column.id === 'status' || column.id === 'visaStatus' ? (
                          <StatusBadge status={value} />
                        ) : (
                          value ?? '-'
                        )}
                      </TableCell>
                    );
                  })}
                  {actions && (
                    <TableCell
                      align="right"
                      sx={{ py: 0.6 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {actions(row)}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={count || data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange && onRowsPerPageChange(parseInt(e.target.value, 10))}
        />
      )}
    </Paper>
  );
};

export default AppTable;
