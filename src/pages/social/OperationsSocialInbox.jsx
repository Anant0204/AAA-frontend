import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import { renderWhatsAppText } from '../../utils/whatsappFormatter';
import { io } from 'socket.io-client';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Icons
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ForumIcon from '@mui/icons-material/Forum';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuickreplyIcon from '@mui/icons-material/Quickreply';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import PinterestIcon from '@mui/icons-material/Pinterest';
import CommentIcon from '@mui/icons-material/Comment';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import ChatIcon from '@mui/icons-material/Chat';

import PageHeader from '../../components/PageHeader';

// Global Social Media Channels & Filtering categories list
const SOCIAL_PLATFORMS = [
  'all',
  'whatsapp',
  'facebook',
  'instagram',
  'telegram',
  'comments',
  'unassigned',
  'unread',
  'linkedin',
  'twitter',
  'pinterest',
  'wechat',
  'line',
  'viber',
  'discord',
  'snapchat'
];
import { SERVICES } from '../../constants/mockData';

// Initial Mock Conversations
const QUICK_TEMPLATES = [
  { id: 't1', label: 'Greeting', text: 'Hello! Thank you for contacting AAA Business Consultancy. How can we assist you with your Spain visa journey today?' },
  { id: 't2', label: 'Income Criteria', text: 'To assess your eligibility, could you please share your monthly remote income and employment status?' },
  { id: 't3', label: 'Documents Request', text: 'Please upload copies of your Passport (first page) and Bank Statements (last 3 months) to our secure portal so we can review them.' },
  { id: 't4', label: 'Schedule Consultation', text: "Let's schedule a 30-minute Zoom consultation to discuss your relocation strategy. Here is my booking link: https://zoom.us/j/calendar" },
  { id: 't5', label: 'Follow Up', text: 'Hi, just checking in to see if you have any questions about the documents checklist we discussed.' }
];

const displayName = (name, phone) => {
  if (!name) return phone;
  const lower = name.toLowerCase();
  if (lower.includes('applicant') || lower.trim() === '') {
    return phone;
  }
  return name;
};

