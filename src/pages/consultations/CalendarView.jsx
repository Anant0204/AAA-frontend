import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';

// Components & Services
import { dbService } from '../../services/dbService';
import PageHeader from '../../components/PageHeader';
import AppModal from '../../components/AppModal';
import StatCard from '../../components/StatCard';
import { useAlert } from '../../contexts/AlertContext';
import { SERVICES } from '../../constants/mockData';

export const CalendarView = () => {
    const [monthOffset, setMonthOffset] = useState(0);
const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const [cardInfo, setCardInfo] = useState(() => location.state?.cardInfo || null);

  useEffect(() => {
    if (location.state?.cardInfo) {
      setCardInfo(location.state.cardInfo);
    }
  }, [location.state]);

  const getCardIcon = (iconType) => {
    switch (iconType) {
      case 'PeopleAlt': return <PeopleAltIcon />;
      case 'Add': return <AddIcon />;
      case 'CalendarMonth': return <CalendarMonthIcon />;
      case 'Payments': return <PaymentsIcon />;
      case 'TrendingUp': return <TrendingUpIcon />;
      case 'Assignment': return <AssignmentIcon />;
      case 'CheckCircleOutlined': return <CheckCircleOutlinedIcon />;
      case 'WarningAmber': return <WarningAmberIcon />;
      case 'Receipt': return <ReceiptIcon />;
      case 'CreditCard': return <CreditCardIcon />;
      default: return null;
    }
  };

  const { currentUser, isConsultant, isViewOnlyMenu } = useAuth();

  const { data: customizationSettings } = useQuery({
    queryKey: ['customization-settings'],
    queryFn: dbService.getCustomizationSettings
  });

  const isViewOnly = isViewOnlyMenu(customizationSettings, 'Consultations');

  const [activeAgentId, setActiveAgentId] = useState(isConsultant ? currentUser?.id || '' : '');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // New consultation fields
  const [clientName, setClientName] = useState('');
  const [meetingTime, setMeetingTime] = useState('10:00');
  const [duration, setDuration] = useState(30);
  const [agentId, setAgentId] = useState(isConsultant ? currentUser?.id || 'c1' : 'c1');
  const [meetingNotes, setMeetingNotes] = useState('');

  // Sync with currentUser role/id changes
  useEffect(() => {
    if (isConsultant && currentUser) {
      setActiveAgentId(currentUser.id);
      setAgentId(currentUser.id);
    } else if (!isConsultant) {
      setActiveAgentId('');
    }
  }, [currentUser, isConsultant]);

  // Fetch consultations
  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations'],
    queryFn: dbService.getConsultations });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: dbService.getLeads });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: dbService.getAgents });

  // Mutations
  const createConsultationMutation = useMutation({
    mutationFn: dbService.createConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      showAlert('Consultation scheduled successfully', 'success');
      setScheduleModalOpen(false);
      setClientName('');
      setMeetingNotes('');
    } });

  const handleScheduleSubmit = () => {
    if (!clientName) {
      showAlert('Client name is required', 'warning');
      return;
    }
    
    // Find if lead exists to bind leadId
    const lead = leads.find(l => `${l.firstName} ${l.lastName}`.toLowerCase() === clientName.toLowerCase());

    createConsultationMutation.mutate({
      leadId: lead ? lead.id : null,
      clientName,
      meetingDate: selectedDate,
      meetingTime,
      durationMinutes: duration,
      assignedConsultantId: agentId,
      notes: meetingNotes });
  };

  const currentMonth = dayjs().add(monthOffset, 'month').startOf('month');
  const daysInMonth = currentMonth.daysInMonth();
  const yearMonthPrefix = currentMonth.format('YYYY-MM');
  
  const calendarCells = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${yearMonthPrefix}-${String(dayNum).padStart(2, '0')}`;
    const dayMeetings = consultations.filter(
      (c) =>
        c.meetingDate === dateStr &&
        (activeAgentId 
          ? (c.assignedConsultantId === activeAgentId || (isConsultant && !c.assignedConsultantId))
          : true)
    );
    return { dayNum, dateStr, meetings: dayMeetings };
  });

  // Current selected day meetings list
  const selectedDayMeetings = consultations.filter(
    (c) =>
      c.meetingDate === selectedDate &&
      (activeAgentId 
        ? (c.assignedConsultantId === activeAgentId || (isConsultant && !c.assignedConsultantId))
        : true)
  );

  return (
    <Box>
      <Button
        startIcon={<KeyboardArrowLeftIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2, color: 'text.secondary', display: 'inline-flex' }}
      >
        Back to Dashboard
      </Button>
      <PageHeader
        title="Agent Calendar Scheduler"
        subtitle="Manage upcoming consultation meetings, time allocations, and client booking schedules."
        action={
          !isViewOnly && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setScheduleModalOpen(true)}
            >
              Book Appointment
            </Button>
          )
        }
      />

      {cardInfo && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 3, 
            p: '12px 24px', 
            borderRadius: 3, 
            background: `linear-gradient(135deg, ${cardInfo.color}0D 0%, ${cardInfo.color}1E 100%)`, 
            border: '1px solid',
            borderColor: `${cardInfo.color}25`,
            boxShadow: `0 4px 20px ${cardInfo.color}08`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              backgroundColor: cardInfo.color,
              borderRadius: '12px 0 0 12px' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: `${cardInfo.color}25`, 
                color: cardInfo.color,
                '& svg': { fontSize: '1.25rem' }
              }}
            >
              {getCardIcon(cardInfo.iconType)}
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {cardInfo.title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {cardInfo.value}
            </Typography>
            {cardInfo.trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    p: '2px 8px',
                    borderRadius: '12px',
                    background: parseFloat(cardInfo.trend) >= 0 
                      ? 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)' 
                      : 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                >
                  {parseFloat(cardInfo.trend) >= 0 ? '↑' : '↓'} {cardInfo.trend}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.8 }}>
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3.5, alignItems: 'stretch', width: '100%' }}>
        {/* Left: Scheduler Settings & Day List */}
        <Box sx={{ flex: 1, minWidth: { md: '320px' }, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Filter */}
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Agent Filter
            </Typography>
            <TextField
              select
              value={activeAgentId}
              onChange={(e) => {
                setActiveAgentId(e.target.value);
                setCardInfo(null);
              }}
              label="Assigned Expert"
              fullWidth
              size="small"
              disabled={isConsultant}
            >
              <MenuItem value="">Show All Experts</MenuItem>
              {agents.filter(a => a.role === 'consultant').map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Paper>

          {/* Selected Date Meetings List */}
          <Paper sx={{ flexGrow: 1, p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Schedule for {selectedDate}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              {selectedDayMeetings.length} sessions booked
            </Typography>
            
            {selectedDayMeetings.length === 0 ? (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  No sessions scheduled for this date.
                </Typography>
              </Box>
            ) : (
              <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 400 }}>
                {selectedDayMeetings.map((mt) => {
                  const c = agents.find((cons) => cons.id === mt.assignedConsultantId);
                  return (
                    <ListItemButton
                      key={mt.id}
                      onClick={() => navigate(`/consultations/details/${mt.id}`)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        borderLeft: '4px solid',
                        borderLeftColor: 
                          mt.status === 'Completed' 
                            ? 'success.main' 
                            : (mt.status === 'Cancelled' || mt.status === 'No-Show' ? '#F59E0B' : 'secondary.main'),
                        bgcolor: 'background.neutral',
                        py: 1 }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {mt.clientName}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                              {mt.meetingTime}
                            </Typography>
                          </Box>
                        }
                        secondary={`Host: ${c ? c.name : 'Unknown'} (${mt.durationMinutes} min)`}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Paper>
        </Box>

        {/* Right: Calendar Grid */}
        <Box sx={{ flex: 2.2, minWidth: 0, width: '100%' }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{currentMonth.format('MMMM YYYY')}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton onClick={() => setMonthOffset(p => p - 1)}  size="small"><ArrowBackIosIcon fontSize="inherit" /></IconButton>
                <IconButton onClick={() => setMonthOffset(p => p + 1)}  size="small"><ArrowForwardIosIcon fontSize="inherit" /></IconButton>
              </Box>
            </Box>

            {/* Weekdays Labels */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1, textAlign: 'center', fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <Box key={day} sx={{ py: 0.5 }}>
                  {day}
                </Box>
              ))}
            </Box>

            {/* Calendar Cells Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, flexGrow: 1 }}>
              {calendarCells.map((cell) => {
                const isSelected = cell.dateStr === selectedDate;
                const hasMeetings = cell.meetings.length > 0;
                const hasNoShowOrCancelled = cell.meetings.some(m => m.status === 'Cancelled' || m.status === 'No-Show');
                
                // Color Code styling based on state (Available, Booked, Priority Rebooking)
                let borderStyle = '1px solid';
                let borderColor = 'divider';
                let bgColor = 'background.paper';
                
                if (isSelected) {
                  borderColor = 'secondary.main';
                  bgColor = 'background.neutral';
                } else if (hasNoShowOrCancelled) {
                  // Priority Rebooking: Orange highlights
                  borderStyle = '2px solid';
                  borderColor = '#F59E0B';
                  bgColor = '#FFFBEB';
                } else if (hasMeetings) {
                  // Booked: solid/neutral highlights
                  borderStyle = '1px solid';
                  borderColor = 'primary.main';
                  bgColor = '#F0F9FF';
                } else {
                  // Available: transparent green accents
                  borderStyle = '1px solid';
                  borderColor = '#10B981';
                  bgColor = '#ECFDF5';
                }

                return (
                  <Paper
                    key={cell.dayNum}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    sx={{
                      height: 72,
                      p: 1.2,
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: borderStyle,
                      borderColor: borderColor,
                      backgroundColor: bgColor,
                      boxShadow: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'secondary.main' } }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isSelected ? 800 : 500,
                        color: isSelected ? 'secondary.main' : 'text.primary' }}
                    >
                      {cell.dayNum}
                    </Typography>
                    {hasMeetings && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {cell.meetings.map((m) => (
                          <Box
                            key={m.id}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: 
                                m.status === 'Completed' 
                                  ? 'success.main' 
                                  : (m.status === 'Cancelled' || m.status === 'No-Show' ? '#F59E0B' : 'secondary.main') }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* MODAL: Book Consultation */}
      <AppModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={`Book Assessment Consultation for ${selectedDate}`}
        actions={
          <>
            <Button onClick={() => setScheduleModalOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              variant="contained"
              color="secondary"
              disabled={createConsultationMutation.isPending}
            >
              Book Session
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Policy Note Alert */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E' }}>
              ⚠️ IMPORTANT POLICY NOTE
            </Typography>
            <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 500, lineHeight: 1.4 }}>
              If you do not join your scheduled Free Eligibility Assessment within 10 minutes of the appointment time, your booking will be automatically cancelled. Rescheduling is not permitted due to high demand.
            </Typography>
          </Box>

          <Autocomplete
            freeSolo
            options={leads.map(lead => `${lead.firstName} ${lead.lastName}`)}
            value={clientName}
            onInputChange={(event, newInputValue) => {
              setClientName(newInputValue);
            }}
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setClientName(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client or Lead Name"
                placeholder="e.g. Amelia Watson"
                required
              />
            )}
          />

          <Box className="grid grid-cols-12 gap-2">
            <Box className="col-span-6">
              <TextField
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                label="Start Time"
                type="time"
                fullWidth
                required
              />
            </Box>
            <Box className="col-span-6">
              <FormControl fullWidth size="small">
                <InputLabel id="duration-select-label">Duration</InputLabel>
                <Select
                  labelId="duration-select-label"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  label="Duration"
                >
                  <MenuItem value={30}>30 Minutes</MenuItem>
                  <MenuItem value={45}>45 Minutes</MenuItem>
                  <MenuItem value={60}>60 Minutes</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <FormControl fullWidth size="small" disabled={isConsultant}>
            <InputLabel id="agent-host-select-label">Select Agent Host</InputLabel>
            <Select
              labelId="agent-host-select-label"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              label="Select Agent Host"
            >
              {agents.filter(a => a.role === 'consultant').map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            label="Meeting Objectives"
            multiline
            rows={3}
            fullWidth
            placeholder="Inquire passive income proofs or check remote work details..."
          />
        </Box>
      </AppModal>
    </Box>
  );
};

export default CalendarView;
