import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlert } from '../../contexts/AlertContext';
import { dbService } from '../../services/dbService';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import PersonCheckIcon from '@mui/icons-material/HowToReg';
import EuroIcon from '@mui/icons-material/Euro';
import CampaignIcon from '@mui/icons-material/Campaign';
import StarIcon from '@mui/icons-material/Star';
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';

// All lead sources including TikTok
const ALL_SOURCES = [
  'Facebook Ads',
  'Instagram Ads',
  'TikTok Ads',
  'Google Ads',
  'Website Leads',
  'WhatsApp Leads',
  'Referrals',
  'Organic Social Media',
  'Agent Referral',
  'LinkedIn',
  'Twitter/X',
  'YouTube Ads',
];

// Source color mapping
const SOURCE_COLORS = {
  'Facebook Ads':       '#1877F2',
  'Instagram Ads':      '#E1306C',
  'TikTok Ads':         '#010101',
  'Google Ads':         '#4285F4',
  'Website Leads':      '#0EA5E9',
  'WhatsApp Leads':     '#25D366',
  'Referrals':          '#8B5CF6',
  'Organic Social Media': '#F59E0B',
  'Agent Referral':     '#EC4899',
  'LinkedIn':           '#0077B5',
  'Twitter/X':          '#1DA1F2',
  'YouTube Ads':        '#FF0000' };

