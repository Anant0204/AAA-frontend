import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';

import PeopleIcon from '@mui/icons-material/People';
import PersonCheckIcon from '@mui/icons-material/HowToReg';
import EuroIcon from '@mui/icons-material/Euro';
import CampaignIcon from '@mui/icons-material/Campaign';
import StarIcon from '@mui/icons-material/Star';
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import PageHeader from '../../components/PageHeader';

const ALL_SOURCES = [
  'Facebook Ads', 'Instagram Ads', 'TikTok Ads', 'Google Ads',
  'Website Leads', 'WhatsApp Leads', 'Referrals', 'Organic Social Media',
  'Agent Referral', 'LinkedIn', 'Twitter/X', 'YouTube Ads',
];

const SOURCE_COLORS = {
  'Facebook Ads': '#1877F2', 'Instagram Ads': '#E1306C', 'TikTok Ads': '#010101',
  'Google Ads': '#4285F4', 'Website Leads': '#0EA5E9', 'WhatsApp Leads': '#25D366',
  'Referrals': '#8B5CF6', 'Organic Social Media': '#F59E0B', 'Agent Referral': '#EC4899',
  'LinkedIn': '#0077B5', 'Twitter/X': '#1DA1F2', 'YouTube Ads': '#FF0000' };

export const OperationsMarketing = () => {
  const { data: allLeads = [] } = useQuery({ queryKey: ['leads'], queryFn: dbService.getLeads });
  const { data: allClients = [] } = useQuery({ queryKey: ['clients'], queryFn: dbService.getClients });
  const { data: allPayments = [] } = useQuery({ queryKey: ['payments'], queryFn: dbService.getPayments });

  const getSourceStats = () => {
    const stats = {};
    ALL_SOURCES.forEach(src => {
      stats[src] = { count: 0, qualified: 0, consultations: 0, paidClients: 0, revenue: 0 };
    });

    allLeads.forEach((lead) => {
      const leadSource = lead.source || 'Organic Social Media';
      let matchedSource = 'Organic Social Media';

      if (leadSource.toLowerCase().includes('facebook')) matchedSource = 'Facebook Ads';
      else if (leadSource.toLowerCase().includes('instagram')) matchedSource = 'Instagram Ads';
      else if (leadSource.toLowerCase().includes('tiktok')) matchedSource = 'TikTok Ads';
      else if (leadSource.toLowerCase().includes('google')) matchedSource = 'Google Ads';
      else if (leadSource.toLowerCase().includes('website')) matchedSource = 'Website Leads';
      else if (leadSource.toLowerCase().includes('whatsapp')) matchedSource = 'WhatsApp Leads';
      else if (leadSource.toLowerCase().includes('referral') || leadSource.toLowerCase().includes('reference')) matchedSource = 'Referrals';
      else if (leadSource.toLowerCase().includes('agent')) matchedSource = 'Agent Referral';
      else if (leadSource.toLowerCase().includes('linkedin')) matchedSource = 'LinkedIn';
      else if (leadSource.toLowerCase().includes('twitter') || leadSource.toLowerCase().includes('x.com')) matchedSource = 'Twitter/X';
      else if (leadSource.toLowerCase().includes('youtube')) matchedSource = 'YouTube Ads';

      if (!stats[matchedSource]) stats[matchedSource] = { count: 0, qualified: 0, consultations: 0, paidClients: 0, revenue: 0 };
      stats[matchedSource].count += 1;

      if (lead.status && !['New Lead', 'Lost'].includes(lead.status)) stats[matchedSource].qualified += 1;
      if (lead.status && ['Under Consultation', 'Processing', 'Converted', 'Client'].includes(lead.status)) stats[matchedSource].consultations += 1;

      const client = allClients.find(c => c.email === lead.email);
      if (client) {
        const clientPayments = allPayments.filter(p => p.clientId === client.id && p.status === 'Paid');
        if (clientPayments.length > 0) {
          stats[matchedSource].paidClients += 1;
          stats[matchedSource].revenue += clientPayments.reduce((sum, p) => sum + (p.totalPaid || p.amount || 0), 0);
        }
      }
    });
    return stats;
  };

  const sourceStats = getSourceStats();
  const totalLeadsCount = allLeads.length;
  const totalQualifiedLeads = Object.values(sourceStats).reduce((s, d) => s + d.qualified, 0);
  const totalPaidClients = Object.values(sourceStats).reduce((s, d) => s + d.paidClients, 0);
  const totalRevenue = Object.values(sourceStats).reduce((s, d) => s + d.revenue, 0);
  const overallConversionRate = totalLeadsCount > 0 ? Math.round((totalPaidClients / totalLeadsCount) * 100) : 0;
  const bestLeadSource = Object.entries(sourceStats).filter(([, d]) => d.count > 0).sort(([, a], [, b]) => b.count - a.count)[0]?.[0] || '—';
  const bestCampaign = Object.entries(sourceStats).filter(([, d]) => d.revenue > 0).sort(([, a], [, b]) => b.revenue - a.revenue)[0]?.[0] || '—';

  const topKPIs = [
    { label: 'Total Leads', value: totalLeadsCount, icon: <PeopleIcon />, color: '#3B82F6', bg: '#EFF6FF', tooltip: 'Total leads across all channels.' },
    { label: 'Qualified Leads', value: totalQualifiedLeads, icon: <PersonCheckIcon />, color: '#8B5CF6', bg: '#F5F3FF', tooltip: 'Leads past New Lead stage.' },
    { label: 'Paid Clients', value: totalPaidClients, icon: <StarIcon />, color: '#10B981', bg: '#ECFDF5', tooltip: 'Leads converted to paying clients.' },
    { label: 'Conversion Rate', value: overallConversionRate, icon: <PercentIcon />, color: '#F59E0B', bg: '#FFFBEB', suffix: '%', tooltip: 'Paid Clients ÷ Total Leads × 100' },
    { label: 'Revenue Generated', value: totalRevenue, icon: <EuroIcon />, color: '#10B981', bg: '#ECFDF5', prefix: '€', tooltip: 'Total revenue from marketing leads.' },
    { label: 'Best Lead Source', value: bestLeadSource, icon: <StarIcon />, color: SOURCE_COLORS[bestLeadSource] || '#6366F1', bg: '#EEF2FF', isText: true, tooltip: 'Channel with most leads.' },
    { label: 'Best Campaign', value: bestCampaign, icon: <CampaignIcon />, color: SOURCE_COLORS[bestCampaign] || '#EC4899', bg: '#FDF2F8', isText: true, tooltip: 'Channel with highest revenue.' },
    { label: 'Total Meetings', value: Object.values(sourceStats).reduce((s, d) => s + d.consultations, 0), icon: <AttachMoneyIcon />, color: '#6366F1', bg: '#EEF2FF', tooltip: 'Total consultation meetings from leads.' },
  ];

  return (
    <Box>
      <PageHeader
        title="Marketing Analytics Dashboard"
        subtitle="Track leads, conversions, revenue and best-performing channels across all platforms including TikTok Ads."
      />

      <Box className="grid grid-cols-12 gap-2" sx={{ mb: 4 }}>
        {topKPIs.map((kpi) => (
          <Box className="col-span-6 sm:col-span-4 md:col-span-3" key={kpi.label}>
            <Tooltip title={kpi.tooltip} placement="top" arrow>
              <Paper sx={{ p: 2, borderRadius: 3, border: '2px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: kpi.bg, cursor: 'default', transition: 'all 0.2s ease', '&:hover': { borderColor: kpi.color, transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${kpi.color}22` } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: kpi.color, display: 'flex', fontSize: '1.1rem' }}>{kpi.icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    {kpi.label}
                  </Typography>
                </Box>
                <Typography variant={kpi.isText ? 'subtitle1' : 'h5'} sx={{ fontWeight: 900, color: kpi.color, lineHeight: 1 }}>
                  {kpi.prefix || ''}{kpi.isText ? kpi.value : (typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value)}{kpi.suffix || ''}
                </Typography>
              </Paper>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <Box className="grid grid-cols-12 gap-2">
        {Object.entries(sourceStats).filter(([, d]) => d.count > 0).map(([sourceName, data]) => {
          const convRate = data.count > 0 ? Math.round((data.paidClients / data.count) * 100) : 0;
          const sharePercent = totalLeadsCount > 0 ? Math.round((data.count / totalLeadsCount) * 100) : 0;
          const srcColor = SOURCE_COLORS[sourceName] || '#6366F1';
          return (
            <Box className="col-span-12 sm:col-span-6 md:col-span-4" key={sourceName}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '2px solid', borderColor: 'divider', boxShadow: 'none', transition: 'all 0.2s ease', '&:hover': { borderColor: srcColor, transform: 'translateY(-2px)' }, borderLeft: `4px solid ${srcColor}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: srcColor }}>{sourceName}</Typography>
                  <Chip label={`${convRate}%`} size="small" color={convRate > 20 ? 'success' : 'default'} sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: srcColor, mb: 1 }}>{data.count}</Typography>
                <Typography variant="caption" color="text.secondary">leads — {sharePercent}% of total</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box className="grid grid-cols-12 gap-1">
                  {[['Qualified', data.qualified], ['Meetings', data.consultations], ['Paid Clients', data.paidClients], ['Revenue', `€${data.revenue.toLocaleString()}`]].map(([lbl, val]) => (
                    <Box className="col-span-6" key={lbl}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>{lbl}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{val}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 1.5 }}>
                  <LinearProgress variant="determinate" value={convRate} sx={{ height: 6, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: srcColor } }} />
                </Box>
              </Paper>
            </Box>
          );
        })}

        <Box className="col-span-12 md:col-span-6">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Lead Source Distribution</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Share of total leads per channel.</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {Object.entries(sourceStats).filter(([, d]) => d.count > 0).sort(([, a], [, b]) => b.count - a.count).map(([sourceName, data]) => {
                const sharePercent = totalLeadsCount > 0 ? Math.round((data.count / totalLeadsCount) * 100) : 0;
                const srcColor = SOURCE_COLORS[sourceName] || '#6366F1';
                return (
                  <Box key={sourceName}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: srcColor }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{sourceName}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{data.count} ({sharePercent}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={sharePercent} sx={{ height: 8, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: srcColor } }} />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>

        <Box className="col-span-12 md:col-span-6">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Revenue by Channel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Revenue from paid clients per source.</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {Object.entries(sourceStats).filter(([, d]) => d.revenue > 0).sort(([, a], [, b]) => b.revenue - a.revenue).map(([sourceName, data]) => {
                const revenuePercent = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0;
                const srcColor = SOURCE_COLORS[sourceName] || '#6366F1';
                return (
                  <Box key={sourceName}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: srcColor }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{sourceName}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>€{data.revenue.toLocaleString()} ({revenuePercent}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={revenuePercent} sx={{ height: 8, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: srcColor } }} />
                  </Box>
                );
              })}
              {totalRevenue === 0 && <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 3 }}>No revenue data yet.</Typography>}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default OperationsMarketing;
