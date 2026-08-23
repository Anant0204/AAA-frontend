import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { dbService } from '../services/dbService';
import { useAlert } from '../contexts/AlertContext';

const SwornTranslationClientDocumentsCard = ({ client, documents = [] }) => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [addingNewDoc, setAddingNewDoc] = useState(false);

  const clientDocs = (documents || []).filter(
    (d) => d && (d.clientId === client?.id || d.leadId === client?.leadId)
  );

  const uploadTranslatedMutation = useMutation({
    mutationFn: async ({ documentId, file }) => {
      return await dbService.uploadTranslatedDocument(documentId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['client', client?.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Certified Sworn Translation PDF uploaded and published to client portal!', 'success');
      setUploadingDocId(null);
    },
    onError: (err) => {
      console.error('Error uploading translated document:', err);
      showAlert(err.response?.data?.message || 'Failed to upload translated document', 'error');
      setUploadingDocId(null);
    }
  });

  const handleFileUpload = (docId, file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      showAlert('Please upload an official certified PDF file (.pdf)', 'warning');
      return;
    }
    setUploadingDocId(docId);
    uploadTranslatedMutation.mutate({ documentId: docId, file });
  };

  const uploadNewDocMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('clientId', client.id);
      formData.append('category', 'Sworn Translation');
      formData.append('name', file.name);
      return await dbService.uploadDocument(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['client', client?.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showAlert('Document uploaded successfully!', 'success');
      setAddingNewDoc(false);
    },
    onError: (err) => {
      showAlert(err.response?.data?.message || 'Failed to upload document', 'error');
      setAddingNewDoc(false);
    }
  });

  const allCompleted = clientDocs.length > 0 && clientDocs.every((d) => d.translatedUrl || d.status === 'Translated');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Info Card */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3.5,
          border: '1.5px solid rgba(197, 155, 39, 0.3)',
          bgcolor: 'rgba(250, 246, 237, 0.65)',
          boxShadow: '0 4px 20px rgba(5, 26, 59, 0.03)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: '#051A3B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C59B27'
              }}
            >
              <GTranslateIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
                Spanish Sworn Translation Management (Traducción Jurada Oficial)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Upload the finalized certified translation with official ministry stamps. Client can view and download immediately.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={allCompleted ? <CheckCircleIcon sx={{ fontSize: '1rem !important' }} /> : <HourglassEmptyIcon sx={{ fontSize: '1rem !important' }} />}
              label={allCompleted ? 'All Translations Delivered' : 'Translation In Progress'}
              color={allCompleted ? 'success' : 'warning'}
              sx={{ fontWeight: 800, fontSize: '0.8rem' }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'rgba(197, 155, 39, 0.2)' }} />

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
              Target Language Pair
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B' }}>
              {client?.sourceLanguage || 'English'} ➔ {client?.targetLanguage || 'Spanish (Español)'} 🇪🇸
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
              Word Count
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#051A3B' }}>
              {client?.wordCount || 'N/A'} words
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
              Status
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#10B981' }}>
              Payment Completed ✓
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Documents List & Translation Uploaders */}
      <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'background.paper', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#051A3B', fontFamily: 'Outfit, sans-serif' }}>
            Translation Documents ({clientDocs.length})
          </Typography>

          <Button
            size="small"
            variant="outlined"
            component="label"
            startIcon={addingNewDoc ? <CircularProgress size={16} /> : <UploadFileIcon />}
            disabled={addingNewDoc}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {addingNewDoc ? 'Uploading...' : '+ Add Another Document'}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setAddingNewDoc(true);
                  uploadNewDocMutation.mutate(e.target.files[0]);
                }
              }}
            />
          </Button>
        </Box>

        {clientDocs.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No documents found for this client yet. You can click <strong>"+ Add Another Document"</strong> above to upload the client's source document.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {clientDocs.map((doc, idx) => {
              const hasTranslation = Boolean(doc.translatedUrl);
              const isUploadingThis = uploadingDocId === doc.id;

              return (
                <Paper
                  key={doc.id || idx}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1.5px solid',
                    borderColor: hasTranslation ? 'rgba(16, 185, 129, 0.3)' : 'rgba(197, 155, 39, 0.25)',
                    bgcolor: hasTranslation ? '#F0FDF4' : '#FFFDF7',
                    boxShadow: 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    {/* Left: Original File Details */}
                    <Box sx={{ flex: 1, minWidth: 260 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#051A3B', fontSize: '0.95rem' }}>
                          📄 #{idx + 1} {doc.name || 'Document.pdf'}
                        </Typography>
                        <Chip
                          label={doc.category || 'Sworn Translation'}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(5, 26, 59, 0.08)' }}
                        />
                      </Box>

                      {doc.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                          {doc.notes}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {doc.fileUrl && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem' }}
                            >
                              View Original
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              href={doc.fileUrl}
                              download
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem' }}
                            >
                              Download Original
                            </Button>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Right: Translated Document Management */}
                    <Box sx={{ flex: 1, minWidth: 280, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                        Official Translated PDF (Traducción Jurada)
                      </Typography>

                      {hasTranslation ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#166534' }}>
                              Certified Translation Uploaded & Delivered
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<DownloadIcon />}
                              href={doc.translatedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5, fontSize: '0.78rem' }}
                            >
                              View / Download Translation
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              component="label"
                              disabled={isUploadingThis}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem' }}
                            >
                              {isUploadingThis ? 'Uploading...' : '🔄 Replace PDF'}
                              <input
                                type="file"
                                hidden
                                accept=".pdf"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    handleFileUpload(doc.id, e.target.files[0]);
                                  }
                                }}
                              />
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#92400E', fontSize: '0.8rem' }}>
                            ⏳ Awaiting official translation upload. Once translated by sworn translator, upload the certified PDF below.
                          </Typography>

                          <Button
                            variant="contained"
                            component="label"
                            startIcon={isUploadingThis ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
                            disabled={isUploadingThis}
                            sx={{
                              bgcolor: '#051A3B',
                              color: 'white',
                              textTransform: 'none',
                              fontWeight: 800,
                              borderRadius: 2,
                              fontSize: '0.8rem',
                              '&:hover': { bgcolor: '#C59B27' }
                            }}
                          >
                            {isUploadingThis ? 'Uploading Translation...' : '📤 Upload Certified Translated PDF'}
                            <input
                              type="file"
                              hidden
                              accept=".pdf"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  handleFileUpload(doc.id, e.target.files[0]);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SwornTranslationClientDocumentsCard;
