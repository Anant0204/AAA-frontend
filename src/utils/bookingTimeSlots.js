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
 * Robustly normalize any date string (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, Date object) to YYYY-MM-DD
 */
export function normalizeDateToYYYYMMDD(dateVal) {
  if (!dateVal) return '';
  const str = String(dateVal).trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const parts = str.split('/');
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const year = parts[2];
    
    if (p0 > 12) {
      return `${year}-${String(p1).padStart(2, '0')}-${String(p0).padStart(2, '0')}`;
    } else if (p1 > 12) {
      return `${year}-${String(p0).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
    } else {
      return `${year}-${String(p1).padStart(2, '0')}-${String(p0).padStart(2, '0')}`;
    }
  }

  const d = dayjs(dateVal);
  return d.isValid() ? d.format('YYYY-MM-DD') : str;
}

/**
 * Check if selected date is a configured Holiday/Closed Office Date
 */
export function getHolidayInfo(customizationSettings, selectedDate) {
  if (!selectedDate) return null;
  const flow = customizationSettings?.flowAutomationSettings || {};
  const holidays = Array.isArray(flow.holidays) ? flow.holidays : [];
  if (holidays.length === 0) return null;

  const targetDateStr = normalizeDateToYYYYMMDD(selectedDate);
  const found = holidays.find((h) => {
    if (!h.date) return false;
    const hDateStr = normalizeDateToYYYYMMDD(h.date);
    return hDateStr === targetDateStr;
  });

  return found ? { isHoliday: true, date: targetDateStr, title: found.title || 'Office Closed / Public Holiday' } : null;
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

  // If selectedDate is a configured holiday, return no slots available
  if (selectedDate && getHolidayInfo(customizationSettings, selectedDate)) {
    return [];
  }

  // Target date normalized (e.g. '2026-08-10')
  const targetDateStr = selectedDate ? normalizeDateToYYYYMMDD(selectedDate) : null;
  let targetDay = selectedDate ? dayjs(selectedDate).format('dddd') : null;

  // Determine windows list (support both date-wise array & legacy fallback)
  let rawWindows = [];
  if (Array.isArray(flow.bookingWindows) && flow.bookingWindows.length > 0) {
    rawWindows = flow.bookingWindows;
  } else if (flow.bookingAllowedStart || flow.bookingAllowedEnd) {
    rawWindows = [{
      date: dayjs().format('YYYY-MM-DD'),
      startTime: flow.bookingAllowedStart || '09:00',
      endTime: flow.bookingAllowedEnd || '18:00'
    }];
  } else {
    rawWindows = [{ date: dayjs().format('YYYY-MM-DD'), startTime: '09:00', endTime: '18:00' }];
  }

  // Filter windows matching the selected date (or fallback to legacy day of week)
  if (targetDateStr) {
    const dateMatchedWindows = rawWindows.filter((win) => {
      if (!win.date) return false;
      return normalizeDateToYYYYMMDD(win.date) === targetDateStr;
    });

    if (dateMatchedWindows.length > 0) {
      rawWindows = dateMatchedWindows;
    } else {
      const hasDateConfigs = rawWindows.some((w) => Boolean(w.date));
      if (hasDateConfigs) {
        rawWindows = []; // No windows configured for this specific date
      } else if (targetDay) {
        // Fallback for legacy day-wise saved configurations
        const dayFilteredWindows = rawWindows.filter((win) => {
          if (!win.day || win.day === 'Everyday') return true;
          if (Array.isArray(win.days)) return win.days.includes(targetDay);
          return String(win.day).toLowerCase() === targetDay.toLowerCase();
        });
        rawWindows = dayFilteredWindows;
      }
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

  // Fallback: Only generate fallback slots if NO custom booking windows OR day configs exist at all
  const hasCustomConfig = Array.isArray(flow.bookingWindows) && flow.bookingWindows.length > 0;
  const isHolidayDate = Boolean(selectedDate && getHolidayInfo(customizationSettings, selectedDate));

  if (slots.length === 0 && !hasCustomConfig && !isHolidayDate) {
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
