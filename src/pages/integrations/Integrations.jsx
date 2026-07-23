import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import InputAdornment from '@mui/material/InputAdornment';

// Icons
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EmailIcon from '@mui/icons-material/Email';
import WebhookIcon from '@mui/icons-material/Webhook';
import PowerIcon from '@mui/icons-material/Power';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PageHeader from '../../components/PageHeader';

// ─── Social Media Platforms ───────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook Page',
    description: 'Sync page messages, auto-reply to comments, and manage DMs from your Facebook Business Page.',
    color: '#1877F2',
    bg: '#EBF3FE',
    logo: 'https://cdn.simpleicons.org/facebook/1877F2',
    fields: [
      { key: 'pageId', label: 'Facebook Page ID', placeholder: '123456789012345', hint: 'Found in your Page Settings → About' },
      { key: 'accessToken', label: 'Page Access Token', placeholder: 'EAABwzLixnjY...', hint: 'Generate from Meta Business Suite → Settings → Advanced → API' },
    ],
    docs: 'https://developers.facebook.com/docs/messenger-platform',
    badge: 'Meta' },
  {
    id: 'instagram',
    name: 'Instagram Business',
    description: 'Manage DMs, reply to story mentions, and track post comments from your Instagram Business account.',
    color: '#E1306C',
    bg: '#FDF0F5',
    logo: 'https://cdn.simpleicons.org/instagram/E1306C',
    fields: [
      { key: 'accountId', label: 'Instagram Account ID', placeholder: '17841400455970028', hint: 'Found via Facebook Business Suite linked account' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'EAABwzLixnjY...', hint: 'Same token as Facebook if linked to same Business Manager' },
    ],
    docs: 'https://developers.facebook.com/docs/instagram-api',
    badge: 'Meta' },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Connect your WhatsApp Business number to receive and reply to customer messages directly from CRM.',
    color: '#25D366',
    bg: '#EDFBF4',
    logo: 'https://cdn.simpleicons.org/whatsapp/25D366',
    fields: [
      { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '109876543210123', hint: 'Found in Meta Business Suite → WhatsApp → Getting Started' },
      { key: 'accessToken', label: 'Permanent Access Token', placeholder: 'EAABwzLixnjY...', hint: 'Generate a System User token from Meta Business Settings' },
      { key: 'businessAccountId', label: 'Business Account ID', placeholder: '987654321012345', hint: 'WhatsApp Business Account ID from Meta' },
    ],
    docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    badge: 'Meta' },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: 'Create a Telegram bot to receive messages and support queries from clients through Telegram.',
    color: '#0088CC',
    bg: '#E8F4FB',
    logo: 'https://cdn.simpleicons.org/telegram/0088CC',
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: '1234567890:AABBCCDDeeffgghhiijjkkllmm', hint: 'Create bot via @BotFather on Telegram → /newbot' },
      { key: 'botUsername', label: 'Bot Username', placeholder: '@AAAConsultancyBot', hint: 'The @username you chose when creating the bot' },
    ],
    docs: 'https://core.telegram.org/bots/api',
    badge: 'Telegram' },
  {
    id: 'tiktok',
    name: 'TikTok for Business',
    description: 'Sync TikTok ad leads and DMs into your CRM. Track lead sources from TikTok Ads campaigns.',
    color: '#010101',
    bg: '#F5F5F5',
    logo: 'https://cdn.simpleicons.org/tiktok/010101',
    fields: [
      { key: 'appId', label: 'TikTok App ID', placeholder: '7234567890123456789', hint: 'Found in TikTok for Business → Developer Portal → My Apps' },
      { key: 'appSecret', label: 'App Secret', placeholder: 'abc123def456...', hint: 'Keep this secret — never share publicly' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'act.abc123...', hint: 'Generated after OAuth authorization from TikTok' },
    ],
    docs: 'https://developers.tiktok.com',
    badge: 'TikTok' },
  {
    id: 'linkedin',
    name: 'LinkedIn Page',
    description: 'Connect your company LinkedIn Page to track lead inquiries and manage professional messages.',
    color: '#0077B5',
    bg: '#E8F3FB',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNzdCNSI+PHBhdGggZD0iTTE5IDBoLTE0Yy0yLjc2MSAwLTUgMi4yMzktNSA1djE0YzAgMi43NjEgMi2yMzkgNSA1IDVoMTRjMi43NjIgMCA1LTIuMjM5IDUtNXYtMTRjMC0yLjc2MS0yLjIzOC01LTUtNXptLTExIDE5aC0zdi0xMWgzdjExeG0tMS41LTEyLjI2OGMtLjk2NiAwLTEuNzUtLjc3OS0xLjc1LTEuNzVzLjc4NC0xLjc1IDEuNzUtMS43NSAxLjc1Ljc3OSAxLjc1IDEuNzUtLjc4NCAxLjc1LTEuNzUgMS43NXptMTMuNSAxMi4yNjhoLTN2LTUuNjA0YzAtMy4zNjgtNC0zLjExMy00IDB2NS42MDRoLTN2LTExaDN2MS43NjVjMS4zOTYtMi41ODYgNy0yLjc3NyA3IDIuNDc2djYuNzU5eiIvPjwvc3ZnPg==',
    fields: [
      { key: 'clientId', label: 'App Client ID', placeholder: '86abc...', hint: 'From LinkedIn Developer Portal → My Apps → Auth' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'AQV...', hint: 'OAuth 2.0 token after authorizing the app with your LinkedIn account' },
      { key: 'organizationId', label: 'Organization ID', placeholder: '12345678', hint: 'Your LinkedIn Company Page admin ID' },
    ],
    docs: 'https://learn.microsoft.com/en-us/linkedin/marketing/',
    badge: 'LinkedIn' },
  {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'Monitor mentions, DMs, and track leads from Twitter/X posts and reply to customers.',
    color: '#1DA1F2',
    bg: '#E8F5FE',
    logo: 'https://cdn.simpleicons.org/x/000000',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'xvz1evFS4wEEPTGEFPHBog', hint: 'From Twitter Developer Portal → Your App → Keys and Tokens' },
      { key: 'apiSecret', label: 'API Key Secret', placeholder: 'kAcSOqF21Fu85e7zjz...', hint: 'Keep this private — never commit to code' },
      { key: 'bearerToken', label: 'Bearer Token', placeholder: 'AAAAAAAAAA...', hint: 'Auto-generated by Twitter Developer Portal' },
    ],
    docs: 'https://developer.twitter.com/en/docs',
    badge: 'X Corp' },
  {
    id: 'youtube',
    name: 'YouTube Channel',
    description: 'Sync YouTube comments and track leads generated from your video content and Ads.',
    color: '#FF0000',
    bg: '#FFF0F0',
    logo: 'https://cdn.simpleicons.org/youtube/FF0000',
    fields: [
      { key: 'channelId', label: 'Channel ID', placeholder: 'UCxxxxxxxxxxxxxxxxxxxxxx', hint: 'YouTube Studio → Settings → Channel → Advanced settings → Channel ID' },
      { key: 'apiKey', label: 'Google API Key', placeholder: 'AIzaSy...', hint: 'From Google Cloud Console → APIs → YouTube Data API v3' },
    ],
    docs: 'https://developers.google.com/youtube/v3',
    badge: 'Google' },
  {
    id: 'wechat',
    name: 'WeChat Official Account',
    description: 'Connect your WeChat Official Account to receive and manage messages from WeChat users in the CRM.',
    color: '#07C160',
    bg: '#EDFBF4',
    logo: 'https://cdn.simpleicons.org/wechat/07C160',
    fields: [
      { key: 'appId', label: 'App ID', placeholder: 'wx1234567890abcdef', hint: 'From WeChat Official Account Platform → Settings → Development → Basic Configuration' },
      { key: 'appSecret', label: 'App Secret', placeholder: 'abc123def456...', hint: 'Found in same page as App ID — keep private' },
      { key: 'token', label: 'Server Token', placeholder: 'your_token_here', hint: 'Custom token you define for webhook verification' },
    ],
    docs: 'https://developers.weixin.qq.com/doc/offiaccount/en/',
    badge: 'WeChat' },
  {
    id: 'line',
    name: 'LINE Official Account',
    description: 'Receive and reply to LINE messages from customers. Popular in Japan, Thailand, and Southeast Asia.',
    color: '#00B900',
    bg: '#E8FBE8',
    logo: 'https://cdn.simpleicons.org/line/00B900',
    fields: [
      { key: 'channelId', label: 'Channel ID', placeholder: '1234567890', hint: 'From LINE Developers Console → Your Channel → Basic Settings' },
      { key: 'channelSecret', label: 'Channel Secret', placeholder: 'abc123def456...', hint: 'Used for webhook signature verification' },
      { key: 'accessToken', label: 'Channel Access Token', placeholder: 'xxxxx...', hint: 'Generate a Long-lived token from Messaging API tab' },
    ],
    docs: 'https://developers.line.biz/en/docs/messaging-api/',
    badge: 'LINE' },
  {
    id: 'viber',
    name: 'Viber Bot',
    description: 'Connect a Viber Bot to receive and manage customer messages from Viber users directly in CRM.',
    color: '#7360F2',
    bg: '#F0EEFE',
    logo: 'https://cdn.simpleicons.org/viber/7360F2',
    fields: [
      { key: 'authToken', label: 'Auth Token', placeholder: 'xxxx-xxxx-xxxx-xxxx', hint: 'From Viber Admin Panel → Edit Bot → Auth Token' },
      { key: 'botName', label: 'Bot Name', placeholder: 'AAA Consultancy', hint: 'The display name shown to Viber users' },
    ],
    docs: 'https://developers.viber.com/docs/',
    badge: 'Viber' },
  {
    id: 'discord',
    name: 'Discord Server',
    description: 'Connect a Discord bot to monitor your server channels and capture leads from community discussions.',
    color: '#5865F2',
    bg: '#EEEFFE',
    logo: 'https://cdn.simpleicons.org/discord/5865F2',
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: 'MTA0...', hint: 'From Discord Developer Portal → Your App → Bot → Reset Token' },
      { key: 'guildId', label: 'Server (Guild) ID', placeholder: '1234567890123456789', hint: 'Right-click your server name → Copy Server ID (enable Developer Mode first)' },
      { key: 'channelId', label: 'Monitor Channel ID', placeholder: '1234567890123456789', hint: 'Right-click the channel → Copy Channel ID' },
    ],
    docs: 'https://discord.com/developers/docs/',
    badge: 'Discord' },
  {
    id: 'snapchat',
    name: 'Snapchat Business',
    description: 'Track Snapchat ad leads and Story engagement metrics from your Snapchat Business account.',
    color: '#E8C200',
    bg: '#FFFCE8',
    logo: 'https://cdn.simpleicons.org/snapchat/E8C200',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'abc123...', hint: 'From Snapchat Business → Ads Manager → App Management' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'secret_abc...', hint: 'Found in same App Management page — keep private' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'eyJhbGci...', hint: 'Generate via Snapchat OAuth 2.0 authorization flow' },
    ],
    docs: 'https://marketingapi.snapchat.com/docs/',
    badge: 'Snap Inc.' },
];