export const OperationsSocialInbox = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: dbService.getConversations,
    refetchInterval: 3000
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: dbService.getClients
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: dbService.getLeads
  });

  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages
  });

  const [stageFilter, setStageFilter] = useState('');

  const addConversationMutation = useMutation({
    mutationFn: dbService.addConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] })
  });

  const markConversationReadMutation = useMutation({
    mutationFn: dbService.markConversationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] })
  });

  const receiveSocialMessageMutation = useMutation({
    mutationFn: ({ conversationId, message, isActive }) =>
      dbService.receiveSocialMessage(conversationId, message, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] })
  });

  const sendSocialMessageMutation = useMutation({
    mutationFn: (payload) => dbService.sendSocialMessage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] })
  });
  const [activeConvId, setActiveConvId] = useState('conv1');
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const messageEndRef = useRef(null);

  // Connect to socket to handle real-time inbound/outbound WhatsApp updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'https://aaa-consultancy-production.up.railway.app';
      
    const socket = io(socketUrl);

    socket.on('new_whatsapp_message', (data) => {
      console.log('Real-time WhatsApp message received via socket:', data);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const activeConvIdRef = useRef(activeConvId);
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  const activeConv = conversations.find(c => {
    if (c.id !== activeConvId) return false;
    const selectedPlatform = SOCIAL_PLATFORMS[activeTab];
    if (selectedPlatform === 'all') return true;
    if (selectedPlatform === 'unread') return c.unreadCount > 0;
    if (selectedPlatform === 'unassigned') return !c.leadId || c.status === 'Unassigned' || c.isUnassigned;
    if (selectedPlatform === 'comments') return c.messages && c.messages.some(m => m.isComment);
    return c.platform === selectedPlatform;
  });

  // Synchronize URL query parameters with activeTab selection
  useEffect(() => {
    const channelParam = searchParams.get('channel');
    if (channelParam) {
      const idx = SOCIAL_PLATFORMS.indexOf(channelParam);
      if (idx !== -1) {
        setActiveTab(idx);
      } else {
        setActiveTab(0);
      }
    } else {
      setActiveTab(0);
    }
  }, [searchParams]);

  // Synchronize active tab with URL query parameters
  const handleTabChange = (event, newValue) => {
    setActiveConvId(null); // Clear selected chat when switching tabs
    const selectedPlatform = SOCIAL_PLATFORMS[newValue];
    if (selectedPlatform === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ channel: selectedPlatform });
    }
  };

  // Auto-select first conversation of the filtered category if current active one is not in it
  useEffect(() => {
    const selectedPlatform = SOCIAL_PLATFORMS[activeTab];
    if (selectedPlatform && selectedPlatform !== 'all') {
      const filtered = conversations.filter(c => {
        if (selectedPlatform === 'unread') return c.unreadCount > 0;
        if (selectedPlatform === 'unassigned') return !c.leadId || c.status === 'Unassigned' || c.isUnassigned;
        if (selectedPlatform === 'comments') return c.messages && c.messages.some(m => m.isComment);
        return c.platform === selectedPlatform;
      });
      const activeIsMatched = activeConv && filtered.some(f => f.id === activeConv.id);
      if (!activeIsMatched && filtered.length > 0) {
        setActiveConvId(filtered[0].id);
      }
    }
  }, [activeTab, conversations, activeConvId, activeConv]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages]);

  // Mark active chat as read
  useEffect(() => {
    if (activeConv && activeConv.unreadCount > 0) {
      markConversationReadMutation.mutate(activeConvId);
    }
  }, [activeConvId, activeConv?.unreadCount]);

  const getPlatformIcon = (platform, color = 'inherit') => {
    switch (platform) {
      case 'whatsapp':
        return <WhatsAppIcon sx={{ color: color === 'inherit' ? '#25D366' : color }} />;
      case 'facebook':
        return <FacebookIcon sx={{ color: color === 'inherit' ? '#1877F2' : color }} />;
      case 'instagram':
        return <InstagramIcon sx={{ color: color === 'inherit' ? '#E4405F' : color }} />;
      case 'telegram':
        return <TelegramIcon sx={{ color: color === 'inherit' ? '#0088cc' : color }} />;
      default:
        return <ForumIcon sx={{ color: color === 'inherit' ? '#64748B' : color }} />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'whatsapp': return '#E8F5E9';
      case 'facebook': return '#E3F2FD';
      case 'instagram': return '#FCE4EC';
      case 'telegram': return '#E1F5FE';
      default: return '#F1F5F9';
    }
  };

  const handleSimulateCustomerMessage = () => {
    if (!activeConv) return;

    const mockCustomerQueries = [
      "Hi, I want to apply for the Spain visa",
      "Is my NIE application submitted?",
      "What documents do I need for DNV?",
      "Hi, when can we schedule our next meeting?"
    ];

    const randomQuery = mockCustomerQueries[Math.floor(Math.random() * mockCustomerQueries.length)];

    const isComment = Math.random() > 0.5; // Simulate 50% chance it's a comment

    const customerMsg = {
      sender: 'customer',
      text: randomQuery,
      isComment: isComment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    receiveSocialMessageMutation.mutate({
      conversationId: activeConv.id,
      message: customerMsg,
      isActive: true
    });

    // Auto-reply logic for comments
    if (isComment) {
      setTimeout(() => {
        const autoReplyMsg = {
          sender: 'system',
          text: 'Auto-reply sent: "Please message us on WhatsApp for free consultation."',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        sendSocialMessageMutation.mutate({ conversationId: activeConv.id, message: autoReplyMsg });
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!replyText.trim() || !activeConv) return;

    const newMsg = {
      sender: 'agent',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    sendSocialMessageMutation.mutate({ 
      conversationId: activeConvId, 
      phone: activeConv.phone, 
      message: newMsg 
    });

    setReplyText('');
    setSelectedTemplate('');
    setPendingMedia(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingMedia({
        file,
        dataUrl: ev.target.result,
        type: file.type,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Smart content renderer — handles PDF, Image, base64 blobs, credentials, plain text
  const renderMessageContent = (msg, isAgent) => {
    const text = msg.text || '';
    const mediaUrl = msg.mediaUrl || null;
    const mediaType = msg.mediaType || '';
    const mediaName = msg.mediaName || 'Attachment';

    // Helper to detect base64 blob (raw unreadable strings > 200 chars with no spaces)
    const isRawBase64 = (str) => str && str.length > 200 && !/\s/.test(str.substring(0, 100)) && !/^https?:\/\//.test(str);

    // Parse inline tagged attachments from text: [PDF: url], [Image: url], [Attachment: url]
    const pdfMatch = text.match(/\[PDF:\s*(https?:\/\/[^\]]+)\]/);
    const imageMatch = text.match(/\[Image:\s*(https?:\/\/[^\]]+)\]/);
    const attachMatch = text.match(/\[Attachment:\s*(https?:\/\/[^\]]+)\]/);
    const cleanText = text
      .replace(/\[PDF:\s*https?:\/\/[^\]]+\]/g, '')
      .replace(/\[Image:\s*https?:\/\/[^\]]+\]/g, '')
      .replace(/\[Attachment:\s*https?:\/\/[^\]]+\]/g, '')
      .trim();

    // Detect credential messages (portal links)
    const hasPortalLink = text.includes('https://') && (text.includes('Username') || text.includes('Password') || text.includes('portal'));

    const bubbleBg = isAgent ? 'secondary.main' : 'background.paper';
    const textColor = isAgent ? 'secondary.contrastText' : 'text.primary';

    return (
      <>
        {/* Pending media preview (base64) for images */}
        {mediaUrl && (mediaType?.startsWith('image/') || mediaUrl.startsWith('data:image/')) && (
          <Box sx={{ mb: 1, borderRadius: 2, overflow: 'hidden', maxWidth: 240, border: '1px solid rgba(0,0,0,0.1)' }}>
            <img src={mediaUrl} alt={mediaName} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
          </Box>
        )}

        {/* PDF attachment from mediaUrl */}
        {mediaUrl && (mediaType === 'application/pdf' || mediaUrl.endsWith('.pdf') || mediaUrl.startsWith('data:application/pdf')) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: isAgent ? 'rgba(255,255,255,0.15)' : '#FFF5F5', borderRadius: 2, border: '1px solid', borderColor: isAgent ? 'rgba(255,255,255,0.3)' : '#FECACA', mb: 1 }}>
            <PictureAsPdfIcon sx={{ color: '#EF4444', fontSize: 28, flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant='caption' sx={{ fontWeight: 700, color: isAgent ? 'rgba(255,255,255,0.9)' : '#B91C1C', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mediaName}</Typography>
              <Typography variant='caption' sx={{ color: isAgent ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>PDF Document</Typography>
            </Box>
            <IconButton size='small' component='a' href={mediaUrl} target='_blank' download sx={{ color: isAgent ? 'white' : '#EF4444', flexShrink: 0 }}><DownloadIcon fontSize='small' /></IconButton>
          </Box>
        )}

        {/* Inline [PDF: url] tag in text */}
        {pdfMatch && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: isAgent ? 'rgba(255,255,255,0.15)' : '#FFF5F5', borderRadius: 2, border: '1px solid', borderColor: isAgent ? 'rgba(255,255,255,0.3)' : '#FECACA', mb: 1 }}>
            <PictureAsPdfIcon sx={{ color: '#EF4444', fontSize: 28, flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant='caption' sx={{ fontWeight: 700, color: isAgent ? 'rgba(255,255,255,0.9)' : '#B91C1C', display: 'block' }}>PDF Document</Typography>
              <Typography variant='caption' sx={{ color: isAgent ? 'rgba(255,255,255,0.6)' : 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>{pdfMatch[1]}</Typography>
            </Box>
            <IconButton size='small' component='a' href={pdfMatch[1]} target='_blank' download sx={{ color: isAgent ? 'white' : '#EF4444', flexShrink: 0 }}><DownloadIcon fontSize='small' /></IconButton>
          </Box>
        )}

        {/* Inline [Image: url] tag in text */}
        {imageMatch && (
          <Box sx={{ mb: 1, borderRadius: 2, overflow: 'hidden', maxWidth: 240 }}>
            <img src={imageMatch[1]} alt='Attached' style={{ width: '100%', display: 'block', borderRadius: 8 }} />
          </Box>
        )}

        {/* Inline [Attachment: url] generic file */}
        {attachMatch && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: isAgent ? 'rgba(255,255,255,0.15)' : '#F1F5F9', borderRadius: 2, border: '1px solid', borderColor: isAgent ? 'rgba(255,255,255,0.3)' : 'divider', mb: 1 }}>
            <InsertDriveFileIcon sx={{ color: isAgent ? 'white' : '#64748B', fontSize: 28, flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant='caption' sx={{ fontWeight: 700, color: isAgent ? 'rgba(255,255,255,0.9)' : 'text.primary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>File Attachment</Typography>
            </Box>
            <IconButton size='small' component='a' href={attachMatch[1]} target='_blank' download sx={{ color: isAgent ? 'white' : '#64748B', flexShrink: 0 }}><DownloadIcon fontSize='small' /></IconButton>
          </Box>
        )}

        {/* Portal credential message — format as clean info box */}
        {hasPortalLink && !pdfMatch && !imageMatch && !isRawBase64(cleanText) && (
          <Box sx={{ bgcolor: isAgent ? 'rgba(255,255,255,0.1)' : '#F0FDF4', borderRadius: 2, p: 1.5, border: '1px solid', borderColor: isAgent ? 'rgba(255,255,255,0.2)' : '#BBF7D0', mb: cleanText ? 1 : 0 }}>
            {text.split('\n').filter(l => l.trim()).map((line, i) => {
              if (line.startsWith('https://')) return (
                <Typography key={i} variant='caption' sx={{ display: 'block', fontWeight: 700 }}>
                  🔗 <a href={line.trim()} target='_blank' rel='noreferrer' style={{ color: isAgent ? '#A5F3FC' : '#0369A1', wordBreak: 'break-all' }}>{line.trim()}</a>
                </Typography>
              );
              return <Typography key={i} variant='caption' sx={{ display: 'block', color: isAgent ? 'rgba(255,255,255,0.9)' : 'text.primary' }}>{line}</Typography>;
            })}
          </Box>
        )}

        {/* Skip raw base64 unreadable blobs entirely */}
        {!hasPortalLink && isRawBase64(text) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: isAgent ? 'rgba(255,255,255,0.1)' : '#F8FAFC', borderRadius: 2, border: '1px dashed', borderColor: isAgent ? 'rgba(255,255,255,0.3)' : 'divider' }}>
            <InsertDriveFileIcon sx={{ color: isAgent ? 'rgba(255,255,255,0.6)' : '#94A3B8', fontSize: 22 }} />
            <Typography variant='caption' sx={{ color: isAgent ? 'rgba(255,255,255,0.7)' : 'text.secondary', fontStyle: 'italic' }}>Media file received (preview unavailable)</Typography>
          </Box>
        )}

        {/* Regular plain text — formatted with WhatsApp rich text parser */}
        {!hasPortalLink && !isRawBase64(text) && cleanText && (
          <Typography variant='body2' component='div' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {renderWhatsAppText(cleanText, isAgent)}
          </Typography>
        )}
      </>
    );
  };

  const handleTemplateChange = (e) => {
    const val = e.target.value;
    setSelectedTemplate(val);
    const template = QUICK_TEMPLATES.find(t => t.id === val);
    if (template) {
      setReplyText(template.text);
    }
  };

  const getFilteredConversations = () => {
    const selectedPlatform = SOCIAL_PLATFORMS[activeTab];

    return conversations.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.messages.some(m => m.text.toLowerCase().includes(searchText.toLowerCase()));
      
      let matchesPlatform = false;
      if (selectedPlatform === 'all') {
        matchesPlatform = true;
      } else if (selectedPlatform === 'unread') {
        matchesPlatform = c.unreadCount > 0;
      } else if (selectedPlatform === 'unassigned') {
        matchesPlatform = !c.leadId || c.status === 'Unassigned' || c.isUnassigned;
      } else if (selectedPlatform === 'comments') {
        matchesPlatform = c.messages && c.messages.some(m => m.isComment);
      } else {
        matchesPlatform = c.platform === selectedPlatform;
      }

      const matchesStage = !stageFilter || c.status === stageFilter;
      return matchesSearch && matchesPlatform && matchesStage;
    });
  };

  const filteredConversations = getFilteredConversations();

  const getPageTitle = () => {
    const channel = searchParams.get('channel');
    if (channel) {
      return `${channel.charAt(0).toUpperCase() + channel.slice(1)} Chat Inbox`;
    }
    return "Unified Social Chat Hub";
  };

  const getPageSubtitle = () => {
    const channel = searchParams.get('channel');
    if (channel) {
      return `Manage your ${channel.charAt(0).toUpperCase() + channel.slice(1)} client inquiries and real-time messages`;
    }
    return "Manage multi-channel client inquiries (WhatsApp, FB Comments, Instagram DM, Telegram, Snapchat)";
  };

  return (
    <Box sx={{ height: 'calc(100vh - 125px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 1.5 }}>
        <PageHeader
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
        />
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 0, px: 0, pb: 0, display: 'flex', flexDirection: 'column' }}>
        <Box className="flex flex-col md:flex-row gap-3" sx={{ height: '100%', minHeight: 0, width: '100%' }}>
          {/* Left Pane: Conversation List */}
          {(!isMobile || !showChatOnMobile) && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: isMobile ? '100%' : '360px', width: isMobile ? '100%' : '360px', flexShrink: 0 }}>
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Search chats..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                {!searchParams.get('channel') && (
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      minHeight: 40,
                      '& .MuiTab-root': { py: 1, minHeight: 40, fontSize: '0.8rem' }
                    }}
                  >
                    <Tab label="All" icon={<ForumIcon fontSize="small" />} iconPosition="start" />
                    <Tab label="WhatsApp" icon={<WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />} iconPosition="start" />
                    <Tab label="Facebook" icon={<FacebookIcon fontSize="small" sx={{ color: '#1877F2' }} />} iconPosition="start" />
                    <Tab label="Instagram" icon={<InstagramIcon fontSize="small" sx={{ color: '#E4405F' }} />} iconPosition="start" />
                    <Tab label="Telegram" icon={<TelegramIcon fontSize="small" sx={{ color: '#0088cc' }} />} iconPosition="start" />
                    <Tab label="Comments" icon={<CommentIcon fontSize="small" sx={{ color: '#4B5563' }} />} iconPosition="start" />
                    <Tab label="Unassigned" icon={<PersonOffIcon fontSize="small" sx={{ color: '#F59E0B' }} />} iconPosition="start" />
                    <Tab label="Unread" icon={<MarkChatUnreadIcon fontSize="small" sx={{ color: '#EF4444' }} />} iconPosition="start" />
                    <Tab label="LinkedIn" icon={<LinkedInIcon fontSize="small" sx={{ color: '#0A66C2' }} />} iconPosition="start" />
                    <Tab label="Twitter" icon={<TwitterIcon fontSize="small" sx={{ color: '#1DA1F2' }} />} iconPosition="start" />
                    <Tab label="Pinterest" icon={<PinterestIcon fontSize="small" sx={{ color: '#BD081C' }} />} iconPosition="start" />
                    <Tab label="WeChat" icon={<ChatIcon fontSize="small" sx={{ color: '#07C160' }} />} iconPosition="start" />
                    <Tab label="LINE" icon={<ChatIcon fontSize="small" sx={{ color: '#06C755' }} />} iconPosition="start" />
                    <Tab label="Viber" icon={<ChatIcon fontSize="small" sx={{ color: '#7360F2' }} />} iconPosition="start" />
                    <Tab label="Discord" icon={<ChatIcon fontSize="small" sx={{ color: '#5865F2' }} />} iconPosition="start" />
                    <Tab label="Snapchat" icon={<ChatIcon fontSize="small" sx={{ color: '#FFFC00' }} />} iconPosition="start" />
                  </Tabs>
                )}

                <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                  {filteredConversations.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography variant="body2">No conversations found.</Typography>
                    </Box>
                  ) : (
                    filteredConversations.map((conv) => {
                      const lastMsg = conv.messages[conv.messages.length - 1];
                      const isActive = conv.id === activeConvId;

                      return (
                        <React.Fragment key={conv.id}>
                          <ListItemButton
                            selected={isActive}
                            onClick={() => {
                              setActiveConvId(conv.id);
                              setShowChatOnMobile(true);
                            }}
                            sx={{
                              py: 2,
                              px: 2.5,
                              borderLeft: isActive ? '4px solid' : '4px solid transparent',
                              borderLeftColor: 'secondary.main',
                              backgroundColor: isActive ? 'action.selected' : 'inherit',
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                  <Box sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid white',
                                    backgroundColor: 'background.paper'
                                  }}>
                                    {getPlatformIcon(conv.platform)}
                                  </Box>
                                }
                              >
                                <Avatar src={conv.avatar} alt={displayName(conv.name, conv.phone)} sx={{ width: 44, height: 44 }} />
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              slotProps={{
                                primary: { component: 'div' },
                                secondary: { component: 'div' }
                              }}
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: conv.unreadCount > 0 ? 700 : 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {displayName(conv.name, conv.phone)}
                                    {conv.messages.some(m => m.isComment) && (
                                      <Chip label="Comment" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                                    )}
                                    {!conv.messages.some(m => m.isComment) && (
                                      <Chip label="DM" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
                                    )}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {lastMsg ? lastMsg.timestamp : ''}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography
                                    variant="caption"
                                    color={conv.unreadCount > 0 ? 'text.primary' : 'text.secondary'}
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '80%',
                                      fontWeight: conv.unreadCount > 0 ? 600 : 400
                                    }}
                                  >
                                    {lastMsg ? lastMsg.text : 'No messages'}
                                  </Typography>
                                  {conv.unreadCount > 0 && (
                                    <Chip
                                      label={conv.unreadCount}
                                      color="secondary"
                                      size="small"
                                      sx={{
                                        height: 18,
                                        minWidth: 18,
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        '& .MuiChip-label': { px: 0.5 }
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                            />
                          </ListItemButton>
                          <Divider />
                        </React.Fragment>
                      );
                    })
                  )}
                </List>
              </Paper>
            </Box>
          )}

          {/* Center Pane: Active Chat Window */}
          {(!isMobile || showChatOnMobile) && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
              {activeConv ? (
                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  {/* Chat Header */}
                  <Box sx={{ py: 1.5, px: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {isMobile && (
                        <IconButton onClick={() => setShowChatOnMobile(false)} sx={{ mr: 1, p: 0.5 }}>
                          <ArrowBackIcon />
                        </IconButton>
                      )}
                      <Avatar src={activeConv.avatar} alt={displayName(activeConv.name, activeConv.phone)} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{displayName(activeConv.name, activeConv.phone)}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getPlatformIcon(activeConv.platform)}
                          <Typography variant="caption" sx={{ textTransform: 'capitalize', color: 'text.secondary' }}>
                            {activeConv.platform} Chat Channel
                          </Typography>
                          {activeConv.messages.some(m => m.isComment) ? (
                            <Chip label="Comment Source" size="small" color="primary" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />
                          ) : (
                            <Chip label="Direct Message" size="small" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={activeConv.status}
                        color={activeConv.status === 'New Lead' ? 'info' : 'secondary'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <IconButton size="small" onClick={() => navigate(`/leads/details/${activeConv.leadId}`)}>
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Message List */}
                  <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#F8FAFC' }}>
                    {activeConv.messages.map((msg, index) => {
                      const isAgent = msg.sender === 'agent';
                      const isSystem = msg.sender === 'system';

                      if (isSystem) {
                        return (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                            <Paper elevation={0} sx={{ py: 0.5, px: 2, borderRadius: 3, bgcolor: '#FEF3C7', border: '1px dashed #F59E0B' }}>
                              <Typography variant="caption" color="amber.800" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon fontSize="inherit" /> System: {msg.text}
                              </Typography>
                            </Paper>
                          </Box>
                        );
                      }

                      return (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: isAgent ? 'flex-end' : 'flex-start',
                            width: '100%'
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '75%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isAgent ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                borderBottomRightRadius: isAgent ? 0 : 3,
                                borderBottomLeftRadius: !isAgent ? 0 : 3,
                                bgcolor: isAgent ? 'secondary.main' : 'background.paper',
                                color: isAgent ? 'secondary.contrastText' : 'text.primary',
                                border: isAgent ? 'none' : '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                              }}
                            >
                              {msg.isComment && (
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: isAgent ? 'rgba(255,255,255,0.7)' : 'primary.main', fontWeight: 600 }}>
                                  [Public Comment]
                                </Typography>
                              )}
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                {msg.text}
                              </Typography>
                            </Paper>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mx: 1, display: 'flex', gap: 0.8, alignItems: 'center' }}>
                              <span>{msg.timestamp}</span>
                              {isAgent && (
                                <Box component="span" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#051A3B', bgcolor: '#E0E7FF', px: 1, py: 0.2, borderRadius: 1 }}>
                                  👤 Replied by: {msg.respondedBy?.name || 'Agent'} {msg.respondedBy?.role ? `(${msg.respondedBy.role})` : ''}
                                </Box>
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </Box>

                  {/* Compose Reply Area */}
                  <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', gap: isMobile ? 1 : 1.5, alignItems: 'center', width: '100%' }}>
                      <FormControl sx={{ width: 40, flexShrink: 0 }} size="small">
                        <Select
                          value={selectedTemplate}
                          onChange={handleTemplateChange}
                          displayEmpty
                          renderValue={() => <QuickreplyIcon fontSize="small" sx={{ color: 'white' }} />}
                          sx={{
                            bgcolor: 'secondary.main',
                            color: 'white',
                            borderRadius: '50%',
                            height: 40,
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              paddingRight: '0 !important',
                              paddingLeft: '0 !important'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none'
                            },
                            '& .MuiSelect-icon': {
                              display: 'none'
                            },
                            '&:hover': {
                              bgcolor: 'secondary.dark'
                            }
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                          {QUICK_TEMPLATES.map(t => (
                            <MenuItem key={t.id} value={t.id} sx={{ fontSize: '0.75rem' }}>{t.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, minWidth: 0 }}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          minRows={1}
                          maxRows={4}
                          placeholder={`Type a reply via ${activeConv.platform}... (Shift+Enter for new line)`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          inputProps={{ style: { fontSize: '0.875rem' } }}
                        />
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleSend}
                          sx={{
                            minWidth: 40,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            p: 0,
                            fontWeight: 'bold',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <SendIcon fontSize="small" />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body1" color="text.secondary">
                    Select a conversation to start chatting
                  </Typography>
                </Paper>
              )}
            </Box>
          )}


        </Box>
      </Box>
    </Box>
  );
};

export default OperationsSocialInbox;