export const SuperAdminMarketing = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { currentUser } = useAuth();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const roleConfig = (customizationSettings?.[currentUser?.id] || customizationSettings?.[currentUser?.role]) || {};
  const marketingActions = roleConfig.actions?.marketing || { canUpdateMarketingSpend: true };

  const { data: allLeads = [] } = useQuery({ queryKey: ['leads'], queryFn: dbService.getLeads });
  const { data: allClients = [] } = useQuery({ queryKey: ['clients'], queryFn: dbService.getClients });
  const { data: allPayments = [] } = useQuery({ queryKey: ['payments'], queryFn: dbService.getPayments });
  const { data: fetchedSpend } = useQuery({ queryKey: ['marketingSpend'], queryFn: dbService.getMarketingSpend });

  // Ad Spend per source — manually editable by Super Admin
  const [adSpend, setAdSpend] = useState({});
  const [showAdSpendEditor, setShowAdSpendEditor] = useState(false);

  useEffect(() => {
    // Populate default values safely without causing infinite render loops
    const resolvedSpend = fetchedSpend || {};
    let needsUpdate = false;
    const newSpend = { ...adSpend };

    ALL_SOURCES.forEach(src => {
      const targetVal = resolvedSpend[src] !== undefined ? Number(resolvedSpend[src]) : 0;
      if (adSpend[src] !== targetVal) {
        newSpend[src] = targetVal;
        needsUpdate = true;
      }
    });

    if (needsUpdate || Object.keys(adSpend).length === 0) {
      setAdSpend(newSpend);
    }
  }, [fetchedSpend]);

  const updateSpendMutation = useMutation({
    mutationFn: dbService.updateMarketingSpend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingSpend'] });
      showAlert('Ad spend configuration saved!', 'success');
      setShowAdSpendEditor(false);
    },
    onError: () => {
      showAlert('Failed to save ad spend configuration', 'error');
    }
  });

  const handleSaveAdSpend = () => {
    updateSpendMutation.mutate(adSpend);
  };

  // Build source stats
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

      if (!stats[matchedSource]) {
        stats[matchedSource] = { count: 0, qualified: 0, consultations: 0, paidClients: 0, revenue: 0 };
      }

      stats[matchedSource].count += 1;

      if (lead.status && !['New Lead', 'Lost'].includes(lead.status)) {
        stats[matchedSource].qualified += 1;
      }

      if (lead.status && ['Under Consultation', 'Processing', 'Converted', 'Client'].includes(lead.status)) {
        stats[matchedSource].consultations += 1;
      }

      const client = allClients.find(c => c.email === lead.email);
      if (client) {
        const clientPayments = allPayments.filter(p => p.clientId === client.id && p.status === 'Paid');
        if (clientPayments.length > 0) {
          stats[matchedSource].paidClients += 1;
          const totalPaid = clientPayments.reduce((sum, p) => sum + (p.totalPaid || p.amount || 0), 0);
          stats[matchedSource].revenue += totalPaid;
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
  const totalAdSpend = Object.values(adSpend).reduce((s, v) => s + v, 0);
  const overallConversionRate = totalLeadsCount > 0 ? Math.round((totalPaidClients / totalLeadsCount) * 100) : 0;
  const roiPercent = totalAdSpend > 0 ? Math.round(((totalRevenue - totalAdSpend) / totalAdSpend) * 100) : 0;
  const costPerPaidClient = totalPaidClients > 0 ? Math.round(totalAdSpend / totalPaidClients) : 0;

  // Best Lead Source (most leads)
  const bestLeadSource = Object.entries(sourceStats)
    .filter(([, d]) => d.count > 0)
    .sort(([, a], [, b]) => b.count - a.count)[0]?.[0] || '—';

  // Best Campaign (highest revenue)
  const bestCampaign = Object.entries(sourceStats)
    .filter(([, d]) => d.revenue > 0)
    .sort(([, a], [, b]) => b.revenue - a.revenue)[0]?.[0] || '—';

  const topKPIs = [
    {
      label: 'Total Leads',
      value: totalLeadsCount,
      icon: <PeopleIcon />,
      color: '#3B82F6',
      bg: '#EFF6FF',
      suffix: '',
      tooltip: 'Total number of leads captured across all channels.'
    },
    {
      label: 'Qualified Leads',
      value: totalQualifiedLeads,
      icon: <PersonCheckIcon />,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      suffix: '',
      tooltip: 'Leads that progressed past "New Lead" and are actively engaged.'
    },
    {
      label: 'Paid Clients',
      value: totalPaidClients,
      icon: <StarIcon />,
      color: '#10B981',
      bg: '#ECFDF5',
      suffix: '',
      tooltip: 'Leads who became paying clients with at least one paid invoice.'
    },
    {
      label: 'Conversion Rate',
      value: overallConversionRate,
      icon: <PercentIcon />,
      color: '#F59E0B',
      bg: '#FFFBEB',
      suffix: '%',
      tooltip: 'Paid Clients ÷ Total Leads × 100'
    },
    {
      label: 'Total Ad Spend',
      value: totalAdSpend,
      icon: <CampaignIcon />,
      color: '#EF4444',
      bg: '#FEF2F2',
      prefix: '€',
      tooltip: 'Total marketing budget spent across all paid ad channels. Edit per-source below.'
    },
    {
      label: 'Revenue Generated',
      value: totalRevenue,
      icon: <EuroIcon />,
      color: '#10B981',
      bg: '#ECFDF5',
      prefix: '€',
      tooltip: 'Total revenue from paid invoices attributed to marketing-sourced clients.'
    },
    {
      label: 'ROI %',
      value: roiPercent,
      icon: roiPercent >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
      color: roiPercent >= 0 ? '#10B981' : '#EF4444',
      bg: roiPercent >= 0 ? '#ECFDF5' : '#FEF2F2',
      suffix: '%',
      tooltip: 'Return on Investment = (Revenue − Ad Spend) ÷ Ad Spend × 100'
    },
    {
      label: 'Best Lead Source',
      value: bestLeadSource,
      icon: <StarIcon />,
      color: SOURCE_COLORS[bestLeadSource] || '#6366F1',
      bg: '#EEF2FF',
      isText: true,
      tooltip: 'Channel that generated the highest number of total leads.'
    },
    {
      label: 'Best Campaign',
      value: bestCampaign,
      icon: <CampaignIcon />,
      color: SOURCE_COLORS[bestCampaign] || '#EC4899',
      bg: '#FDF2F8',
      isText: true,
      tooltip: 'Channel that generated the highest total revenue from paid clients.'
    },
    {
      label: 'Cost Per Paid Client',
      value: costPerPaidClient,
      icon: <AttachMoneyIcon />,
      color: '#6366F1',
      bg: '#EEF2FF',
      prefix: '€',
      tooltip: 'Total Ad Spend ÷ Total Paid Clients — how much acquisition cost per paying client.'
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Marketing Analytics Dashboard"
        subtitle="10 KPI metrics — Total Leads, Qualified Leads, Paid Clients, Conversion Rate, Ad Spend, Revenue, ROI, Best Source, Best Campaign, Cost Per Client."
      />

      {/* ─── 10 KPI Cards ─── */}
      <Box className="grid grid-cols-12 gap-2" sx={{ mb: 4 }}>
        {topKPIs.map((kpi) => (
          <Box className="col-span-6 sm:col-span-4" md={2.4} key={kpi.label}>
            <Tooltip title={kpi.tooltip} placement="top" arrow>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  bgcolor: kpi.bg,
                  cursor: 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: kpi.color, transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${kpi.color}22` },
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: kpi.color, display: 'flex', fontSize: '1.1rem' }}>{kpi.icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1.2, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    {kpi.label}
                  </Typography>
                </Box>
                <Typography
                  variant={kpi.isText ? 'subtitle1' : 'h5'}
                  sx={{ fontWeight: 900, color: kpi.color, lineHeight: 1 }}
                >
                  {kpi.prefix || ''}{kpi.isText ? kpi.value : (typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value)}{kpi.suffix || ''}
                </Typography>
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <InfoOutlinedIcon sx={{ fontSize: '0.8rem', color: 'text.disabled' }} />
                </Box>
              </Paper>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {/* ─── Ad Spend Editor ─── */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Ad Spend Configuration</Typography>
            <Typography variant="body2" color="text.secondary">Enter monthly ad budget per channel to calculate ROI & Cost Per Client.</Typography>
          </Box>
          {marketingActions.canUpdateMarketingSpend !== false && (
            <Chip
              label={showAdSpendEditor ? 'Cancel' : 'Edit Ad Spend'}
              onClick={() => {
                if (showAdSpendEditor) {
                  // Reset to fetched on cancel
                  const newSpend = { ...fetchedSpend };
                  ALL_SOURCES.forEach(src => {
                    if (newSpend[src] === undefined) newSpend[src] = 0;
                  });
                  setAdSpend(newSpend);
                }
                setShowAdSpendEditor(!showAdSpendEditor);
              }}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, cursor: 'pointer' }}
            />
          )}
        </Box>

        {showAdSpendEditor && (
          <Box className="grid grid-cols-12 gap-2" sx={{ mt: 1 }}>
            {ALL_SOURCES.map((src) => (
              <Box className="col-span-6 sm:col-span-4 md:col-span-3" key={src}>
                <TextField
                  size="small"
                  label={src}
                  type="number"
                  value={adSpend[src] || 0}
                  onChange={(e) => setAdSpend(prev => ({ ...prev, [src]: Math.max(0, Number(e.target.value)) }))}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment> }}
                  sx={{ '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}
                />
              </Box>
            ))}
            <Box className="col-span-12 mt-2" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveAdSpend}
                disabled={updateSpendMutation.isLoading}
              >
                {updateSpendMutation.isLoading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Total Budget: <Box component="span" sx={{ color: 'error.main' }}>€{totalAdSpend.toLocaleString()}</Box>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Total Revenue: <Box component="span" sx={{ color: 'success.main' }}>€{totalRevenue.toLocaleString()}</Box>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            ROI: <Box component="span" sx={{ color: roiPercent >= 0 ? 'success.main' : 'error.main' }}>{roiPercent}%</Box>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Cost/Client: <Box component="span" sx={{ color: 'primary.main' }}>€{costPerPaidClient.toLocaleString()}</Box>
          </Typography>
        </Box>
      </Paper>

      <Box className="grid grid-cols-12 gap-2">
        {/* ─── Source-wise Cards ─── */}
        {Object.entries(sourceStats).filter(([, d]) => d.count > 0).map(([sourceName, data]) => {
          const convRate = data.count > 0 ? Math.round((data.paidClients / data.count) * 100) : 0;
          const sharePercent = totalLeadsCount > 0 ? Math.round((data.count / totalLeadsCount) * 100) : 0;
          const spend = adSpend[sourceName] || 0;
          const srcRoi = spend > 0 ? Math.round(((data.revenue - spend) / spend) * 100) : null;
          const srcColor = SOURCE_COLORS[sourceName] || '#6366F1';

          return (
            <Box className="col-span-12 sm:col-span-6 md:col-span-4" key={sourceName}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: srcColor, transform: 'translateY(-2px)' },
                  borderLeft: `4px solid ${srcColor}` }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: srcColor }}>
                    {sourceName}
                  </Typography>
                  {srcRoi !== null && (
                    <Chip
                      label={`ROI: ${srcRoi}%`}
                      size="small"
                      color={srcRoi >= 0 ? 'success' : 'error'}
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 1, mb: 1.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: srcColor }}>
                    {data.count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {sharePercent}% share
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box className="grid grid-cols-12 gap-1" sx={{ mb: 1.5 }}>
                  {[
                    { label: 'Qualified', val: data.qualified },
                    { label: 'Meetings', val: data.consultations },
                    { label: 'Paid Clients', val: data.paidClients },
                    { label: 'Revenue', val: `€${data.revenue.toLocaleString()}` },
                  ].map(item => (
                    <Box className="col-span-6" key={item.label}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {item.val}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Lead → Client Conversion
                  </Typography>
                  <Chip
                    label={`${convRate}%`}
                    size="small"
                    color={convRate > 30 ? 'success' : convRate > 10 ? 'warning' : 'default'}
                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={convRate}
                  sx={{ height: 6, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: srcColor } }}
                />

                {spend > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Ad Spend: €{spend.toLocaleString()} · Cost/Client: {data.paidClients > 0 ? `€${Math.round(spend / data.paidClients).toLocaleString()}` : '—'}
                  </Typography>
                )}
              </Paper>
            </Box>
          );
        })}

        {/* ─── Full Breakdown Table ─── */}
        <Box className="col-span-12">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Full Channel Performance Breakdown</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Complete KPI view: Total Leads → Qualified → Meetings → Paid Clients → Conversion % → Revenue → Ad Spend → ROI → Cost/Client
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.neutral' }}>
                    <TableCell sx={{ fontWeight: 800 }}>Lead Source</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Total Leads</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Qualified</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Meetings</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Paid Clients</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Conv. %</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Ad Spend</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">ROI %</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Cost/Client</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ALL_SOURCES.map((sourceName) => {
                    const data = sourceStats[sourceName] || { count: 0, qualified: 0, consultations: 0, paidClients: 0, revenue: 0 };
                    const convRate = data.count > 0 ? Math.round((data.paidClients / data.count) * 100) : 0;
                    const spend = adSpend[sourceName] || 0;
                    const roi = spend > 0 ? Math.round(((data.revenue - spend) / spend) * 100) : null;
                    const costPerClient = data.paidClients > 0 && spend > 0 ? Math.round(spend / data.paidClients) : null;
                    const srcColor = SOURCE_COLORS[sourceName] || '#6366F1';

                    return (
                      <TableRow key={sourceName} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: srcColor, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{sourceName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: data.count > 0 ? 800 : 400, color: data.count > 0 ? 'text.primary' : 'text.disabled' }}>
                            {data.count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{data.qualified}</TableCell>
                        <TableCell align="center">{data.consultations}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: data.paidClients > 0 ? 'success.main' : 'text.secondary' }}>
                            {data.paidClients}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {data.count > 0 ? (
                            <Chip label={`${convRate}%`} size="small" variant="outlined" color={convRate > 20 ? 'success' : 'default'} sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }} />
                          ) : '—'}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                            {data.revenue > 0 ? `€${data.revenue.toLocaleString()}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                            {spend > 0 ? `€${spend.toLocaleString()}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {roi !== null ? (
                            <Chip
                              label={`${roi}%`}
                              size="small"
                              color={roi >= 0 ? 'success' : 'error'}
                              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                            />
                          ) : '—'}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {costPerClient !== null ? `€${costPerClient.toLocaleString()}` : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Totals Row */}
                  <TableRow sx={{ bgcolor: 'background.neutral', borderTop: '2px solid', borderColor: 'divider' }}>
                    <TableCell sx={{ fontWeight: 900 }}>TOTAL</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900 }}>{totalLeadsCount}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900 }}>{totalQualifiedLeads}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900 }}>
                      {Object.values(sourceStats).reduce((s, d) => s + d.consultations, 0)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900, color: 'success.main' }}>{totalPaidClients}</TableCell>
                    <TableCell align="center">
                      <Chip label={`${overallConversionRate}%`} size="small" color={overallConversionRate > 20 ? 'success' : 'warning'} sx={{ fontWeight: 800, height: 20 }} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900, color: 'secondary.main' }}>€{totalRevenue.toLocaleString()}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900, color: 'error.main' }}>€{totalAdSpend.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip label={`${roiPercent}%`} size="small" color={roiPercent >= 0 ? 'success' : 'error'} sx={{ fontWeight: 800, height: 20 }} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      €{costPerPaidClient.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* ─── Lead Share Bar Chart ─── */}
        <Box className="col-span-12 md:col-span-5">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Lead Source Distribution</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Share of total leads across all channels.</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {Object.entries(sourceStats)
                .filter(([, d]) => d.count > 0)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([sourceName, data]) => {
                  const sharePercent = totalLeadsCount > 0 ? Math.round((data.count / totalLeadsCount) * 100) : 0;
                  const srcColor = SOURCE_COLORS[sourceName] || '#6366F1';
                  return (
                    <Box key={sourceName}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: srcColor }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{sourceName}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{data.count} ({sharePercent}%)</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={sharePercent}
                        sx={{ height: 8, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: srcColor } }}
                      />
                    </Box>
                  );
                })}
            </Box>
          </Paper>
        </Box>

        {/* ─── Revenue Bar Chart ─── */}
        <Box className="col-span-12 md:col-span-7">
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Revenue by Channel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Revenue generated from paid clients per acquisition source.</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {Object.entries(sourceStats)
                .filter(([, d]) => d.revenue > 0)
                .sort(([, a], [, b]) => b.revenue - a.revenue)
                .map(([sourceName, data]) => {
                  const revenuePercent = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0;
                  const srcColor = SOURCE_COLORS[sourceName] || '#6366F1';
                  return (
                    <Box key={sourceName}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: srcColor }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{sourceName}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                          €{data.revenue.toLocaleString()} ({revenuePercent}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={revenuePercent}
                        sx={{ height: 8, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: srcColor } }}
                      />
                    </Box>
                  );
                })}
              {totalRevenue === 0 && (
                <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 3 }}>
                  No paid revenue data linked to lead sources yet.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SuperAdminMarketing;