// ─── Email Providers ──────────────────────────────────────────────────────────
const EMAIL_PROVIDERS = [
  {
    id: 'gmail',
    name: 'Gmail / Google Workspace',
    description: 'Connect your Gmail or Google Workspace email to receive and reply to client emails inside CRM.',
    color: '#EA4335',
    bg: '#FEF1F0',
    emoji: '📧',
    fields: [
      { key: 'email', label: 'Email Address', placeholder: 'info@aaaconsultancy.com', hint: 'The Gmail address to connect' },
      { key: 'clientId', label: 'Google OAuth Client ID', placeholder: '1234567890-abc.apps.googleusercontent.com', hint: 'From Google Cloud Console → OAuth 2.0 Credentials' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'GOCSPX-abc...', hint: 'Keep private — from same OAuth credentials page' },
    ],
    docsUrl: 'https://developers.google.com/gmail/api' },
  {
    id: 'outlook',
    name: 'Microsoft Outlook / 365',
    description: 'Connect your Outlook or Microsoft 365 business email for full two-way sync with client records.',
    color: '#0078D4',
    bg: '#EBF3FB',
    emoji: '📩',
    fields: [
      { key: 'email', label: 'Email Address', placeholder: 'info@aaaconsultancy.com', hint: 'Your Outlook/O365 email address' },
      { key: 'tenantId', label: 'Azure Tenant ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', hint: 'From Azure Active Directory → Overview' },
      { key: 'clientId', label: 'App Client ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', hint: 'From Azure App Registration' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'abc~ABC...', hint: 'Generated in Azure App → Certificates & Secrets' },
    ],
    docsUrl: 'https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview' },
  {
    id: 'smtp',
    name: 'Custom SMTP / IMAP',
    description: 'Connect any email provider using standard SMTP (send) and IMAP (receive) protocols.',
    color: '#6366F1',
    bg: '#EEF2FF',
    emoji: '📮',
    fields: [
      { key: 'email', label: 'Email Address', placeholder: 'info@aaaconsultancy.com', hint: 'The email address to use' },
      { key: 'smtpHost', label: 'SMTP Host', placeholder: 'smtp.yourprovider.com', hint: 'Your email provider SMTP server' },
      { key: 'smtpPort', label: 'SMTP Port', placeholder: '587', hint: 'Usually 587 (TLS) or 465 (SSL)' },
      { key: 'imapHost', label: 'IMAP Host', placeholder: 'imap.yourprovider.com', hint: 'Your email provider IMAP server (for receiving)' },
      { key: 'username', label: 'Username', placeholder: 'info@aaaconsultancy.com', hint: 'Usually same as email' },
      { key: 'password', label: 'Password / App Password', placeholder: '••••••••', hint: 'Use App Password if 2FA is enabled', isPassword: true },
    ],
    docsUrl: null },
];

