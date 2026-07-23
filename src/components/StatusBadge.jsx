import React from 'react';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';

export const StatusBadge = ({ status, size = 'small' }) => {
  const { data: leadStages = [] } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: dbService.getLeadStages,
    staleTime: 300000
  });

  const getBadgeConfig = (statusStr) => {
    const sStr = statusStr || '';
    
    // Check dynamic stages
    const matchedStage = leadStages.find(stage => 
      stage.name.toLowerCase() === sStr.toLowerCase() || stage.id.toLowerCase() === sStr.toLowerCase()
    );

    if (matchedStage) {
      return {
        label: matchedStage.name,
        color: 'default',
        icon: <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}>{matchedStage.emoji || 'ℹ️'}</span>,
        bg: (matchedStage.color || '#2196F3') + '15',
        text: matchedStage.color || '#2196F3'
      };
    }

    const s = sStr.toLowerCase();
    switch (s) {
      // Leads & Clients
      case 'new lead':
      case 'new':
        return { label: statusStr, color: 'info', icon: <InfoIcon size={14} />, bg: '#E0F2FE', text: '#0369A1' };
      case 'processing':
      case 'under consultation':
      case 'document preparation':
      case 'document review':
      case 'nie / local registration':
      case 'apostille & translations':
        return { label: statusStr, color: 'primary', icon: <AutorenewIcon size={14} />, bg: '#EEF2F6', text: '#0F172A' };
      case 'documents pending':
      case 'waiting for payment':
      case 'pending acceptance':
        return { label: statusStr, color: 'warning', icon: <HourglassEmptyIcon size={14} />, bg: '#FEF3C7', text: '#D97706' };
      case 'under process':
      case 'submitted - pending decision':
        return { label: statusStr, color: 'secondary', icon: <HourglassEmptyIcon size={14} />, bg: '#DBEAFE', text: '#2563EB' };
      case 'completed':
      case 'visa approved':
      case 'paid':
      case 'approved':
        return { label: statusStr, color: 'success', icon: <CheckCircleIcon size={14} />, bg: '#DCFCE7', text: '#15803D' };
      case 'declined':
        return { label: statusStr, color: 'error', icon: <CancelIcon size={14} />, bg: '#FEE2E2', text: '#B91C1C' };
      case 'cancelled':
      case 'no show':
      case 'failed':
      case 'rejected':
        return { label: statusStr, color: 'error', icon: <CancelIcon size={14} />, bg: '#FEE2E2', text: '#B91C1C' };
      case 'cold lead':
        return { label: statusStr, color: 'default', icon: <BlockIcon size={14} />, bg: '#F1F5F9', text: '#64748B' };
      case 'lost lead':
      case 'closed':
        return { label: statusStr, color: 'default', icon: <BlockIcon size={14} />, bg: '#E2E8F0', text: '#475569' };
      default:
        return { label: statusStr, color: 'default', icon: null, bg: '#F3F4F6', text: '#374151' };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size={size}
      sx={{
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.text,
        borderRadius: '6px',
        '& .MuiChip-icon': {
          color: 'inherit',
          fontSize: '14px',
        },
      }}
    />
  );
};

export default StatusBadge;
