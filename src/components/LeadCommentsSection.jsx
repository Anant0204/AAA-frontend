import React, { useState } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useAlert } from '../contexts/AlertContext';
import { dbService } from '../services/dbService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const LeadCommentsSection = ({ lead, currentUser }) => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Extract comments array
  const rawComments = Array.isArray(lead?.caseComments)
    ? lead.caseComments
    : Array.isArray(lead?.comments)
    ? lead.comments
    : [];

  const updateLeadMutation = useMutation({
    mutationFn: (updateData) => dbService.updateLead(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err) => {
      showAlert(err?.response?.data?.message || 'Failed to update comments', 'error');
    }
  });

  const getAuthorName = () => {
    if (!currentUser) return 'Staff';
    return currentUser.fullName || currentUser.name || currentUser.email || 'Staff';
  };

  const getAuthorRole = () => {
    if (!currentUser) return 'staff';
    return currentUser.role || 'staff';
  };

  // Add Comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const authorName = getAuthorName();
    const authorRole = getAuthorRole();
    const now = new Date();
    const commentId = `cm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newComment = {
      id: commentId,
      text: newCommentText.trim(),
      author: authorName,
      authorId: currentUser?.id || '',
      authorRole: authorRole,
      date: dayjs(now).format('DD/MM/YYYY'),
      time: dayjs(now).format('hh:mm A'),
      createdAt: now.toISOString()
    };

    const updatedComments = [...rawComments, newComment];

    const safeTimeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
    const updatedTimeline = [
      {
        date: now.toISOString(),
        event: `Added note: "${newCommentText.trim().substring(0, 50)}${newCommentText.trim().length > 50 ? '...' : ''}"`,
        user: authorName
      },
      ...safeTimeline
    ];

    updateLeadMutation.mutate(
      {
        id: lead.id,
        caseComments: updatedComments,
        comments: updatedComments,
        timeline: updatedTimeline
      },
      {
        onSuccess: () => {
          setNewCommentText('');
          showAlert('Comment added successfully!', 'success');
        }
      }
    );
  };

  // Start editing
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  // Save edited comment
  const handleSaveEdit = (commentId) => {
    if (!editingText.trim()) {
      showAlert('Comment cannot be empty', 'warning');
      return;
    }

    const now = new Date();
    const authorName = getAuthorName();

    const updatedComments = rawComments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          text: editingText.trim(),
          isEdited: true,
          updatedAt: now.toISOString(),
          editedBy: authorName
        };
      }
      return c;
    });

    const safeTimeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
    const updatedTimeline = [
      {
        date: now.toISOString(),
        event: `Edited note: "${editingText.trim().substring(0, 50)}${editingText.trim().length > 50 ? '...' : ''}"`,
        user: authorName
      },
      ...safeTimeline
    ];

    updateLeadMutation.mutate(
      {
        id: lead.id,
        caseComments: updatedComments,
        comments: updatedComments,
        timeline: updatedTimeline
      },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditingText('');
          showAlert('Comment updated successfully!', 'success');
        }
      }
    );
  };

  // Request delete confirmation
  const handleConfirmDelete = (comment) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  // Execute delete
  const handleDeleteComment = () => {
    if (!commentToDelete) return;

    const authorName = getAuthorName();
    const now = new Date();
    const updatedComments = rawComments.filter((c) => c.id !== commentToDelete.id);

    const safeTimeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
    const updatedTimeline = [
      {
        date: now.toISOString(),
        event: `Deleted a note from case file`,
        user: authorName
      },
      ...safeTimeline
    ];

    updateLeadMutation.mutate(
      {
        id: lead.id,
        caseComments: updatedComments,
        comments: updatedComments,
        timeline: updatedTimeline
      },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setCommentToDelete(null);
          showAlert('Comment deleted successfully!', 'success');
        }
      }
    );
  };

  // Check if current user can modify comment (author or super_admin / admin)
  const canModify = (comment) => {
    if (!currentUser) return false;
    if (['super_admin', 'admin'].includes(currentUser.role)) return true;
    if (comment.authorId && comment.authorId === currentUser.id) return true;
    if (comment.author && comment.author === (currentUser.fullName || currentUser.name)) return true;
    return false;
  };

  const getRoleBadgeColor = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('super_admin') || r.includes('ceo')) return { bg: '#EDE9FE', color: '#6D28D9', label: 'CEO / Super Admin' };
    if (r.includes('admin')) return { bg: '#E0E7FF', color: '#4338CA', label: 'Admin' };
    if (r.includes('consultant')) return { bg: '#E0F2FE', color: '#0369A1', label: 'Consultant' };
    if (r.includes('operations')) return { bg: '#FEF3C7', color: '#B45309', label: 'Operations' };
    if (r.includes('finance')) return { bg: '#DCFCE7', color: '#15803D', label: 'Finance' };
    return { bg: '#F1F5F9', color: '#475569', label: role || 'Staff' };
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentIcon sx={{ color: 'primary.main', fontSize: '1.4rem' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
            Case Notes & Comments
          </Typography>
          <Chip
            label={rawComments.length}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: 'primary.50',
              color: 'primary.main',
              border: '1px solid',
              borderColor: 'primary.200'
            }}
          />
        </Box>
      </Box>

      {/* Legacy Notes Banner if present */}
      {lead?.notes && lead.notes.trim() && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            bgcolor: '#FFFBEB',
            border: '1px solid #FDE68A',
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start'
          }}
        >
          <HistoryEduIcon sx={{ color: '#D97706', mt: 0.2, fontSize: '1.3rem' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E', mb: 0.5, fontSize: '0.8rem' }}>
              Historical / Form Notes:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#78350F',
                whiteSpace: 'pre-wrap',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}
            >
              {lead.notes}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Comments List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {rawComments.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              border: '1px dashed #CBD5E1'
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              No comments logged on this case yet. Write a comment below to start recording case notes.
            </Typography>
          </Paper>
        ) : (
          rawComments.map((comment, index) => {
            const isEditing = editingCommentId === comment.id;
            const roleStyle = getRoleBadgeColor(comment.authorRole);
            const userInitial = (comment.author || 'S').charAt(0).toUpperCase();

            return (
              <Paper
                key={comment.id || index}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }
                }}
              >
                {/* Header: Author, Role, Date, Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        bgcolor: roleStyle.color,
                        color: '#FFFFFF'
                      }}
                    >
                      {userInitial}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>
                      {comment.author || 'Staff'}
                    </Typography>
                    <Chip
                      label={roleStyle.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: roleStyle.bg,
                        color: roleStyle.color,
                        border: 'none'
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                      📅 {comment.date} {comment.time ? `at ${comment.time}` : ''}
                    </Typography>
                    {comment.isEdited && (
                      <Chip
                        label="Edited"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          bgcolor: '#F1F5F9',
                          color: '#64748B',
                          fontWeight: 500
                        }}
                      />
                    )}
                  </Box>

                  {/* Edit / Delete Buttons */}
                  {canModify(comment) && !isEditing && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="Edit comment">
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(comment)}
                          sx={{
                            color: '#64748B',
                            p: 0.5,
                            '&:hover': { color: 'primary.main', bgcolor: 'primary.50' }
                          }}
                        >
                          <EditIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete comment">
                        <IconButton
                          size="small"
                          onClick={() => handleConfirmDelete(comment)}
                          sx={{
                            color: '#64748B',
                            p: 0.5,
                            '&:hover': { color: 'error.main', bgcolor: '#FEE2E2' }
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: '1.05rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                {/* Content or Edit Input */}
                {isEditing ? (
                  <Box sx={{ mt: 1.5 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      variant="outlined"
                      size="small"
                      autoFocus
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#F8FAFC',
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleCancelEdit}
                        startIcon={<CloseIcon sx={{ fontSize: '0.9rem' }} />}
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={updateLeadMutation.isPending}
                        startIcon={
                          updateLeadMutation.isPending ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <CheckIcon sx={{ fontSize: '0.9rem' }} />
                          )
                        }
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      pl: 4.5
                    }}
                  >
                    {comment.text}
                  </Typography>
                )}
              </Paper>
            );
          })
        )}
      </Box>

      {/* Add New Comment Box */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', mb: 1, fontSize: '0.8rem' }}>
          ✍️ Log New Note / Comment:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <TextField
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            placeholder="Type your notes or updates here... (Ctrl+Enter to post)"
            variant="outlined"
            fullWidth
            multiline
            minRows={2}
            maxRows={5}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFFFF',
                borderRadius: 1.5,
                fontSize: '0.875rem'
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={!newCommentText.trim() || updateLeadMutation.isPending}
            endIcon={
              updateLeadMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SendIcon sx={{ fontSize: '1rem' }} />
              )
            }
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 120,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }
            }}
          >
            Comment
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B', pb: 1 }}>
          Delete Comment?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.875rem', color: '#64748B' }}>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
          {commentToDelete && (
            <Paper
              elevation={0}
              sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: '#F1F5F9',
                borderRadius: 1.5,
                border: '1px solid #E2E8F0',
                fontSize: '0.8rem',
                color: '#334155',
                maxHeight: 100,
                overflowY: 'auto'
              }}
            >
              "{commentToDelete.text}"
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteComment}
            variant="contained"
            color="error"
            size="small"
            disabled={updateLeadMutation.isPending}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            {updateLeadMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadCommentsSection;
