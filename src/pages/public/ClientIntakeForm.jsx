import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import BusinessIcon from '@mui/icons-material/Business';

export const ClientIntakeForm = () => {
  const { clientId } = useParams();
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = useState(1); // 1: Payment Checkout, 2: Profiling & Upload, 3: Success Screen
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // Payment checkout form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // Client intake profiling form state
  const [passportNumber, setPassportNumber] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [nationality, setNationality] = useState('');
  const [preferredLang, setPreferredLang] = useState('English');

  // Selected files mapped by category
  const [uploadedFiles, setUploadedFiles] = useState({}); // { 'Passport (Copy)': FileObject }

  // Fetch Client
  const { data: client, isLoading: isClientLoading, error: clientError } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => dbService.getClientById(clientId),
    enabled: !!clientId
  });

  // Fetch Payments to find client invoice
  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ paymentId, status, paymentMethod, transactionId }) =>
      dbService.updatePaymentStatus(paymentId, status, paymentMethod, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const submitIntakeMutation = useMutation({
    mutationFn: ({ clientId, details, files }) =>
      dbService.submitClientIntake(clientId, details, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  // Find unpaid or paid invoice associated with client
  const clientInvoice = payments.find(p => p.clientId === clientId) || null;

  // Initialize step based on client status and invoice
  useEffect(() => {
    if (client) {
      if (client.status === 'Documents Pending') {
        // Step 2: Upload documents first
        setActiveStep(2);
      } else if (client.status === 'Waiting for Payment') {
        // Step 1: Pay now
        setActiveStep(1);
      } else if (clientInvoice && clientInvoice.status === 'Paid') {
        // Step 3: Success or Step 2 (if already paid)
        setActiveStep(3);
      } else {
        // Fallback default
        setActiveStep(2);
      }
    }
  }, [clientInvoice, client]);

  // Document checklist based on serviceId
  const REQUIRED_DOCUMENTS = {
    dnv: ['Passport (Copy)', 'Employment Verification Letter', 'Remote Income Bank Statements', 'Social Security Certificate'],
    nlv: ['Passport (Copy)', 'Spanish Health Insurance Policy', 'Clean Criminal Record Certificate', 'Savings Bank Statements'],
    study: ['Passport (Copy)', 'University Acceptance Letter', 'Sufficient Funds Statements', 'Medical Certificate'],
    family: ['Passport (Copy)', 'Marriage / Birth Certificates', 'Spanish Spouse ID', 'Financial Proof'],
    sworn_translation: ['Original Document (Clear Copy)'],
    property: ['Passport (Copy)', 'Spain Land Registry Certificate', 'Deed of Purchase', 'Bank Certificate'],
    default: ['Passport (Copy)', 'Application Form EX-01', 'Proof of Sufficient Funds']
  };

  const serviceId = client?.serviceId || 'default';
  const checklist = REQUIRED_DOCUMENTS[serviceId] || REQUIRED_DOCUMENTS['default'];

  // Populate initial values
  useEffect(() => {
    if (client) {
      setNationality(client.nationality || '');
      setPreferredLang(client.preferredLanguage || 'English');
    }
  }, [client]);

  if (isClientLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
        <CircularProgress color="secondary" />
        <Typography variant="body1" color="text.secondary">Loading secure intake portal...</Typography>
      </Box>
    );
  }

  if (clientError || !client) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 3 }}>
        <Alert severity="error" variant="filled">
          Secure portal link expired or invalid client ID. Please verify your portal URL.
        </Alert>
      </Box>
    );
  }

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    if (!clientInvoice) return;

    setPaymentLoading(true);
    setTimeout(() => {
      const transactionId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
      updatePaymentMutation.mutate({
        paymentId: clientInvoice.id,
        status: 'Paid',
        paymentMethod: 'Credit Card (Stripe Simulator)',
        transactionId
      }, {
        onSuccess: () => {
          setPaymentLoading(false);
          setPaymentSuccessMsg('Payment Successful! Retainer invoice marked paid.');
          setTimeout(() => {
            setActiveStep(2);
          }, 1500);
        },
        onError: () => {
          setPaymentLoading(false);
        }
      });
    }, 2000);
  };

  const handleFileChange = (category, e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [category]: {
          name: file.name,
          category: category,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          url: URL.createObjectURL(file) // Mock URL for previewing
        }
      }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Check if at least passport is uploaded
    if (!uploadedFiles['Passport (Copy)']) {
      alert('Please upload your Passport (Copy) to proceed.');
      return;
    }

    setSubmitLoading(true);
    const details = {
      passportNumber,
      dateOfBirth: dob,
      address,
      nationality,
      preferredLanguage: preferredLang
    };

    const filesArray = Object.values(uploadedFiles);

    setTimeout(() => {
      submitIntakeMutation.mutate({
        clientId: client.id,
        details,
        files: filesArray
      }, {
        onSuccess: () => {
          setSubmitLoading(false);
          setActiveStep(3);
        },
        onError: () => {
          setSubmitLoading(false);
        }
      });
    }, 2000);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0B0F19', color: '#F1F5F9', py: 6, px: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 750 }}>
        
        {/* Portal Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <BusinessIcon sx={{ fontSize: 40, color: '#D97706' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 0.5 }}>
              AAA Business Consultancy
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Secure Client Intake & Document Verification Portal
          </Typography>
        </Box>

        {/* STEP 1: PAYMENT GATEWAY SIMULATOR */}
        {activeStep === 1 && clientInvoice && (
          <Card sx={{ bgcolor: '#111827', border: '1px solid #1F2937', borderRadius: 4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'rgba(217, 119, 6, 0.1)', p: 3, borderBottom: '1px solid rgba(217, 119, 6, 0.2)', display: 'flex', justifyBetween: 'center', alignItems: 'center', gap: 2 }}>
              <CreditCardIcon sx={{ color: '#D97706', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FBBF24' }}>Retainer Invoice Checkout</Typography>
                <Typography variant="caption" color="text.secondary">Please complete your visa initiation payment to unlock the intake upload form.</Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Box className="grid grid-cols-12 gap-8">
                {/* Invoice Summary */}
                <Box className="col-span-12 md:col-span-5">
                  <Typography variant="subtitle2" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, mb: 2, letterSpacing: 0.5 }}>Invoice Details</Typography>
                  <Stack spacing={2} sx={{ p: 2, bgcolor: '#1F2937', borderRadius: 2, border: '1px solid #374151' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Invoice Number:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{clientInvoice.id}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Visa Package:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'right' }}>{clientInvoice.serviceId?.toUpperCase()} Application</Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#374151' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Subtotal:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>€{clientInvoice.amount}</Typography>
                    </Box>
                    {clientInvoice.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#EF4444' }}>
                        <Typography variant="caption">Discount:</Typography>
                        <Typography variant="caption">-€{clientInvoice.discount}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">VAT (5%):</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>€{(clientInvoice.amount * 0.05).toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#374151' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#FBBF24' }}>Total Payable:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#FBBF24' }}>
                        €{(clientInvoice.amount - (clientInvoice.discount || 0) + (clientInvoice.amount * 0.05)).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Stripe Card Simulator Fields */}
                <Box className="col-span-12 md:col-span-7">
                  <Typography variant="subtitle2" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, mb: 2, letterSpacing: 0.5 }}>Stripe Secure Payment</Typography>
                  <form onSubmit={handleSimulatePayment}>
                    <Stack spacing={2.5}>
                      {paymentSuccessMsg && (
                        <Alert severity="success" sx={{ bgcolor: '#064E3B', color: '#A7F3D0', border: '1px solid #047857' }}>
                          {paymentSuccessMsg}
                        </Alert>
                      )}

                      <TextField
                        label="Cardholder Full Name"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                        fullWidth
                        size="small"
                        placeholder="John Doe"
                        InputLabelProps={{ shrink: true }}
                        sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                      />

                      <TextField
                        label="Card Number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                      />

                      <Box className="grid grid-cols-12 gap-2">
                        <Box className="col-span-6">
                          <TextField
                            label="Expiration Date"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            required
                            fullWidth
                            size="small"
                            placeholder="MM/YY"
                            InputLabelProps={{ shrink: true }}
                            sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                          />
                        </Box>
                        <Box className="col-span-6">
                          <TextField
                            label="CVV"
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            required
                            fullWidth
                            size="small"
                            placeholder="123"
                            InputLabelProps={{ shrink: true }}
                            sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                          />
                        </Box>
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={paymentLoading}
                        fullWidth
                        sx={{
                          py: 1.5,
                          mt: 1,
                          fontWeight: 'bold',
                          bgcolor: '#D97706',
                          color: '#FFFFFF',
                          '&:hover': { bgcolor: '#B45309' },
                          textTransform: 'none'
                        }}
                      >
                        {paymentLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                            <span>Processing Secure Payment...</span>
                          </Box>
                        ) : (
                          `Pay €${(clientInvoice.amount - (clientInvoice.discount || 0) + (clientInvoice.amount * 0.05)).toFixed(2)}`
                        )}
                      </Button>

                      <Typography variant="caption" sx={{ color: '#6B7280', textAlign: 'center', display: 'block' }}>
                        🔒 256-bit SSL encrypted Stripe gateway test simulator.
                      </Typography>
                    </Stack>
                  </form>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: PROFILE DETAILS & DOCUMENT UPLOADS */}
        {activeStep === 2 && (
          <Card sx={{ bgcolor: '#111827', border: '1px solid #1F2937', borderRadius: 4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'rgba(217, 119, 6, 0.1)', p: 3, borderBottom: '1px solid rgba(217, 119, 6, 0.2)', display: 'flex', justifyBetween: 'center', alignItems: 'center', gap: 2 }}>
              <CloudUploadIcon sx={{ color: '#D97706', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FBBF24' }}>Client Profiling & File Intake Form</Typography>
                <Typography variant="caption" color="text.secondary">Please fill in your primary details and upload required documents below.</Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleFormSubmit}>
                <Typography variant="subtitle2" sx={{ color: '#FBBF24', textTransform: 'uppercase', fontWeight: 800, mb: 2, letterSpacing: 0.5 }}>1. Passport & Profile Information</Typography>
                <Box className="grid grid-cols-12 gap-5" sx={{ mb: 4 }}>
                  <Box className="col-span-12 sm:col-span-6">
                    <TextField
                      label="Passport Number"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      required
                      fullWidth
                      size="small"
                      placeholder="e.g. G1234567"
                      InputLabelProps={{ shrink: true }}
                      sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                    />
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <TextField
                      label="Date of Birth"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                    />
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <TextField
                      label="Nationality / Citizenship"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      required
                      fullWidth
                      size="small"
                      placeholder="e.g. United Kingdom"
                      InputLabelProps={{ shrink: true }}
                      sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                    />
                  </Box>
                  <Box className="col-span-12 sm:col-span-6">
                    <TextField
                      label="Preferred Language"
                      select
                      value={preferredLang}
                      onChange={(e) => setPreferredLang(e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiSelect-select': { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="Arabic">Arabic</MenuItem>
                      <MenuItem value="Russian">Russian</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                    </TextField>
                  </Box>
                  <Box className="col-span-12">
                    <TextField
                      label="Full Home Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Street, City, State, ZIP, Country"
                      InputLabelProps={{ shrink: true }}
                      sx={{ textarea: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' } } }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ borderColor: '#1F2937', mb: 3.5 }} />

                <Typography variant="subtitle2" sx={{ color: '#FBBF24', textTransform: 'uppercase', fontWeight: 800, mb: 2, letterSpacing: 0.5 }}>
                  2. Required Document Upload Checklist ({client.serviceId?.toUpperCase()})
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3, bgcolor: '#1E293B', color: '#93C5FD', border: '1px solid #2563EB', '& .MuiAlert-icon': { color: '#60A5FA' } }}>
                  Please upload clear scans. PDF or high-resolution images are accepted. **Passport is mandatory to submit.**
                </Alert>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  {checklist.map((category) => {
                    const hasUploaded = !!uploadedFiles[category];
                    const fileObj = uploadedFiles[category];

                    return (
                      <Paper
                        key={category}
                        sx={{
                          p: 2,
                          bgcolor: hasUploaded ? '#065F46' : '#1F2937',
                          border: hasUploaded ? '1px solid #10B981' : '1px dashed #374151',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 2,
                          transition: 'all 0.3s'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <InsertDriveFileIcon sx={{ color: hasUploaded ? '#A7F3D0' : '#9CA3AF' }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: hasUploaded ? '#FFFFFF' : '#E5E7EB' }}>
                              {category}
                            </Typography>
                            {hasUploaded ? (
                              <Typography variant="caption" sx={{ color: '#D1FAE5', display: 'block' }}>
                                File: {fileObj.name} ({fileObj.size})
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Drag & drop or click browse to upload
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Button
                          variant="contained"
                          component="label"
                          size="small"
                          color={hasUploaded ? 'success' : 'inherit'}
                          sx={{
                            textTransform: 'none',
                            bgcolor: hasUploaded ? '#10B981' : '#374151',
                            color: '#FFFFFF',
                            '&:hover': { bgcolor: hasUploaded ? '#059669' : '#4B5563' }
                          }}
                        >
                          {hasUploaded ? 'Change File' : 'Browse File'}
                          <input
                            type="file"
                            hidden
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileChange(category, e)}
                          />
                        </Button>
                      </Paper>
                    );
                  })}
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitLoading}
                  fullWidth
                  sx={{
                    py: 1.8,
                    fontWeight: 'bold',
                    bgcolor: '#D97706',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#B45309' },
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: '1rem'
                  }}
                >
                  {submitLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Submitting Intake Details...</span>
                    </Box>
                  ) : (
                    'Submit Profiling Form & Files'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: SUCCESS & RECEIPT CONFIRMATION */}
        {activeStep === 3 && (
          <Card sx={{ bgcolor: '#111827', border: '1px solid #1F2937', borderRadius: 4, p: 4, textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CheckCircleIcon sx={{ color: '#10B981', fontSize: 72 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: '#10B981' }}>Intake Submission Successful!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              Dear {client.firstName}, thank you for submitting your profiling questionnaire and uploading your visa documents. Your dedicated Case Officer has been notified.
            </Typography>

            <Box sx={{ maxWidth: 450, mx: 'auto', p: 3, bgcolor: '#1F2937', borderRadius: 3, border: '1px solid #374151', mb: 4, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ color: '#FBBF24', fontWeight: 800, mb: 1.5 }}>Receipt & Case Summary</Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Case ID:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{client.id}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Client Name:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{client.firstName} {client.lastName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Visa Track:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{client.serviceId?.toUpperCase()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Verification Status:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#FBBF24' }}>Pending Review</Typography>
                </Box>
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              You may close this browser window. Updates will be sent to your registered email and WhatsApp chat.
            </Typography>
          </Card>
        )}

      </Box>
    </Box>
  );
};

export default ClientIntakeForm;
