import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AppModal from './AppModal';
import StatusBadge from './StatusBadge';
import dayjs from 'dayjs';

export const ChecklistManagementModal = ({
  open,
  onClose,
  cycle,
  checklistItems = [],
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReviewDoc
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Identity Documents');
  const [belongsTo, setBelongsTo] = useState('Main Applicant');
  const [isMandatory, setIsMandatory] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [clientInstructions, setClientInstructions] = useState('');

  const handleAddSubmit = async () => {
    if (!title || !category) return;
    if (onAddItem && cycle) {
      await onAddItem({
        applicationId: cycle.id,
        title,
        category,
        belongsTo,
        isMandatory,
        dueDate: dueDate || null,
        clientInstructions
      });
      setShowAddForm(false);
      setTitle('');
      setClientInstructions('');
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Resubmission Checklist — Application #${cycle?.id?.substring(0, 8)}`}
      maxWidth="md"
      actions={
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Manage checklist items, set requirements, and review uploaded versions.
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel Add' : 'Add Custom Checklist Item'}
          </Button>
        </Box>

        {showAddForm && (
          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>New Custom Checklist Item</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <TextField
                label="Item Title *"
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                select
                label="Category *"
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="Identity Documents">Identity Documents</MenuItem>
                <MenuItem value="Official Notices">Official Notices</MenuItem>
                <MenuItem value="Financial Documents">Financial Documents</MenuItem>
                <MenuItem value="Application Forms">Application Forms</MenuItem>
                <MenuItem value="Legal & Court">Legal & Court</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField
                select
                label="Belongs To *"
                size="small"
                value={belongsTo}
                onChange={(e) => setBelongsTo(e.target.value)}
              >
                <MenuItem value="Main Applicant">Main Applicant</MenuItem>
                <MenuItem value="Spouse">Spouse</MenuItem>
                <MenuItem value="Child 1">Child 1</MenuItem>
                <MenuItem value="Child 2">Child 2</MenuItem>
                <MenuItem value="Dependent">Dependent</MenuItem>
              </TextField>
              <TextField
                label="Due Date (Optional)"
                type="date"
                size="small"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Client Instructions / Notes"
              multiline
              rows={2}
              size="small"
              placeholder="Instructions for the client regarding what to upload..."
              value={clientInstructions}
              onChange={(e) => setClientInstructions(e.target.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    color="primary"
                  />
                }
                label="Mandatory Item (Blocks Ready for Resubmission)"
              />
              <Button variant="contained" color="primary" onClick={handleAddSubmit}>
                Save Item
              </Button>
            </Box>
          </Paper>
        )}

        {checklistItems.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No checklist items in this cycle yet.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {checklistItems.map((item) => {
              const isNotRequired = item.status === 'NOT_REQUIRED';
              const activeDoc = item.activeDocument;
              const hasHistory = item.documents && item.documents.length > 0;

              return (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: isNotRequired ? '#f1f5f9' : '#ffffff',
                    opacity: isNotRequired ? 0.75 : 1
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 240 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, textDecoration: isNotRequired ? 'line-through' : 'none' }}>
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.belongsTo || 'Main Applicant'}
                          size="small"
                          sx={{ fontSize: '10px', height: '18px', bgcolor: '#e2e8f0' }}
                        />
                        <Chip
                          label={item.isMandatory ? 'Mandatory' : 'Optional'}
                          size="small"
                          color={item.isMandatory ? 'error' : 'default'}
                          variant="outlined"
                          sx={{ fontSize: '10px', height: '18px', fontWeight: 700 }}
                        />
                        <StatusBadge status={item.status} size="small" />
                      </Box>

                      {item.clientInstructions && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Instructions: {item.clientInstructions}
                        </Typography>
                      )}

                      {activeDoc && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            Latest Upload (V{activeDoc.version}): {activeDoc.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Uploaded: {dayjs(activeDoc.uploadedDate).format('DD/MM/YYYY HH:mm')} | Status: {activeDoc.status}
                          </Typography>
                          {activeDoc.comment && (
                            <Typography variant="caption" color="error" display="block">
                              Rejection comment: {activeDoc.comment}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {onDeleteItem && (
                        <IconButton
                          size="small"
                          color="error"
                          title={hasHistory ? "Mark as NOT_REQUIRED (Preserves history)" : "Delete checklist item"}
                          onClick={() => onDeleteItem(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </AppModal>
  );
};

export default ChecklistManagementModal;
