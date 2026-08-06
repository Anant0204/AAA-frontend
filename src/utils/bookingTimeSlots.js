import dayjs from 'dayjs';

/**
 * Format total minutes from midnight to 12-hour formatted string (e.g. 720 -> "12:00 PM", 740 -> "12:20 PM")
 */
export function formatMinutesTo12h(totalMinutes) {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const strH = String(h12).padStart(2, '0');
  const strM = String(m).padStart(2, '0');
  return `${strH}:${strM} ${period}`;
}

/**
 * Format total minutes from midnight to 24-hour formatted string (e.g. 720 -> "12:00", 740 -> "12:20")
 */
export function formatMinutesTo24h(totalMinutes) {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const strH = String(h24).padStart(2, '0');
  const strM = String(m).padStart(2, '0');
  return `${strH}:${strM}`;
}

/**
 * Parse time string (whether "09:00", "12:00 PM", "03:00 PM", "15:00") into minutes from midnight
 */
export function parseTimeToMinutes(timeStr, defaultMinutes) {
  if (!timeStr) return defaultMinutes;
  const str = String(timeStr).trim().toUpperCase();
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const clean = str.replace(/[^\d:]/g, '');
  const parts = clean.split(':');
  let hour = parseInt(parts[0], 10);
  let min = parseInt(parts[1] || '0', 10);
  if (isNaN(hour)) return defaultMinutes;
  if (isNaN(min)) min = 0;
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return hour * 60 + min;
}

/**
 * Dynamically generate time slots based on Super Admin Customization Settings:
 * - bookingAllowedStart (e.g. '12:00' or '12:00 PM')
 * - bookingAllowedEnd (e.g. '15:00' or '03:00 PM')
 * - defaultMeetingDuration (e.g. 20 minutes)
 */
export function getAvailableTimeSlots(customizationSettings, selectedDate) {
  const flow = customizationSettings?.flowAutomationSettings || {};
  const duration = parseInt(flow.defaultMeetingDuration, 10) || 20; // Default 20 mins

  // Target day of the week (e.g., 'Monday', 'Tuesday', ...)
  let targetDay = null;
  if (selectedDate) {
    targetDay = dayjs(selectedDate).format('dddd');
  }

  // Determine windows list (support both new multi-window array & legacy single start/end string)
  let rawWindows = [];
  if (Array.isArray(flow.bookingWindows) && flow.bookingWindows.length > 0) {
    rawWindows = flow.bookingWindows;
  } else if (flow.bookingAllowedStart || flow.bookingAllowedEnd) {
    rawWindows = [{
      day: 'Everyday',
      startTime: flow.bookingAllowedStart || '09:00',
      endTime: flow.bookingAllowedEnd || '18:00'
    }];
  } else {
    rawWindows = [{ day: 'Everyday', startTime: '09:00', endTime: '18:00' }];
  }

  // Filter windows matching the selected day of the week
  if (targetDay) {
    const dayFilteredWindows = rawWindows.filter((win) => {
      if (!win.day || win.day === 'Everyday') return true;
      if (Array.isArray(win.days)) return win.days.includes(targetDay);
      return String(win.day).toLowerCase() === targetDay.toLowerCase();
    });

    const hasSpecificDayConfigs = rawWindows.some((w) => w.day && w.day !== 'Everyday');
    if (dayFilteredWindows.length > 0) {
      rawWindows = dayFilteredWindows;
    } else if (hasSpecificDayConfigs) {
      rawWindows = []; // No windows configured for this specific day
    }
  }

  const slots = [];

  rawWindows.forEach((win) => {
    if (!win || !win.startTime || !win.endTime) return;
    const startMins = parseTimeToMinutes(win.startTime, 9 * 60);
    const endMins = parseTimeToMinutes(win.endTime, 18 * 60);
    if (startMins >= endMins) return;

    let current = startMins;
    while (current + duration <= endMins) {
      const slotStart = current;
      const slotEnd = current + duration;

      const start12 = formatMinutesTo12h(slotStart);
      const end12 = formatMinutesTo12h(slotEnd);
      const start24 = formatMinutesTo24h(slotStart);
      const end24 = formatMinutesTo24h(slotEnd);

      let icon = '☀️';
      const hour24 = Math.floor(slotStart / 60);
      if (hour24 < 12) icon = '🌅';
      else if (hour24 >= 17 && hour24 < 19) icon = '🌇';
      else if (hour24 >= 19) icon = '🌙';

      const slotLabel12h = `${start12} – ${end12}`;

      if (!slots.some((s) => s.startMinutes === slotStart && s.endMinutes === slotEnd)) {
        slots.push({
          value: slotLabel12h,
          label: `${icon} ${slotLabel12h}`,
          display24h: `${start24} – ${end24}`,
          short24h: start24,
          short12h: start12,
          startMinutes: slotStart,
          endMinutes: slotEnd
        });
      }

      current += duration;
    }
  });

  // Fallback: If duration configuration results in empty list, generate 20-min slots from 9 to 18
  if (slots.length === 0) {
    let currentFallback = 9 * 60;
    const endFallback = 18 * 60;
    while (currentFallback + 20 <= endFallback) {
      const start12 = formatMinutesTo12h(currentFallback);
      const end12 = formatMinutesTo12h(currentFallback + 20);
      const slotLabel12h = `${start12} – ${end12}`;
      slots.push({
        value: slotLabel12h,
        label: `☀️ ${slotLabel12h}`,
        display24h: `${formatMinutesTo24h(currentFallback)} – ${formatMinutesTo24h(currentFallback + 20)}`,
        short24h: formatMinutesTo24h(currentFallback),
        short12h: start12,
        startMinutes: currentFallback,
        endMinutes: currentFallback + 20
      });
      currentFallback += 20;
    }
  }

  return slots;
}

export function getTomorrowMinDateStr() {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
}
