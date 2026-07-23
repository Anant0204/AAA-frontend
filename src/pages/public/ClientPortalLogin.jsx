import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { useAlert } from '../../contexts/AlertContext';
import { dbService } from '../../services/dbService';
import spainSevillePlaza from '../../assets/spain_seville_plaza.png';

const LOGIN_TRANSLATIONS = {
  English: {
    title: "Client Portal",
    subtitle: "Sign in to upload and manage your documents.",
    username_label: "Username (Client ID)",
    password_label: "Password",
    login_btn: "Log In",
    quick_login: "DEMO QUICK LOGIN",
    support_text: "If you have issues logging in, please contact your Case Manager.",
    elena_btn: "Client: Elena (Golden Visa)",
    chloe_btn: "Client: Chloe (Study Visa)"
  },
  Arabic: {
    title: "بوابة العميل",
    subtitle: "سجل الدخول لتحميل وإدارة مستنداتك.",
    username_label: "اسم المستخدم (معرف العميل)",
    password_label: "كلمة المرور",
    login_btn: "تسجيل الدخول",
    quick_login: "تسجيل دخول سريع تجريبي",
    support_text: "إذا واجهت مشاكل في تسجيل الدخول، يرجى الاتصال بمدير الحالة الخاص بك.",
    elena_btn: "العميل: إلينا (الفيزا الذهبية)",
    chloe_btn: "العميل: كلوي (فيزا الدراسة)"
  },
  Spanish: {
    title: "Portal del Cliente",
    subtitle: "Inicie sesión para cargar y administrar sus documentos.",
    username_label: "Nombre de usuario (ID de cliente)",
    password_label: "Contraseña",
    login_btn: "Iniciar Sesión",
    quick_login: "INICIO DE SESIÓN RÁPIDO DE DEMO",
    support_text: "Si tiene problemas para iniciar sesión, comuníquese con su administrador de casos.",
    elena_btn: "Cliente: Elena (Visa Dorada)",
    chloe_btn: "Cliente: Chloe (Visa de Estudios)"
  },
  French: {
    title: "Portail Client",
    subtitle: "Connectez-vous pour télécharger et gérer vos documents.",
    username_label: "Nom d'utilisateur (Identifiant client)",
    password_label: "Mot de passe",
    login_btn: "Se Connecter",
    quick_login: "CONNEXION RAPIDE DEMO",
    support_text: "Si vous rencontrez des problèmes de connexion, veuillez contacter votre gestionnaire de dossier.",
    elena_btn: "Client: Elena (Visa Doré)",
    chloe_btn: "Client: Chloe (Visa d'Études)"
  },
  German: {
    title: "Kundenportal",
    subtitle: "Melden Sie sich an, um Ihre Dokumente hochzuladen und zu verwalten.",
    username_label: "Benutzername (Kunden-ID)",
    password_label: "Passwort",
    login_btn: "Einloggen",
    quick_login: "DEMO SCHNELLLOGIN",
    support_text: "Wenn Sie Probleme beim Einloggen haben, wenden Sie sich bitte an Ihren Fallmanager.",
    elena_btn: "Kunde: Elena (Golden Visa)",
    chloe_btn: "Kunde: Chloe (Visum für Studium)"
  },
  Urdu: {
    title: "کلائنٹ پورٹل",
    subtitle: "اپنی دستاویزات اپ لوڈ اور ان کا انتظام کرنے کے لیے سائن ان کریں۔",
    username_label: "صارف نام (کلائنٹ ID)",
    password_label: "پاس ورڈ",
    login_btn: "لاگ ان کریں",
    quick_login: "ڈیمو فوری لاگ ان",
    support_text: "اگر آپ کو لاگ ان کرنے میں کوئی مسئلہ درپیش ہے تو براہ کرم اپنے کیس مینیجر سے رابطہ کریں۔",
    elena_btn: "کلائنٹ: ایلینا (گولڈن ویزا)",
    chloe_btn: "کلائنٹ: کلوئی (اسٹڈی ویزا)"
  }
};

