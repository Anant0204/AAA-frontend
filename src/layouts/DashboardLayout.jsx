import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Popover from '@mui/material/Popover';
import Collapse from '@mui/material/Collapse';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ForumIcon from '@mui/icons-material/Forum';
import GroupsIcon from '@mui/icons-material/Groups';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import CableIcon from '@mui/icons-material/Cable';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import PinterestIcon from '@mui/icons-material/Pinterest';
import ChatIcon from '@mui/icons-material/Chat';
import { io } from 'socket.io-client';

// Contexts & Hooks
import { useThemeMode } from '../contexts/ThemeContext';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../services/dbService';
import SearchBar from '../components/SearchBar';

const drawerWidth = 260;
const collapsedDrawerWidth = 72;

const MENU_TRANSLATIONS = {
  English: {
    Dashboard: "Dashboard",
    Agents: "Agents",
    "Active Cases": "Active Cases",
    "Doc Verification": "Doc Verification",
    Finance: "Finance",
    "Closed Cases": "Closed Cases",
    Clients: "Clients",
    Leads: "Leads",
    "Social Inbox": "Social Inbox",
    Marketing: "Marketing",
    Calendar: "Calendar",
    "All Agents Performance": "Agents Performance",
    Integrations: "Integrations",
    Logout: "Logout",
    "Search...": "Search...",
    "Global CRM search...": "Global CRM search..."
  },
  Arabic: {
    Dashboard: "لوحة القيادة",
    Agents: "الوكلاء",
    "Active Cases": "الحالات النشطة",
    "Doc Verification": "التحقق من المستندات",
    Finance: "المالية",
    "Closed Cases": "الحالات المغلقة",
    Clients: "العملاء",
    Leads: "العملاء المحتملون",
    "Social Inbox": "البريد الاجتماعي",
    Marketing: "التسويق",
    Calendar: "التقويم",
    "All Agents Performance": "أداء الوكلاء",
    Integrations: "التكاملات",
    Logout: "تسجيل الخروج",
    "Search...": "بحث...",
    "Global CRM search...": "بحث عام في CRM..."
  },
  Spanish: {
    Dashboard: "Tablero",
    Agents: "Agentes",
    "Active Cases": "Casos Activos",
    "Doc Verification": "Verificación de Docs",
    Finance: "Finanzas",
    "Closed Cases": "Casos Cerrados",
    Clients: "Clientes",
    Leads: "Prospectos",
    "Social Inbox": "Bandeja Social",
    Marketing: "Marketing",
    Calendar: "Calendario",
    "All Agents Performance": "Rendimiento de Agentes",
    Integrations: "Integraciones",
    Logout: "Cerrar Sesión",
    "Search...": "Buscar...",
    "Global CRM search...": "Búsqueda global..."
  },
  French: {
    Dashboard: "Tableau de Bord",
    Agents: "Agents",
    "Active Cases": "Dossiers Actifs",
    "Doc Verification": "Vérification des Docs",
    Finance: "Finances",
    "Closed Cases": "Dossiers Clôturés",
    Clients: "Clients",
    Leads: "Pistes",
    "Social Inbox": "Boîte Réception Sociale",
    Marketing: "Marketing",
    Calendar: "Calendrier",
    "All Agents Performance": "Performance des Agents",
    Integrations: "Intégrations",
    Logout: "Se Déconnecter",
    "Search...": "Rechercher...",
    "Global CRM search...": "Recherche globale..."
  },
  German: {
    Dashboard: "Dashboard",
    Agents: "Agenten",
    "Active Cases": "Aktive Fälle",
    "Doc Verification": "Dokumentenprüfung",
    Finance: "Finanzen",
    "Closed Cases": "Geschlossene Fälle",
    Clients: "Kunden",
    Leads: "Interessenten",
    "Social Inbox": "Sozialer Posteingang",
    Marketing: "Marketing",
    Calendar: "Kalender",
    "All Agents Performance": "Agentenleistung",
    Integrations: "Integrationen",
    Logout: "Abmelden",
    "Search...": "Suchen...",
    "Global CRM search...": "Globale CRM-Suche..."
  },
  Urdu: {
    Dashboard: "ڈیش بورڈ",
    Agents: "ایجنٹ",
    "Active Cases": "سرگرم کیسز",
    "Doc Verification": "دستاویزات کی تصدیق",
    Finance: "مالیات",
    "Closed Cases": "بند کیسز",
    Clients: "کلائنٹس",
    Leads: "ممکنہ گاہک",
    "Social Inbox": "سوشل ان باکس",
    Marketing: "مارکیٹنگ",
    Calendar: "کیلنڈر",
    "All Agents Performance": "ایجنٹوں کی کارکردگی",
    Integrations: "انٹیگریشنز",
    Logout: "لاگ آؤٹ",
    "Search...": "تلاش کریں...",
    "Global CRM search...": "عام تلاش..."
  }
};

