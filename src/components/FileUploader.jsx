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
import { useAlert } from '../contexts/AlertContext';

const CATEGORIES = [
  'Passport',
  'Bank Statement',
  'Employment Letter',
  'Marriage Certificate',
  'Education Documents',
  'Others',
];

const autoDetectCategory = (filename) => {
  const name = filename.toLowerCase();
  if (name.includes('passport')) return 'Passport';
  if (name.includes('bank') || name.includes('statement') || name.includes('balance') || name.includes('financial')) return 'Bank Statement';
  if (name.includes('employment') || name.includes('job') || name.includes('letter') || name.includes('salary') || name.includes('work')) return 'Employment Letter';
  if (name.includes('marriage') || name.includes('spouse') || name.includes('wedding')) return 'Marriage Certificate';
  if (name.includes('education') || name.includes('degree') || name.includes('diploma') || name.includes('university') || name.includes('school') || name.includes('admission')) return 'Education Documents';
  return 'Others';
};

export const FileUploader = ({ onUpload, clientId, clientName, categories }) => {
  const selectCategories = Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES;
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(selectCategories[0] || 'Passport');
  const { showAlert } = useAlert();

  React.useEffect(() => {
    if (selectCategories.length > 0) {
      setCategory(selectCategories[0]);
    }
  }, [categories]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const errorMsg = rejectedFiles[0].errors[0]?.message || 'Invalid file format or file size too large';
      showAlert(errorMsg, 'error');
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      // Try to match file name to one of selectCategories
      const lowerFile = selectedFile.name.toLowerCase();
      const matched = selectCategories.find(c => lowerFile.includes(c.toLowerCase().split(' ')[0]));
      const detected = matched || selectCategories[0] || 'Passport';
      setCategory(detected);
      showAlert(`File "${selectedFile.name}" selected. Category set to "${detected}". Click Upload to submit.`, 'info');
    }
  }, [showAlert, selectCategories]);

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
  });

  const handleUploadSubmit = () => {
    if (!file) {
      showAlert('Please select or drag a file to upload.', 'warning');
      return;
    }

    const docData = {
      file,          // actual File object for FormData upload
      clientId,
      clientName,
      category,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    };

    onUpload(docData);
    setFile(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="upload-doc-category-label">Document Category</InputLabel>
        <Select
          labelId="upload-doc-category-label"
          value={category}
          label="Document Category"
          onChange={(e) => setCategory(e.target.value)}
        >
          {selectCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'secondary.main' : 'divider',
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'background.neutral' : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'secondary.main',
            backgroundColor: 'background.neutral',
          },
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
          <Button variant="contained" size="small" onClick={handleUploadSubmit}>
            Upload
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;
