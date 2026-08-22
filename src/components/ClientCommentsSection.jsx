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
import { useAlert } from '../contexts/AlertContext';
import { dbService } from '../services/dbService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const ClientCommentsSection = ({ client, currentUser }) => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Extract comments array safely
  const rawComments = Array.isArray(client?.caseComments)
    ? client.caseComments
    : Array.isArray(client?.comments)
    ? client.comments
    : [];

  const updateClientMutation = useMutation({
    mutationFn: (updateData) => dbService.updateClient(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', client?.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err) => {
      showAlert(err?.response?.data?.message || 'Failed to update case comments', 'error');
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
    const commentId = `ccm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

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

    updateClientMutation.mutate(
      {
        id: client.id,
        caseComments: updatedComments,
        comments: updatedComments
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

    updateClientMutation.mutate(
      {
        id: client.id,
        caseComments: updatedComments,
        comments: updatedComments
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

    const updatedComments = rawComments.filter((c) => c.id !== commentToDelete.id);

    updateClientMutation.mutate(
      {
        id: client.id,
        caseComments: updatedComments,
        comments: updatedComments
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
    if (['super_admin', 'admin', 'ceo'].includes(currentUser.role)) return true;
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
          <CommentIcon sx={{ color: 'secondary.main', fontSize: '1.4rem' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontFamily: 'Outfit, sans-serif' }}>
            Case Comments & Internal Notes
          </Typography>
          <Chip
            label={rawComments.length}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: 'rgba(197, 155, 39, 0.12)',
              color: '#A37E1C',
              height: 22
            }}
          />
        </Box>
      </Box>

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: 'none',
          bgcolor: 'background.paper'
        }}
      >
        {/* Input Box for adding new comment */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Write an internal case comment... (e.g. Documents verified with legal team)"
            size="small"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            disabled={updateClientMutation.isPending}
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'background.neutral'
              }
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddComment}
            disabled={!newCommentText.trim() || updateClientMutation.isPending}
            startIcon={updateClientMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{
              px: 3,
              borderRadius: 2,
              whiteSpace: 'nowrap',
              fontWeight: 700,
              alignSelf: { xs: 'stretch', sm: 'flex-start' },
              height: 40
            }}
          >
            {updateClientMutation.isPending ? 'Saving...' : 'Add Comment'}
          </Button>
        </Box>

        {/* List of comments */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {rawComments.map((c) => {
            const isEditing = editingCommentId === c.id;
            const badge = getRoleBadgeColor(c.authorRole);
            const userCanModify = canModify(c);

            return (
              <Paper
                key={c.id || `${c.author}_${c.date}_${c.time}`}
                sx={{
                  p: 2,
                  bgcolor: isEditing ? '#FFFDF5' : 'background.neutral',
                  border: '1px solid',
                  borderColor: isEditing ? 'secondary.main' : 'divider',
                  borderRadius: 2.5,
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'rgba(197, 155, 39, 0.4)'
                  }
                }}
              >
                {/* Comment Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        bgcolor: 'secondary.main',
                        color: '#FFF'
                      }}
                    >
                      {(c.author || 'S').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {c.author || 'Staff Member'}
                        </Typography>
                        <Chip
                          label={badge.label}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: badge.bg,
                            color: badge.color
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>{c.date || dayjs(c.createdAt).format('DD/MM/YYYY')} at {c.time || dayjs(c.createdAt).format('hh:mm A')}</span>
                        {c.isEdited && (
                          <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>(edited)</span>
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions (Edit / Delete) */}
                  {!isEditing && userCanModify && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit Comment">
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(c)}
                          sx={{ color: '#64748B', '&:hover': { color: 'secondary.main' } }}
                        >
                          <EditIcon fontSize="small" sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Comment">
                        <IconButton
                          size="small"
                          onClick={() => handleConfirmDelete(c)}
                          sx={{ color: '#64748B', '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteOutlineIcon fontSize="small" sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                {/* Comment Body */}
                {isEditing ? (
                  <Box sx={{ mt: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      sx={{ mb: 1.5, bgcolor: '#FFF' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<CloseIcon />}
                        onClick={handleCancelEdit}
                        disabled={updateClientMutation.isPending}
                        sx={{ textTransform: 'none' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={updateClientMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
                        onClick={() => handleSaveEdit(c.id)}
                        disabled={updateClientMutation.isPending || !editingText.trim()}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
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
                      wordBreak: 'break-word',
                      lineHeight: 1.6,
                      pl: 0.5
                    }}
                  >
                    {c.text}
                  </Typography>
                )}
              </Paper>
            );
          })}

          {rawComments.length === 0 && (
            <Box
              sx={{
                py: 4,
                textAlign: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 2.5,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <CommentIcon sx={{ fontSize: 36, color: '#94A3B8', mb: 1, opacity: 0.6 }} />
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No case comments yet
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Add your first internal note or comment above to keep track of case updates.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1, maxWidth: 420 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          Delete Case Comment?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontSize: '0.9rem' }}>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
          {commentToDelete && (
            <Paper sx={{ mt: 2, p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#64748B', mb: 0.5 }}>
                {commentToDelete.author} ({commentToDelete.date})
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic', fontSize: '0.85rem' }}>
                "{commentToDelete.text}"
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteComment}
            color="error"
            variant="contained"
            disabled={updateClientMutation.isPending}
            startIcon={updateClientMutation.isPending ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {updateClientMutation.isPending ? 'Deleting...' : 'Delete Comment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientCommentsSection;