// ─── Main Component ────────────────────────────────────────────────────────────
const Integrations = () => {
  const [tabValue, setTabValue] = useState(0);
  const [connectedPlatforms, setConnectedPlatforms] = useState(() => {
    try {
      const saved = localStorage.getItem('crm-connected-platforms');
      return saved ? JSON.parse(saved) : {
        whatsapp: { connectedAt: new Date().toLocaleString() },
        facebook: { connectedAt: new Date().toLocaleString() },
        instagram: { connectedAt: new Date().toLocaleString() },
        telegram: { connectedAt: new Date().toLocaleString() }
      };
    } catch (e) {
      return {
        whatsapp: { connectedAt: new Date().toLocaleString() },
        facebook: { connectedAt: new Date().toLocaleString() },
        instagram: { connectedAt: new Date().toLocaleString() },
        telegram: { connectedAt: new Date().toLocaleString() }
      };
    }
  });

  const [connectedEmails, setConnectedEmails] = useState(() => {
    try {
      const saved = localStorage.getItem('crm-connected-emails');
      return saved ? JSON.parse(saved) : {
        gmail: { connectedAt: new Date().toLocaleString() }
      };
    } catch (e) {
      return { gmail: { connectedAt: new Date().toLocaleString() } };
    }
  });

  useEffect(() => {
    localStorage.setItem('crm-connected-platforms', JSON.stringify(connectedPlatforms));
    window.dispatchEvent(new Event('storage'));
  }, [connectedPlatforms]);

  useEffect(() => {
    localStorage.setItem('crm-connected-emails', JSON.stringify(connectedEmails));
  }, [connectedEmails]);
  const [openDialog, setOpenDialog] = useState(null);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [emailSettings, setEmailSettings] = useState({
    autoCreateLeads: true,
    syncSentEmails: true,
    attachToClients: true,
    autoReply: false,
  });

  const handleOpenConnect = (type, id) => {
    setFormData({});
    setShowPassword({});
    setOpenDialog({ type, id });
  };

  const handleDisconnect = (type, id) => {
    if (type === 'social') {
      setConnectedPlatforms(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } else {
      setConnectedEmails(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
    showSnack(`Disconnected successfully`, 'info');
  };

  const handleSave = () => {
    const { type, id } = openDialog;
    if (type === 'social') {
      setConnectedPlatforms(prev => ({ ...prev, [id]: { ...formData, connectedAt: new Date().toLocaleString() } }));
    } else {
      setConnectedEmails(prev => ({ ...prev, [id]: { ...formData, connectedAt: new Date().toLocaleString() } }));
    }
    setOpenDialog(null);
    showSnack(`✅ Connected successfully! Messages will now appear in your Social Inbox.`, 'success');
  };

  const showSnack = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const currentDialog = openDialog
    ? openDialog.type === 'social'
      ? SOCIAL_PLATFORMS.find(p => p.id === openDialog.id)
      : EMAIL_PROVIDERS.find(p => p.id === openDialog.id)
    : null;

  const connectedSocialCount = Object.keys(connectedPlatforms).length;
  const connectedEmailCount = Object.keys(connectedEmails).length;

  return (
    <Box>
      <PageHeader
        title="Integrations"
        subtitle="Connect your social media channels and email accounts — all your messages flow into one unified inbox."
      />

      {/* ─── Stats Row ─── */}
      <Box className="grid grid-cols-12 gap-2" sx={{ mb: 3 }}>
        {[
          { label: 'Social Channels Connected', value: connectedSocialCount, total: SOCIAL_PLATFORMS.length, color: '#6366F1', icon: '📱' },
          { label: 'Email Accounts Connected', value: connectedEmailCount, total: EMAIL_PROVIDERS.length, color: '#10B981', icon: '📧' },
        ].map(stat => (
          <Box className="col-span-6 sm:col-span-3" key={stat.label}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '2px solid', borderColor: 'divider', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: stat.color } }}>
              <Typography variant="h2" sx={{ fontSize: '2rem', mb: 0.5 }}>{stat.icon}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{stat.label}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>of {stat.total} available</Typography>
            </Paper>
          </Box>
        ))}
      </Box>


      {/* ─── Tabs ─── */}
      <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ px: 3, pt: 1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>📱 Social Media Channels {connectedSocialCount > 0 && <Chip label={connectedSocialCount} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />}</Box>}
          />
          <Tab
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>📧 Email Integration {connectedEmailCount > 0 && <Chip label={connectedEmailCount} size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />}</Box>}
          />

        </Tabs>

        {/* ─── Tab 0: Social Media ─── */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect your social media accounts. Once connected, all incoming messages and leads will automatically appear in your <strong>Social Inbox</strong>.
            </Typography>
            <Box className="grid grid-cols-12 gap-2">
              {SOCIAL_PLATFORMS.map((platform) => {
                const isConnected = !!connectedPlatforms[platform.id];
                return (
                  <Box className="col-span-12 sm:col-span-6 md:col-span-4" key={platform.id}>
                    <Paper
                      sx={{
                        p: 0,
                        borderRadius: 3,
                        border: '1.5px solid',
                        borderColor: isConnected ? platform.color : `${platform.color}30`,
                        boxShadow: isConnected
                          ? `0 4px 20px ${platform.color}30`
                          : `0 2px 8px rgba(0,0,0,0.06)`,
                        background: isConnected
                          ? `linear-gradient(135deg, ${platform.bg} 0%, #ffffff 100%)`
                          : 'background.paper',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: platform.color,
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 36px ${platform.color}35`,
                        },
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top accent bar */}
                      <Box sx={{
                        height: 4,
                        background: `linear-gradient(90deg, ${platform.color}, ${platform.color}88)`,
                        borderRadius: '12px 12px 0 0',
                      }} />

                      <Box sx={{ p: 2.5 }}>
                        {/* Connected badge */}
                        {isConnected && (
                          <Box sx={{ position: 'absolute', top: 16, right: 12 }}>
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />}
                              label="Connected"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                bgcolor: `${platform.color}18`,
                                color: platform.color,
                                border: `1px solid ${platform.color}40`,
                                '& .MuiChip-icon': { color: platform.color }
                              }}
                            />
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Box sx={{
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2.5,
                            background: `linear-gradient(135deg, ${platform.color}18, ${platform.color}08)`,
                            border: `1.5px solid ${platform.color}30`,
                            boxShadow: `0 2px 8px ${platform.color}20`,
                            flexShrink: 0,
                          }}>
                            {platform.logo ? (
                              <img src={platform.logo} alt={platform.name} style={{ width: 26, height: 26, objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='inline'; }} />
                            ) : null}
                            <span style={{ display: platform.logo ? 'none' : 'inline', fontSize: '1.4rem', lineHeight: 1 }}>{platform.emoji}</span>
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: platform.color, lineHeight: 1.2, fontSize: '0.95rem' }}>
                              {platform.name}
                            </Typography>
                            <Chip label={platform.badge} size="small" sx={{
                              height: 16,
                              fontSize: '0.55rem',
                              fontWeight: 700,
                              mt: 0.3,
                              bgcolor: `${platform.color}12`,
                              color: platform.color,
                              border: `1px solid ${platform.color}25`,
                            }} />
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.78rem', lineHeight: 1.55 }}>
                          {platform.description}
                        </Typography>

                        {isConnected && (
                          <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: platform.color, fontWeight: 600, opacity: 0.7 }}>
                            ✓ Connected {connectedPlatforms[platform.id].connectedAt}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {isConnected ? (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => handleOpenConnect('social', platform.id)}
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  borderColor: platform.color,
                                  color: platform.color,
                                  '&:hover': { bgcolor: `${platform.color}10`, borderColor: platform.color }
                                }}
                              >
                                Reconfigure
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<LinkOffIcon />}
                                onClick={() => handleDisconnect('social', platform.id)}
                                sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<LinkIcon />}
                                onClick={() => handleOpenConnect('social', platform.id)}
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                                  boxShadow: `0 4px 12px ${platform.color}40`,
                                  '&:hover': {
                                    background: `linear-gradient(135deg, ${platform.color}ee, ${platform.color})`,
                                    boxShadow: `0 6px 16px ${platform.color}50`,
                                  }
                                }}
                              >
                                Connect
                              </Button>
                              {platform.docs && (
                                <Tooltip title="View API Documentation">
                                  <IconButton size="small" href={platform.docs} target="_blank" sx={{ color: 'text.secondary' }}>
                                    <OpenInNewIcon sx={{ fontSize: '0.9rem' }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ─── Tab 1: Email Integration ─── */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect your business email accounts. Incoming emails from clients will appear in the CRM inbox and be linked to their client profiles automatically.
            </Typography>

            <Box className="grid grid-cols-12 gap-2">
              {EMAIL_PROVIDERS.map((provider) => {
                const isConnected = !!connectedEmails[provider.id];
                return (
                  <Box className="col-span-12 sm:col-span-6 md:col-span-4" key={provider.id}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: isConnected ? provider.color : 'divider',
                        boxShadow: 'none',
                        bgcolor: isConnected ? provider.bg : 'background.paper',
                        transition: 'all 0.25s ease',
                        '&:hover': { borderColor: provider.color, transform: 'translateY(-2px)', boxShadow: `0 6px 24px ${provider.color}22` },
                        position: 'relative' }}
                    >
                      {isConnected && (
                        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                          <Chip icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />} label="Connected" size="small" color="success" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800 }} />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Typography variant="h4" sx={{ lineHeight: 1 }}>{provider.emoji}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: provider.color, lineHeight: 1.2 }}>
                          {provider.name}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {provider.description}
                      </Typography>

                      {isConnected && connectedEmails[provider.id]?.email && (
                        <Chip
                          label={connectedEmails[provider.id].email}
                          size="small"
                          color="success"
                          variant="outlined"
                          icon={<EmailIcon sx={{ fontSize: '0.8rem !important' }} />}
                          sx={{ mb: 1.5, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                      )}

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {isConnected ? (
                          <>
                            <Button size="small" variant="outlined" color="success" startIcon={<RefreshIcon />} onClick={() => handleOpenConnect('email', provider.id)} sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
                              Reconfigure
                            </Button>
                            <Button size="small" variant="outlined" color="error" startIcon={<LinkOffIcon />} onClick={() => handleDisconnect('email', provider.id)} sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<LinkIcon />}
                            onClick={() => handleOpenConnect('email', provider.id)}
                            sx={{ fontSize: '0.75rem', fontWeight: 700, bgcolor: provider.color, '&:hover': { bgcolor: provider.color, opacity: 0.9 } }}
                          >
                            Connect
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                );
              })}
            </Box>

            {/* Email Settings */}
            {connectedEmailCount > 0 && (
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>📋 Email Sync Settings</Typography>
                <Box className="grid grid-cols-12 gap-2">
                  {[
                    { key: 'autoCreateLeads', label: 'Auto-create leads from new emails', desc: 'Unknown senders automatically become new leads' },
                    { key: 'syncSentEmails', label: 'Sync sent emails to CRM', desc: 'Replies you send are saved in client history' },
                    { key: 'attachToClients', label: 'Auto-link emails to client profiles', desc: 'Emails matched by email address to existing clients' },
                    { key: 'autoReply', label: 'Send auto-reply to new inquiries', desc: 'Automatically reply with a confirmation email' },
                  ].map(setting => (
                    <Box className="col-span-12 sm:col-span-6" key={setting.key}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{setting.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{setting.desc}</Typography>
                        </Box>
                        <Switch
                          checked={emailSettings[setting.key]}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        )}


      </Paper>

      {/* ─── Connect Dialog ─── */}
      <Dialog open={!!openDialog} onClose={() => setOpenDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {currentDialog && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h4" sx={{ lineHeight: 1 }}>{currentDialog.emoji}</Typography>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Connect {currentDialog.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Enter your credentials to link this integration</Typography>
                </Box>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  🔒 Your credentials are stored securely. We never share or log your tokens.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {currentDialog.fields.map((field) => (
                  <Box key={field.key}>
                    <TextField
                      fullWidth
                      size="small"
                      label={field.label}
                      placeholder={field.placeholder}
                      type={field.isPassword && !showPassword[field.key] ? 'password' : 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      InputProps={field.isPassword ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(prev => ({ ...prev, [field.key]: !prev[field.key] }))}>
                              {showPassword[field.key] ? <VisibilityOffIcon sx={{ fontSize: '1rem' }} /> : <VisibilityIcon sx={{ fontSize: '1rem' }} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      } : undefined}
                    />
                    {field.hint && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', pl: 0.5 }}>
                        💡 {field.hint}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {currentDialog.docs && (
                <Box sx={{ mt: 3, p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Need help? Read the official{' '}
                    <a href={currentDialog.docs} target="_blank" rel="noopener noreferrer" style={{ color: '#6366F1', fontWeight: 700 }}>
                      API Documentation ↗
                    </a>
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button onClick={() => setOpenDialog(null)} variant="outlined" color="inherit" sx={{ fontWeight: 700 }}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                startIcon={<LinkIcon />}
                sx={{ fontWeight: 700, bgcolor: currentDialog.color, '&:hover': { bgcolor: currentDialog.color, opacity: 0.9 } }}
              >
                Connect {currentDialog.name}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ─── Snackbar ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Integrations;