export const ClientPortalLogin = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginLang, setLoginLang] = useState(() => {
    return localStorage.getItem('client-portal-lang') || 'English';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search || window.location.hash.substring(window.location.hash.indexOf('?')));
    const urlClientId = params.get('clientId');
    const urlTempPassword = params.get('tempPassword');
    const successMsg = params.get('success');
    if (urlClientId) setUsername(urlClientId);
    if (urlTempPassword) setPassword(urlTempPassword);
    if (successMsg) {
      showAlert('Payment Successful! Your account has been created. Please log in using the credentials below.', 'success');
    }
  }, [showAlert]);

  const changeLanguage = (newLang) => {
    setLoginLang(newLang);
    localStorage.setItem('client-portal-lang', newLang);
  };

  const t = (key) => {
    if (LOGIN_TRANSLATIONS[loginLang] && LOGIN_TRANSLATIONS[loginLang][key]) {
      return LOGIN_TRANSLATIONS[loginLang][key];
    }
    return LOGIN_TRANSLATIONS['English'][key] || key;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showAlert('Please enter both username and password.', 'error');
      return;
    }
    setIsLoading(true);
    const clientId = username.trim();
    try {
      const res = await dbService.clientLogin(clientId, password);
      localStorage.setItem('clientToken', res.token);
      localStorage.setItem('clientData', JSON.stringify(res.client));
      showAlert('Login successful! Welcome to the Client Portal.', 'success');
      if (res.client.isTemporaryPassword) {
        navigate('/portal/change-password');
      } else {
        navigate(`/portal/documents/${res.client.id}`);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Login failed. Invalid credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (requestedId) => {
    setIsLoading(true);
    let targetId = requestedId;
    
    // If dummy ID passed, map to existing DB client email/ID
    if (requestedId === 'CL2001') targetId = 'radhee@gmail.com';
    if (requestedId === 'CL2002') targetId = 'chloe@gmail.com';

    setUsername(targetId);
    setPassword('password123');
    try {
      const res = await dbService.clientLogin(targetId, 'password123');
      localStorage.setItem('clientToken', res.token);
      localStorage.setItem('clientData', JSON.stringify(res.client));
      showAlert('Login successful! Welcome to the Client Portal.', 'success');
      if (res.client.isTemporaryPassword) {
        navigate('/portal/change-password');
      } else {
        navigate(`/portal/documents/${res.client.id}`);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Quick login failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = loginLang === 'Arabic' || loginLang === 'Urdu';

  return (
    <Box
      dir={isRTL ? 'rtl' : 'ltr'}
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      {/* Full-screen Spain background */}
      <Box
        component="img"
        src={spainSevillePlaza}
        alt="Spain"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0
        }}
      />

      {/* Dark navy gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(5,26,59,0.92) 0%, rgba(5,26,59,0.75) 50%, rgba(197,155,39,0.25) 100%)',
          zIndex: 1
        }}
      />

      {/* Decorative gold orbs */}
      <Box sx={{
        position: 'absolute', top: '10%', right: '8%',
        width: 220, height: 220,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(197,155,39,0.18) 0%, transparent 70%)',
        zIndex: 1, filter: 'blur(10px)'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '15%', left: '6%',
        width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(197,155,39,0.12) 0%, transparent 70%)',
        zIndex: 1, filter: 'blur(16px)'
      }} />

      {/* Language Switcher — top right */}
      <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <FormControl size="small">
          <Select
            value={loginLang}
            onChange={(e) => changeLanguage(e.target.value)}
            startAdornment={<PublicIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', mr: 0.5 }} />}
            sx={{
              borderRadius: 2.5,
              height: 38,
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'white',
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
          >
            <MenuItem value="English">English 🇺🇸</MenuItem>
            <MenuItem value="Arabic">العربية 🇦🇪</MenuItem>
            <MenuItem value="Spanish">Español 🇪🇸</MenuItem>
            <MenuItem value="French">Français 🇫🇷</MenuItem>
            <MenuItem value="German">Deutsch 🇩🇪</MenuItem>
            <MenuItem value="Urdu">Urdu 🇵🇰</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Left branding panel (hidden on small screens) */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          maxWidth: 520,
          px: 8,
          position: 'relative',
          zIndex: 2,
          color: 'white',
          mr: 4
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            background: 'linear-gradient(135deg, #051A3B 0%, #C59B27 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: '1.3rem',
            boxShadow: '0 4px 16px rgba(197,155,39,0.35)',
            fontFamily: 'Outfit, sans-serif'
          }}>
            A³
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'white', lineHeight: 1.1 }}>
              AA Visa Consultancy
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
              Spain Relocation Specialists
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h2"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: { lg: '2.8rem', xl: '3.2rem' },
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            mb: 2.5,
            color: 'white'
          }}
        >
          Your Spain Dream
          <Box component="span" sx={{ display: 'block', color: '#E5C058' }}>
            Starts Here. 🇪🇸
          </Box>
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontWeight: 400, maxWidth: 400, mb: 5 }}>
          Manage your visa documents, track your application status, and communicate with your dedicated case manager — all in one secure portal.
        </Typography>

        {/* Feature bullets */}
        {[
          { icon: '🔐', text: 'Secure encrypted document storage' },
          { icon: '📊', text: 'Real-time application tracking' },
          { icon: '🌍', text: 'Available in 6 languages' },
          { icon: '⚡', text: 'Instant case manager notifications' }
        ].map((item, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 36, height: 36,
              borderRadius: 2,
              bgcolor: 'rgba(197,155,39,0.15)',
              border: '1px solid rgba(197,155,39,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0
            }}>
              {item.icon}
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              {item.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Login Card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 440,
          mx: { xs: 2, lg: 0 },
          mr: { lg: 8 }
        }}
      >
        <Paper
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 5,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            textAlign: isRTL ? 'right' : 'left'
          }}
        >
          {/* Card Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 64, height: 64,
              mx: 'auto',
              mb: 2.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #051A3B 0%, #1a3a6e 50%, #C59B27 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(197,155,39,0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, transparent 40%, rgba(197,155,39,0.3) 100%)'
              }} />
              <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: 'white', fontFamily: 'Outfit, sans-serif', position: 'relative' }}>
                A³
              </Typography>
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif', mb: 0.5 }}
            >
              {t('title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
              {t('subtitle')}
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label={t('username_label')}
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. CL2001"
                inputProps={{ dir: 'ltr', style: { textAlign: isRTL ? 'right' : 'left' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.07)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(197,155,39,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#C59B27', borderWidth: 2 }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#C59B27' },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.3)' }
                }}
              />

              <TextField
                label={t('password_label')}
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{ dir: 'ltr', style: { textAlign: isRTL ? 'right' : 'left' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.07)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(197,155,39,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#C59B27', borderWidth: 2 }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#C59B27' }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                startIcon={<LockOutlinedIcon />}
                sx={{
                  mt: 0.5,
                  py: 1.6,
                  borderRadius: 3,
                  fontWeight: 900,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontFamily: 'Outfit, sans-serif',
                  background: 'linear-gradient(135deg, #C59B27 0%, #E5C058 50%, #C59B27 100%)',
                  backgroundSize: '200% 200%',
                  color: '#051A3B',
                  boxShadow: '0 6px 24px rgba(197,155,39,0.45)',
                  letterSpacing: '0.01em',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #E5C058 0%, #C59B27 50%, #E5C058 100%)',
                    boxShadow: '0 8px 30px rgba(197,155,39,0.6)',
                    transform: 'translateY(-1px)'
                  },
                  '&:active': { transform: 'translateY(0)' }
                }}
              >
                {isLoading ? 'Signing in...' : t('login_btn')}
              </Button>
            </Box>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.12)' }}>
            <Chip
              label={t('quick_login')}
              size="small"
              sx={{
                fontSize: '0.6rem',
                fontWeight: 800,
                bgcolor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.12)',
                letterSpacing: '0.05em'
              }}
            />
          </Divider>

          {/* Quick Login Buttons */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => handleQuickLogin('CL2001')}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: 2.5,
                py: 1.1,
                color: 'rgba(255,255,255,0.8)',
                borderColor: 'rgba(255,255,255,0.2)',
                bgcolor: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  borderColor: '#C59B27',
                  color: '#E5C058',
                  bgcolor: 'rgba(197,155,39,0.08)'
                }
              }}
            >
              {t('elena_btn')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => handleQuickLogin('CL2002')}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: 2.5,
                py: 1.1,
                color: 'rgba(255,255,255,0.8)',
                borderColor: 'rgba(255,255,255,0.2)',
                bgcolor: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  borderColor: '#C59B27',
                  color: '#E5C058',
                  bgcolor: 'rgba(197,155,39,0.08)'
                }
              }}
            >
              {t('chloe_btn')}
            </Button>
          </Box>

          {/* Support Text */}
          <Box sx={{ mt: 3.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, fontWeight: 400 }}>
              {t('support_text')}
            </Typography>
          </Box>
        </Paper>

        {/* Below card trust badge */}
        <Box sx={{ textAlign: 'center', mt: 2.5, display: 'flex', justifyContent: 'center', gap: 3 }}>
          {['🔒 SSL Encrypted', '🇪🇸 Spain Licensed', '⭐ ISO Certified'].map((badge, idx) => (
            <Typography key={idx} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.65rem' }}>
              {badge}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ClientPortalLogin;
