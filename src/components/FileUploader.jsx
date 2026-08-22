import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useAlert } from '../contexts/AlertContext';

const CATEGORIES = [
  'Passport',
  'Bank Statement',
  'Employment Letter',
  'Marriage Certificate',
  'Education Documents',
  'Other (Specify Custom Document)',
];

export const FileUploader = ({ 
  onUpload, 
  clientId, 
  clientName, 
  categories, 
  existingDocs = [],
  requirePassportFirst = false,
  stagedPassport = false,
  initialPassportNumber = '',
  isLoading = false 
}) => {
  const baseCategories = Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES;
  const selectCategories = baseCategories.includes('Other (Specify Custom Document)')
    ? baseCategories
    : [...baseCategories, 'Other (Specify Custom Document)'];

  // Passport is considered "present" if it's already in DB (and NOT rejected) OR staged (not yet batch-submitted)
  const hasPassportUploaded = stagedPassport || (Array.isArray(existingDocs) && existingDocs.some(d => {
    const isRejected = (d.status || d.verificationStatus || '').toLowerCase().includes('reject') || d.rejected === true;
    if (isRejected) return false;
    return (d.category || d.name || '').toLowerCase().includes('passport');
  }));

  const isPassportMandatoryFirst = requirePassportFirst && !hasPassportUploaded;
  const passportCat = selectCategories.find(c => c.toLowerCase().includes('passport')) || selectCategories[0];

  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(isPassportMandatoryFirst ? passportCat : (selectCategories[0] || 'Passport'));
  const [customCategory, setCustomCategory] = useState('');
  const [passportNumber, setPassportNumber] = useState(initialPassportNumber || '');
  const { showAlert } = useAlert();

  React.useEffect(() => {
    if (initialPassportNumber) {
      setPassportNumber(initialPassportNumber);
    }
  }, [initialPassportNumber]);

  const isCustom = category === 'Other (Specify Custom Document)' || category === 'Others' || category === 'Other';

  React.useEffect(() => {
    if (isPassportMandatoryFirst) {
      setCategory(passportCat);
    } else if (selectCategories.length > 0 && !selectCategories.includes(category)) {
      setCategory(selectCategories[0]);
    }
  }, [categories, isPassportMandatoryFirst, passportCat]);

  // Effect to reset local file state when isLoading transitions from true -> false (upload finishes)
  const prevIsLoading = React.useRef(isLoading);
  React.useEffect(() => {
    if (prevIsLoading.current && !isLoading) {
      setFile(null);
      setCustomCategory('');
    }
    prevIsLoading.current = isLoading;
  }, [isLoading]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (isLoading) return;
    if (rejectedFiles && rejectedFiles.length > 0) {
      const errorMsg = rejectedFiles[0].errors[0]?.message || 'Invalid file format or file size too large';
      showAlert(errorMsg, 'error');
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      // Only auto-switch category if category is not custom and passport is not locked
      if (!isCustom) {
        if (isPassportMandatoryFirst) {
          setCategory(passportCat);
        } else {
          const lowerFile = selectedFile.name.toLowerCase();
          const matched = selectCategories.find(c => c !== 'Other (Specify Custom Document)' && c !== 'Others' && lowerFile.includes(c.toLowerCase().split(' ')[0]));
          if (matched) {
            setCategory(matched);
          }
        }
      }
      showAlert(`File "${selectedFile.name}" selected. Click Upload to submit.`, 'info');
    }
  }, [showAlert, selectCategories, isLoading, isCustom, isPassportMandatoryFirst, passportCat]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    multiple: false,
    disabled: isLoading,
  });

  const handleUploadSubmit = () => {
    if (!file) {
      showAlert('Please select or drag a file to upload.', 'warning');
      return;
    }

    if (isPassportMandatoryFirst && !category.toLowerCase().includes('passport')) {
      showAlert('Passport (Copy) is mandatory! Please upload your Passport first to unlock other categories.', 'warning');
      return;
    }

    if (isCustom && !customCategory.trim()) {
      showAlert('Please enter a custom document name in the input box.', 'warning');
      return;
    }

    if (category.toLowerCase().includes('passport') && !passportNumber.trim()) {
      showAlert('Please enter the official Passport Number before attaching the passport.', 'warning');
      return;
    }

    const finalCategory = isCustom ? (customCategory.trim() || 'Other Custom Document') : category;

    const docData = {
      file,          // actual File object for FormData upload
      clientId,
      clientName,
      category: finalCategory,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      passportNumber: category.toLowerCase().includes('passport') ? passportNumber.trim() : undefined
    };

    onUpload(docData);

    // Clear the file preview immediately — staging is synchronous so isLoading never fires
    setFile(null);
    setCustomCategory('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {isPassportMandatoryFirst && (
        <Box
          sx={{
            p: 1.5,
            px: 2,
            bgcolor: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Typography variant="body2" sx={{ color: '#991B1B', fontWeight: 800, fontSize: '0.825rem' }}>
            ⚠️ Passport (Copy) is mandatory! You must upload your Passport first before unlocking other document categories.
          </Typography>
        </Box>
      )}

      <FormControl fullWidth size="small" disabled={isLoading}>
        <InputLabel id="upload-doc-category-label">Document Category</InputLabel>
        <Select
          labelId="upload-doc-category-label"
          value={isPassportMandatoryFirst ? passportCat : category}
          label="Document Category"
          onChange={(e) => {
            if (isPassportMandatoryFirst && !e.target.value.toLowerCase().includes('passport')) {
              showAlert('Passport (Copy) is mandatory! Please upload your Passport first to unlock other categories.', 'warning');
              return;
            }
            setCategory(e.target.value);
          }}
        >
          {selectCategories.map((cat) => {
            const isPassportOption = cat.toLowerCase().includes('passport');
            const isDisabledOption = isPassportMandatoryFirst && !isPassportOption;
            return (
              <MenuItem key={cat} value={cat} disabled={isDisabledOption}>
                {cat} {isDisabledOption ? ' 🔒 (Passport Required First)' : ''}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {category.toLowerCase().includes('passport') && (
        <TextField
          fullWidth
          size="small"
          label="Passport Number *"
          placeholder="e.g. A12345678"
          value={passportNumber}
          onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
          helperText="Enter the official passport number as printed on the applicant's photo page."
          InputLabelProps={{ shrink: true }}
          inputProps={{ style: { fontWeight: 700, letterSpacing: '0.8px' } }}
          disabled={isLoading}
          sx={{
            bgcolor: '#FFFDF7',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      )}

      {isCustom && (
        <TextField
          fullWidth
          size="small"
          label="Specify Document Name *"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          placeholder="e.g. Tax Return 2025, Lease Agreement, Birth Certificate..."
          disabled={isLoading}
          required
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1
          }}
        />
      )}

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'secondary.main' : 'divider',
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          cursor: isLoading ? 'default' : 'pointer',
          backgroundColor: isDragActive ? 'background.neutral' : 'background.paper',
          opacity: isLoading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          ...(!isLoading && {
            '&:hover': {
              borderColor: 'secondary.main',
              backgroundColor: 'background.neutral',
            },
          }),
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {isDragActive ? 'Drop your file here' : 'Drag & drop your file here, or click to browse'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supports PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)
        </Typography>
      </Box>

      {file && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.neutral',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsertDriveFileIcon color="secondary" />
            <Box>
              <Typography variant="subtitle2" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleUploadSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;
