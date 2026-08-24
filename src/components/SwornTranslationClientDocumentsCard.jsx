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

const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

const getFullDocUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

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
      formData.append('file', file);
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
              const originalDocUrl = getFullDocUrl(doc.url || doc.fileUrl);
              const translatedDocUrl = getFullDocUrl(doc.translatedUrl);
              const hasTranslation = Boolean(doc.translatedUrl);
              const isUploadingThis = uploadingDocId === doc.id;

              const rawLang = doc.documentLanguage || doc.sourceLanguage || '';
              let docLang = rawLang && !rawLang.includes(',') ? rawLang : '';
              if (!docLang && client?.lead?.qualificationData?.documents) {
                const qualDocs = client.lead.qualificationData.documents;
                const match = Array.isArray(qualDocs) && qualDocs.find(d =>
                  (d.name && doc.name && (d.name === doc.name || doc.name.includes(d.name) || d.name.includes(doc.name))) ||
                  (d.filename && doc.name && (d.filename === doc.name || doc.name.includes(d.filename) || d.filename.includes(doc.name)))
                );
                if (match && (match.documentLanguage || match.sourceLanguage)) {
                  docLang = match.documentLanguage || match.sourceLanguage;
                }
              }
              if (!docLang && client?.sourceLanguage) {
                const clientLangs = String(client.sourceLanguage).split(',').map(l => l.trim()).filter(Boolean);
                if (clientLangs.length > 0) {
                  docLang = clientLangs[idx % clientLangs.length];
                }
              }
              if (!docLang) docLang = 'English';

              const targetLang = 'Spanish (Español)';
              const wordCount = doc.wordCount || (clientDocs.length === 1 ? client?.wordCount : 0) || 0;
              const rate = docLang.toLowerCase().includes('urdu') ? 0.40 : docLang.toLowerCase().includes('arabic') ? 0.25 : 0.15;
              const subtotal = parseFloat((wordCount * rate).toFixed(2));
              const vat = parseFloat((subtotal * 0.05).toFixed(2));
              const estimatedPrice = parseFloat((subtotal + vat).toFixed(2));

              const isStaffUpload = doc.belongsTo === 'Staff Upload' || doc.uploadedByRole === 'agent' || doc.uploadedByRole === 'staff';
              const uploaderLabel = isStaffUpload ? '👨‍💼 Staff / Translator' : `👤 Client (${client ? `${client.firstName} ${client.lastName}` : 'Client'})`;
              const formattedDate = doc.uploadedDate || doc.createdAt
                ? new Date(doc.uploadedDate || doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <Paper
                  key={doc.id || idx}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1.5px solid',
                    borderColor: hasTranslation ? 'rgba(16, 185, 129, 0.35)' : 'rgba(197, 155, 39, 0.25)',
                    bgcolor: hasTranslation ? '#F0FDF4' : '#FFFDF7',
                    boxShadow: 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    {/* Left: Original File Details & Badges */}
                    <Box sx={{ flex: 1, minWidth: 280 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#051A3B', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                          📄 #{idx + 1} {doc.name || 'Document.pdf'}
                        </Typography>
                        <Chip
                          label={doc.category || 'Passport'}
                          size="small"
                          sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: 'rgba(5, 26, 59, 0.08)', color: '#051A3B' }}
                        />
                        <Chip
                          label={uploaderLabel}
                          size="small"
                          sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: isStaffUpload ? 'rgba(59, 130, 246, 0.1)' : 'rgba(197, 155, 39, 0.15)', color: isStaffUpload ? '#1D4ED8' : '#92400E' }}
                        />
                      </Box>

                      {/* Language, Words & Date Metadata Row */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, alignItems: 'center' }}>
                        <Chip
                          label={`🌐 ${docLang} ➔ ${targetLang} 🇪🇸`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 24, fontSize: '0.72rem', fontWeight: 800, borderColor: '#C59B27', color: '#051A3B' }}
                        />
                        {wordCount > 0 && (
                          <Chip
                            label={`📝 ${wordCount} words (@ €${rate.toFixed(2)}/word)`}
                            size="small"
                            sx={{ height: 24, fontSize: '0.72rem', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#047857' }}
                          />
                        )}
                        {doc.size && (
                          <Chip
                            label={`💾 ${doc.size}`}
                            size="small"
                            sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.04)', color: '#64748B' }}
                          />
                        )}
                        {formattedDate && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.72rem' }}>
                            🕒 {formattedDate}
                          </Typography>
                        )}
                      </Box>

                      {/* Lead-style financial breakdown */}
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 1 }}>
                        Subtotal: <strong>€{subtotal.toFixed(2)}</strong> + 5% VAT (<strong>€{vat.toFixed(2)}</strong>) = <strong style={{ color: '#059669', fontSize: '0.88rem' }}>€{estimatedPrice.toFixed(2)}</strong>
                      </Typography>

                      {doc.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                          {doc.notes}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        {originalDocUrl && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              href={originalDocUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.78rem' }}
                            >
                              View Original
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              href={originalDocUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.78rem' }}
                            >
                              Download Original
                            </Button>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Right: Translated Document Management */}
                    <Box sx={{ flex: 1, minWidth: 280, p: 2.2, bgcolor: 'background.paper', borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.08)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Official Translated PDF (Traducción Jurada)
                        </Typography>
                        <Chip
                          label={hasTranslation ? 'DELIVERED' : 'PENDING STAMP'}
                          size="small"
                          color={hasTranslation ? 'success' : 'warning'}
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }}
                        />
                      </Box>

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
                              href={translatedDocUrl}
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
                            ⏳ Awaiting official translation upload. Once translated by sworn translator with official ministry stamps, upload the certified PDF below.
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