export const DashboardLayout = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { currentUser, changeRole, logout, isAdmin, isConsultant, isFinance, isOperations } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [adminLang, setAdminLang] = useState(() => {
    return localStorage.getItem('crm-admin-lang') || 'English';
  });

  const changeAdminLanguage = (newLang) => {
    setAdminLang(newLang);
    localStorage.setItem('crm-admin-lang', newLang);
  };

  const t = (key) => {
    if (MENU_TRANSLATIONS[adminLang] && MENU_TRANSLATIONS[adminLang][key]) {
      return MENU_TRANSLATIONS[adminLang][key];
    }
    return MENU_TRANSLATIONS['English'][key] || key;
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: dbService.getMyNotifications,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: false // don't spam errors if user is not logged in
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: dbService.getConversations,
    refetchInterval: 3000,
  });

  const getPlatformUnread = (platform) => {
    return conversations
      .filter(c => c.platform === platform)
      .reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  };

  const whatsappUnread = getPlatformUnread('whatsapp');
  const instagramUnread = getPlatformUnread('instagram');
  const facebookUnread = getPlatformUnread('facebook');
  const telegramUnread = getPlatformUnread('telegram');
  const totalSocialUnread = whatsappUnread + instagramUnread + facebookUnread + telegramUnread;

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [socialMenuOpen, setSocialMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // WebSockets Real-Time Sync
  useEffect(() => {
    if (!currentUser?.id) return;

    // Connect to backend Socket.io
    const socket = io('https://aaa-consultancy-production.up.railway.app');

    // Join the specific role room
    socket.emit('join-role', currentUser.role);
    // Join the specific user room
    socket.emit('join-user', currentUser.id);

    // Listen for permission updates
    socket.on('permissions_updated', (newPermissions) => {
      console.log('Real-time permissions updated via WebSocket:', newPermissions);
      // Invalidate the cache so React Query fetches the new settings immediately
      queryClient.invalidateQueries({ queryKey: ['customization-settings'] });

      // Show an alert to the user (optional)
      showAlert('Your permissions have been updated by an administrator.', 'info');
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id, currentUser?.role, queryClient, showAlert]);

  const [connectedPlatforms, setConnectedPlatforms] = useState(() => {
    try {
      const saved = localStorage.getItem('crm-connected-platforms');
      return saved ? JSON.parse(saved) : {
        whatsapp: {},
        facebook: {},
        instagram: {},
        telegram: {}
      };
    } catch (e) {
      return { whatsapp: {}, facebook: {}, instagram: {}, telegram: {} };
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('crm-connected-platforms');
        if (saved) {
          setConnectedPlatforms(JSON.parse(saved));
        } else {
          setConnectedPlatforms({
            whatsapp: {},
            facebook: {},
            instagram: {},
            telegram: {}
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/social-inbox')) {
      setSocialMenuOpen(true);
    }
  }, [location.pathname]);

  // UI state hooks
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  const handleProfileMenuOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleNotifMenuOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifMenuClose = () => setNotifAnchorEl(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleRoleChange = async (event) => {
    const role = event.target.value;
    await changeRole(role);
    showAlert(`Role switched to ${role.toUpperCase()}`, 'info');
    navigate('/dashboard');
  };

  const navigateTo = (path) => {
    // If navigating to main client lists, clear their sessionStorage filters
    if (path.endsWith('/clients')) {
      sessionStorage.removeItem('adminClientList_filters');
      sessionStorage.removeItem('adminClientList_cardInfo');
      sessionStorage.removeItem('operationsClientList_filters');
      sessionStorage.removeItem('operationsClientList_cardInfo');
      sessionStorage.removeItem('agentClientList_filters');
      sessionStorage.removeItem('agentClientList_cardInfo');
    }
    // If navigating to main leads list, clear its sessionStorage filters
    if (path.endsWith('/leads')) {
      sessionStorage.removeItem('leadList_filters');
      sessionStorage.removeItem('leadList_cardInfo');
    }
    // If navigating to main payments invoice list
    if (path.endsWith('/payments/invoices') || path.endsWith('/payments')) {
      sessionStorage.removeItem('invoiceList_filters');
      sessionStorage.removeItem('invoiceList_cardInfo');
    }

    navigate(path, { state: { resetFilters: true } });
    setMobileOpen(false);
  };

  const markReadMutation = useMutation({
    mutationFn: dbService.markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: dbService.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
    showAlert('All notifications marked as read', 'success');
  };

  const handleNotifClick = (id) => {
    markReadMutation.mutate(id);
    handleNotifMenuClose();
  };

  const getRolePrefix = () => {
    if (!currentUser) return '';
    if (currentUser.role === 'consultant') return 'agent';
    if (currentUser.role === 'super_admin') return 'super_admin';
    if (currentUser.role === 'marketing') return 'marketing-manager';

    return currentUser.role;
  };

  const getDynamicPath = (item) => {
    let prefix = getRolePrefix();
    if (!prefix) return item.path;

    // Special override: Dashboard should map strictly to the exact role if it exists
    if (item.path === '/dashboard') {
      if (currentUser.role === 'super_admin') return '/super_admin/dashboard';
      if (currentUser.role === 'marketing') return '/marketing-manager/dashboard';
    }

    // Special override: Integrations is a shared page — do not prefix it
    if (item.path === '/integrations') return '/integrations';

    if (item.path.startsWith(`/${prefix}`)) return item.path;

    // Add prefix to paths
    if (item.path.startsWith('/')) {
      return `/${prefix}${item.path}`;
    }
    return item.path;
  };

  const isActive = (item) => {
    const currentPath = location.pathname;
    const itemPath = getDynamicPath(item);

    // Social inbox matching
    if (itemPath.includes('/social-inbox')) {
      return currentPath.includes('/social-inbox') && itemPath === getDynamicPath({ path: location.pathname + location.search });
    }

    // Exact match for payments to prevent overlap with refund-commission
    if (itemPath.endsWith('/payments')) {
      return currentPath === itemPath || currentPath === itemPath + '/';
    }

    // Default prefix match
    return currentPath.startsWith(itemPath.split('?')[0]);
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'consultant', 'operations', 'finance', 'super_admin', 'marketing'],
    },
    {
      label: 'Agents',
      icon: <GroupsIcon />,
      path: '/agents',
      roles: ['admin', 'operations', 'super_admin'],
    },
    {
      label: 'Active Cases',
      icon: <GroupsIcon />,
      path: '/active-cases',
      roles: ['admin', 'operations', 'super_admin'],
    },
    {
      label: 'Doc Verification',
      icon: <AssignmentTurnedInIcon />,
      path: '/documents/verify',
      roles: ['admin', 'operations', 'super_admin'],
    },
    {
      label: 'AWS Cloud Backups',
      icon: <CloudUploadIcon />,
      path: '/documents/storage',
      roles: ['super_admin'],
    },
    {
      label: 'Finance',
      icon: <MonetizationOnIcon />,
      path: '/payments',
      roles: ['admin', 'finance', 'super_admin'],
    },
    {
      label: 'Refunds & Commissions',
      icon: <MonetizationOnIcon />,
      path: '/payments/refund-commission',
      roles: ['admin', 'operations', 'finance', 'super_admin'],
    },
    {
      label: 'Closed Cases',
      icon: <AssignmentTurnedInIcon />,
      path: '/closed-cases',
      roles: ['admin', 'operations', 'super_admin'],
    },
    {
      label: 'Clients',
      icon: <BusinessCenterIcon />,
      path: '/clients',
      roles: ['admin', 'consultant', 'operations', 'super_admin'],
    },
    {
      label: 'Leads',
      icon: <PeopleIcon />,
      path: '/leads',
      roles: ['admin', 'consultant', 'operations', 'super_admin', 'marketing'],
    },
    {
      label: 'Social Inbox',
      icon: <ForumIcon />,
      path: '/social-inbox',
      roles: ['admin', 'consultant', 'operations', 'super_admin'],
    },
    {
      label: 'Marketing',
      icon: <AssessmentIcon />,
      path: '/marketing',
      roles: ['admin', 'operations', 'super_admin', 'marketing'],
    },
    {
      label: 'Integrations',
      icon: <CableIcon />,
      path: '/integrations',
      roles: ['admin', 'super_admin'],
    },
    {
      label: 'Calendar',
      icon: <CalendarMonthIcon />,
      path: '/consultations/calendar',
      roles: ['admin', 'consultant', 'operations', 'super_admin'],
    },
    {
      label: 'All Agents Performance',
      icon: <AssessmentIcon />,
      path: '/agents/performance',
      roles: ['admin', 'operations', 'super_admin'],
    },
    {
      label: 'Customization',
      icon: <SettingsIcon />,
      path: '/super_admin/customization',
      roles: ['super_admin'],
    },
  ];

  const ALL_SUB_ITEMS = [
    {
      label: 'WhatsApp',
      channel: 'whatsapp',
      icon: <WhatsAppIcon />,
      path: '/social-inbox?channel=whatsapp'
    },
    {
      label: 'Facebook',
      channel: 'facebook',
      icon: <FacebookIcon />,
      path: '/social-inbox?channel=facebook'
    },
    {
      label: 'Instagram',
      channel: 'instagram',
      icon: <InstagramIcon />,
      path: '/social-inbox?channel=instagram'
    },
    {
      label: 'Telegram',
      channel: 'telegram',
      icon: <TelegramIcon />,
      path: '/social-inbox?channel=telegram'
    },
    {
      label: 'LinkedIn',
      channel: 'linkedin',
      icon: <LinkedInIcon sx={{ color: '#0A66C2' }} />,
      path: '/social-inbox?channel=linkedin'
    },
    {
      label: 'Twitter / X',
      channel: 'twitter',
      icon: <TwitterIcon sx={{ color: '#1DA1F2' }} />,
      path: '/social-inbox?channel=twitter'
    },
    {
      label: 'Pinterest',
      channel: 'pinterest',
      icon: <PinterestIcon sx={{ color: '#BD081C' }} />,
      path: '/social-inbox?channel=pinterest'
    },
    {
      label: 'WeChat',
      channel: 'wechat',
      icon: <ChatIcon sx={{ color: '#07C160' }} />,
      path: '/social-inbox?channel=wechat'
    },
    {
      label: 'LINE',
      channel: 'line',
      icon: <ChatIcon sx={{ color: '#06C755' }} />,
      path: '/social-inbox?channel=line'
    },
    {
      label: 'Viber',
      channel: 'viber',
      icon: <ChatIcon sx={{ color: '#7360F2' }} />,
      path: '/social-inbox?channel=viber'
    },
    {
      label: 'Discord',
      channel: 'discord',
      icon: <ChatIcon sx={{ color: '#5865F2' }} />,
      path: '/social-inbox?channel=discord'
    },
    {
      label: 'Snapchat',
      channel: 'snapchat',
      icon: <ChatIcon sx={{ color: '#E8C200' }} />,
      path: '/social-inbox?channel=snapchat'
    },
    {
      label: 'TikTok',
      channel: 'tiktok',
      icon: <ChatIcon sx={{ color: '#010101' }} />,
      path: '/social-inbox?channel=tiktok'
    },
    {
      label: 'YouTube',
      channel: 'youtube',
      icon: <ChatIcon sx={{ color: '#FF0000' }} />,
      path: '/social-inbox?channel=youtube'
    }
  ];

  const subItems = ALL_SUB_ITEMS.filter(item => connectedPlatforms[item.channel]);

  const handleSocialClick = () => {
    if (subItems.length === 0) {
      showAlert('No social media platforms connected. Please connect a platform in the Integrations tab.', 'warning');
      return;
    }

    if (!sidebarOpen) {
      setSidebarOpen(true);
      setSocialMenuOpen(true);
    } else {
      setSocialMenuOpen(!socialMenuOpen);
    }
  };

  const renderSocialInboxMenu = (item) => {
    const active = isActive(item);
    const showUnread = totalSocialUnread > 0;

    return (
      <React.Fragment key={item.label}>
        <ListItemButton
          onClick={handleSocialClick}
          selected={active && !socialMenuOpen}
          sx={{
            py: 1.2,
            px: sidebarOpen ? 2.5 : 2,
            borderRadius: 2.5,
            mx: 1.5,
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'initial' : 'center',
            color: active ? 'secondary.main' : 'text.secondary',
            '&.Mui-selected': {
              backgroundColor: 'background.neutral',
              color: 'secondary.main',
              '& .MuiListItemIcon-root': {
                color: 'secondary.main',
              },
              '&:hover': {
                backgroundColor: 'background.neutral',
              },
            },
            '&:hover': {
              backgroundColor: 'background.neutral',
              color: 'text.primary',
              opacity: 0.95,
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: sidebarOpen ? 2 : 'auto',
              justifyContent: 'center',
              color: active ? 'secondary.main' : 'text.secondary',
              transition: 'color 0.2s ease',
            }}
          >
            <Badge badgeContent={showUnread ? totalSocialUnread : 0} color="error">
              {item.icon}
            </Badge>
          </ListItemIcon>
          {sidebarOpen && (
            <ListItemText
              primary={item.label}
              sx={{ m: 0 }}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    color: 'inherit',
                    lineHeight: 1,
                  }
                }
              }}
            />
          )}
          {sidebarOpen && (
            socialMenuOpen ? <ExpandLess sx={{ fontSize: '1.2rem', color: 'text.secondary' }} /> : <ExpandMore sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
          )}
        </ListItemButton>

        <Collapse in={socialMenuOpen && sidebarOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 3.5 }}>
            {subItems.map((subItem) => {
              const subActive = location.pathname === '/social-inbox' && location.search === `?channel=${subItem.channel}`;
              const subUnread = getPlatformUnread(subItem.channel);

              return (
                <ListItemButton
                  key={subItem.label}
                  onClick={() => navigateTo(getDynamicPath(subItem))}
                  selected={subActive}
                  sx={{
                    py: 0.8,
                    px: 2,
                    borderRadius: 2,
                    mb: 0.5,
                    mr: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: subActive ? 'secondary.main' : 'text.secondary',
                    '&.Mui-selected': {
                      backgroundColor: 'background.neutral',
                      color: 'secondary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'secondary.main',
                      },
                      '&:hover': {
                        backgroundColor: 'background.neutral',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'background.neutral',
                      color: 'text.primary',
                      opacity: 0.95,
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 1.5,
                      justifyContent: 'center',
                      color: subActive ? 'secondary.main' : 'text.secondary',
                      transition: 'color 0.2s ease',
                      '& svg': {
                        fontSize: '1.1rem'
                      }
                    }}
                  >
                    <Badge badgeContent={subUnread} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                      {subItem.icon}
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={subItem.label}
                    sx={{ m: 0 }}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: '0.8rem',
                          fontWeight: subActive ? 600 : 500,
                          color: 'inherit',
                          lineHeight: 1,
                        }
                      }
                    }}
                  />
                  {subUnread > 0 && (
                    <Box
                      sx={{
                        backgroundColor: 'error.main',
                        color: 'error.contrastText',
                        borderRadius: '10px',
                        px: 1,
                        py: 0.2,
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        lineHeight: 1,
                      }}
                    >
                      {subUnread}
                    </Box>
                  )}
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  // Render navigation item
  const renderNavItem = (item) => {
    // 1. Check individual user customization override in customizationSettings (highest priority)
    if (customizationSettings && currentUser?.id && customizationSettings[currentUser.id]?.menus) {
      const allowedMenus = customizationSettings[currentUser.id].menus || [];
      if (!allowedMenus.includes(item.label)) return null;
    }
    // 2. Legacy custom permissions override check
    else if (currentUser?.customPermissions?.enabled) {
      const allowedMenus = currentUser.customPermissions.menus || [];
      if (!allowedMenus.includes(item.label)) return null;
    }
    // 3. Fall back to role-based settings (or static fallback)
    else {
      if (currentUser?.role !== 'super_admin') {
        if (customizationSettings && customizationSettings[currentUser?.role]) {
          const allowedMenus = customizationSettings[currentUser.role].menus || [];
          if (!allowedMenus.includes(item.label)) return null;
        } else {
          // Fallback to static check if settings are not loaded yet
          if (!item.roles.includes(currentUser?.role)) return null;
        }
      } else {
        // Super admin can see all options they are allowed statically
        if (!item.roles.includes(currentUser?.role)) return null;
      }
    }

    if (item.label === 'Social Inbox') {
      return renderSocialInboxMenu(item);
    }

    const active = isActive(item);
    const itemPath = getDynamicPath(item);

    return (
      <ListItemButton
        key={item.label}
        onClick={() => navigateTo(itemPath)}
        selected={active}
        sx={{
          py: 1.2,
          px: sidebarOpen ? 2.5 : 2,
          borderRadius: 2.5,
          mx: 1.5,
          mb: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'initial' : 'center',
          color: active ? 'secondary.main' : 'text.secondary',
          '&.Mui-selected': {
            backgroundColor: 'background.neutral',
            color: 'secondary.main',
            '& .MuiListItemIcon-root': {
              color: 'secondary.main',
            },
            '&:hover': {
              backgroundColor: 'background.neutral',
            },
          },
          '&:hover': {
            backgroundColor: 'background.neutral',
            color: 'text.primary',
            opacity: 0.95,
          },
          transition: 'all 0.2s ease',
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: sidebarOpen ? 2 : 'auto',
            justifyContent: 'center',
            color: active ? 'secondary.main' : 'text.secondary',
            transition: 'color 0.2s ease',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {sidebarOpen && (
          <>
            <ListItemText
              primary={t(item.label === 'Leads' && (currentUser?.role === 'consultant' || currentUser?.role === 'agent') ? 'Leads' : item.label)}
              sx={{ m: 0 }}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    color: 'inherit',
                    lineHeight: 1,
                  }
                }
              }}
            />
            {item.label === 'Doc Verification' && unreadCount > 0 && (
              <Box
                sx={{
                  bgcolor: '#C59B27',
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  lineHeight: 1.4,
                  minWidth: 18,
                  textAlign: 'center',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                  }
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Box>
            )}
          </>
        )}
      </ListItemButton>
    );
  };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Logo Header */}
      <Box
        sx={{
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          justifyContent: sidebarOpen ? 'space-between' : 'center',
        }}
      >
        <Box onClick={() => navigateTo('/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              background: 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            A³
          </Box>
          {sidebarOpen && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                AAA CONSULTANCY
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                SPAIN IMMIGRATION
              </Typography>
            </Box>
          )}
        </Box>
        {sidebarOpen && (
          <IconButton onClick={toggleSidebar} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
        <List disablePadding>
          {menuItems.map((item) => renderNavItem(item))}

          <ListItemButton
            onClick={logout}
            sx={{
              py: 1.2,
              px: sidebarOpen ? 2.5 : 2,
              borderRadius: 2.5,
              mx: 1.5,
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'initial' : 'center',
              color: 'secondary.main',
              '&:hover': {
                backgroundColor: 'background.neutral',
                color: 'secondary.main',
                opacity: 0.95,
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: sidebarOpen ? 2 : 'auto',
                justifyContent: 'center',
                color: 'inherit',
                transition: 'color 0.2s ease',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {sidebarOpen && (
              <ListItemText
                primary={t('Logout')}
                sx={{ m: 0 }}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'inherit',
                      lineHeight: 1,
                    }
                  }
                }}
              />
            )}
          </ListItemButton>
        </List>
      </Box>

      {/* Collapsed Toggle Footer for Sidebar */}
      {!sidebarOpen && (
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={toggleSidebar} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* User Status Bar at footer */}
      {sidebarOpen && (
        <Box sx={{ p: 2, m: 1.5, borderRadius: 3, backgroundColor: 'background.neutral' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={currentUser?.avatar} sx={{ width: 36, height: 36 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, noWrap: true, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser?.name}
              </Typography>
              <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                {currentUser?.role} Mode
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  const isRTL = adminLang === 'Arabic' || adminLang === 'Urdu';

  return (
    <Box dir={isRTL ? 'rtl' : 'ltr'} sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            xs: '100%',
            md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedDrawerWidth}px)`,
          },
          ml: isRTL ? 0 : {
            xs: 0,
            md: sidebarOpen ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
          },
          mr: isRTL ? {
            xs: 0,
            md: sidebarOpen ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
          } : 0,
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.background.paper,
          color: 'text.primary',
          boxShadow: '0px 1px 3px 0px rgba(15, 23, 42, 0.05)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar sx={{ px: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          {/* Left: Collapse Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            {!sidebarOpen && (
              <IconButton
                color="inherit"
                aria-label="expand sidebar"
                onClick={toggleSidebar}
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Search Input Box */}
            <Box sx={{ display: { xs: 'none', sm: 'block' }, width: 280 }}>
              <SearchBar
                value={searchVal}
                onChange={setSearchVal}
                onClear={() => setSearchVal('')}
                placeholder={t('Global CRM search...')}
              />
            </Box>
          </Box>

          {/* Right: Tools & Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={adminLang}
                onChange={(e) => changeAdminLanguage(e.target.value)}
                sx={{ borderRadius: 2, height: 32, bgcolor: 'background.paper', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <MenuItem value="English">EN 🇺🇸</MenuItem>
                <MenuItem value="Arabic">AR 🇦🇪</MenuItem>
                <MenuItem value="Spanish">ES 🇪🇸</MenuItem>
                <MenuItem value="French">FR 🇫🇷</MenuItem>
                <MenuItem value="German">DE 🇩🇪</MenuItem>
                <MenuItem value="Urdu">UR 🇵🇰</MenuItem>
              </Select>
            </FormControl>

            {/* Quick Role Switcher Dropdown (for testing and verification) */}
            <FormControl size="small" sx={{ minWidth: 105 }}>
              <Select
                value={currentUser?.role || 'super_admin'}
                onChange={handleRoleChange}
                sx={{
                  borderRadius: 2,
                  height: 32,
                  bgcolor: 'background.paper',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  border: '1px solid',
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '& .MuiSelect-select': { py: 0.5 }
                }}
              >
                <MenuItem value="super_admin">CEO 👑</MenuItem>
                {customizationSettings?.rolesDefinition?.map(role => (
                  <MenuItem key={role.id} value={role.id}>{role.label.split('(')[0].trim()}</MenuItem>
                )) || (
                    <>
                      <MenuItem value="admin">Manager 💼</MenuItem>
                      <MenuItem value="operations">Ops ⚙️</MenuItem>
                      <MenuItem value="consultant">Agent 🧑‍💼</MenuItem>
                      <MenuItem value="finance">Finance 💵</MenuItem>
                      <MenuItem value="marketing">Marketing 📣</MenuItem>
                    </>
                  )}
              </Select>
            </FormControl>

            {/* Social Inbox Shortcut */}
            <Tooltip title="Social Inbox">
              <IconButton color="inherit" onClick={() => navigateTo(getDynamicPath({ path: '/social-inbox' }))}>
                <Badge badgeContent={totalSocialUnread} color="error">
                  <ForumIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications Popover */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotifMenuOpen}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications list popup */}
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={handleNotifMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: { sx: { width: 380, maxHeight: 480, borderRadius: 3, mt: 1, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' } },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#051A3B' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                  🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
                </Typography>
                {unreadCount > 0 && (
                  <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.7rem', color: '#C59B27', fontWeight: 700 }}>
                    Mark all read
                  </Button>
                )}
              </Box>
              <Divider />
              <List sx={{ p: 0, maxHeight: 380, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <NotificationsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                    <Typography variant="body2">No notifications yet</Typography>
                  </Box>
                ) : (
                  notifications.slice(0, 20).map((notif) => {
                    const timeAgo = (() => {
                      const diff = Date.now() - new Date(notif.createdAt).getTime();
                      const mins = Math.floor(diff / 60000);
                      if (mins < 1) return 'Just now';
                      if (mins < 60) return `${mins}m ago`;
                      const hrs = Math.floor(mins / 60);
                      if (hrs < 24) return `${hrs}h ago`;
                      return `${Math.floor(hrs / 24)}d ago`;
                    })();

                    return (
                      <ListItemButton
                        key={notif.id}
                        onClick={() => {
                          handleNotifClick(notif.id);
                          navigate(`/${getRolePrefix()}/documents`);
                        }}
                        sx={{
                          px: 2,
                          py: 1.5,
                          backgroundColor: notif.isRead ? 'transparent' : 'rgba(197, 155, 39, 0.06)',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          borderLeft: notif.isRead ? 'none' : '3px solid #C59B27',
                          '&:last-child': { border: 0 },
                          '&:hover': { bgcolor: 'rgba(197, 155, 39, 0.08)' }
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: notif.isRead ? 500 : 800, fontSize: '0.8rem' }}>
                              {notif.title}
                            </Typography>
                            {!notif.isRead && (
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#C59B27', flexShrink: 0, ml: 1 }} />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                            {notif.body}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600, mt: 0.5 }}>
                            {timeAgo}
                          </Typography>
                        </Box>
                      </ListItemButton>
                    );
                  })
                )}
              </List>
            </Popover>

            {/* Profile Dropdown */}
            <IconButton onClick={handleProfileMenuOpen} size="small" sx={{ p: 0.5 }}>
              <Avatar src={currentUser?.avatar} sx={{ width: 32, height: 32 }} />
            </IconButton>

            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              slotProps={{
                paper: { sx: { width: 200, borderRadius: 3, mt: 1 } },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {currentUser?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => navigateTo('/settings')}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                General Settings
              </MenuItem>
              <MenuItem onClick={logout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar: Desktop */}
      <Drawer
        variant="permanent"
        anchor={isRTL ? 'right' : 'left'}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
            boxSizing: 'border-box',
            backgroundColor: (theme) => theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.background.paper,
            borderRight: isRTL ? 'none' : '1px solid',
            borderLeft: isRTL ? '1px solid' : 'none',
            borderColor: 'divider',
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>

      {/* Sidebar: Mobile (Drawer) */}
      <Drawer
        variant="temporary"
        anchor={isRTL ? 'right' : 'left'}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: (theme) => theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.background.paper,
            borderRight: isRTL ? 'none' : '1px solid',
            borderLeft: isRTL ? '1px solid' : 'none',
            borderColor: 'divider',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        className="flex-grow h-full overflow-y-auto overflow-x-hidden flex flex-col box-border min-w-0 w-full pt-[72px] px-1.5 sm:px-2 md:px-2.5 pb-2.5"
        sx={{
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
