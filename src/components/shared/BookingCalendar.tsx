import React, { useState, useMemo } from 'react';
import { Calendar, DateValue } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { getTimezoneInfo } from '../../utils/propertyUtils';
import toast from 'react-hot-toast';
import { useTranslation } from '../../lib/stores/translationStore';

interface BookingCalendarProps {
  propertyId: string;
  unavailableDates?: string[]; // Array of ISO datetime strings
  timezone?: string;
  city?: string;
  country?: string;
  selectedCheckIn?: string;
  selectedCheckOut?: string;
  onDateChange: (checkIn: string, checkOut: string) => void;
  onTimeChange?: (checkInTime: string, checkOutTime: string) => void;
  showTimeSlots?: boolean; // New prop to enable time-based booking
  timeSlotDuration?: number; // Duration in minutes (default 60)
  // Property settings for dynamic time ranges
  checkinTime?: string; // Property's check-in time (e.g., "15:00:00")
  checkoutTime?: string; // Property's check-out time (e.g., "11:00:00")
  className?: string;
}

interface AvailabilityData {
  date: string;
  isAvailable: boolean;
  conflictReason?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  // propertyId is reserved for future analytics and logging
  propertyId,
  unavailableDates = [],
  timezone = 'UTC',
  city,
  country,
  selectedCheckIn,
  selectedCheckOut,
  onDateChange,
  onTimeChange,
  showTimeSlots = false,
  timeSlotDuration = 60,
  checkinTime = '15:00:00', // Default 3 PM check-in
  checkoutTime = '11:00:00', // Default 11 AM check-out
  className = '',
}) => {
  const { t } = useTranslation(['booking', 'common']);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
  // Time fields for time-based booking
  const [selectedCheckInTime, setSelectedCheckInTime] = useState('');
  const [selectedCheckOutTime, setSelectedCheckOutTime] = useState('');
  // Reference otherwise-unused variables to satisfy linter while keeping API stable
  void propertyId;

  // Process availability data and create time-aware maps
  const { availabilityData, unavailableTimeSlots } = useMemo(() => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    // Add logging for unavailable dates processing
    console.log('🗓️ BookingCalendar - Processing unavailable dates:', {
      received_unavailable_dates: unavailableDates,
      received_count: unavailableDates?.length || 0,
      timezone: timezone,
      processing_range: {
        from: today.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
    });

    // Create time-aware availability map from unavailable dates
    const unavailableTimeSlots = new Map<string, string[]>(); // date -> array of datetime strings
    unavailableDates.forEach((datetime: string) => {
      const dateOnly = datetime.split('T')[0]; // Extract date part (YYYY-MM-DD)
      if (!unavailableTimeSlots.has(dateOnly)) {
        unavailableTimeSlots.set(dateOnly, []);
      }
      unavailableTimeSlots.get(dateOnly)!.push(datetime);
    });

    console.log('🗓️ BookingCalendar - Created unavailable time slots map:', {
      map_size: unavailableTimeSlots.size,
      dates_with_unavailable_slots: Array.from(unavailableTimeSlots.keys()),
      total_unavailable_slots: Array.from(unavailableTimeSlots.values()).reduce(
        (sum, slots) => sum + slots.length,
        0
      ),
    });

    // Generate availability data for the calendar range
    const availability: AvailabilityData[] = [];
    const currentDate = new Date(today);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const hasUnavailableSlots = unavailableTimeSlots.has(dateString);
      const unavailableSlots = unavailableTimeSlots.get(dateString) || [];
      
      // A date is considered unavailable if it has unavailable time slots
      // But we'll show partial availability in the time picker
      const isFullyUnavailable = hasUnavailableSlots && unavailableSlots.length >= 24; // Assuming hourly slots

      availability.push({
        date: dateString,
        isAvailable: !isFullyUnavailable,
        conflictReason: isFullyUnavailable ? t('booking.messages.unavailableDates') : undefined,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Log final availability data
    const unavailableCount = availability.filter((item) => !item.isAvailable).length;
    console.log('🗓️ BookingCalendar - Final availability data:', {
      total_dates_processed: availability.length,
      unavailable_dates_found: unavailableCount,
      available_dates: availability.length - unavailableCount,
      sample_unavailable_dates: availability
        .filter((item) => !item.isAvailable)
        .slice(0, 5)
        .map((item) => item.date),
    });

    return { availabilityData: availability, unavailableTimeSlots };
  }, [unavailableDates, t]);

  // Create a map for quick lookup
  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailabilityData>();
    availabilityData.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }, [availabilityData]);

  // Get timezone info for display
  const timezoneInfo = useMemo(() => {
    return getTimezoneInfo(timezone);
  }, [timezone]);

  // Calculate available check-in times for a specific date
  const getAvailableCheckInTimes = useMemo(() => {
    if (!selectedCheckIn || !showTimeSlots) return [];
    
    const unavailableSlots = unavailableTimeSlots.get(selectedCheckIn) || [];
    const unavailableTimes = new Set(
      unavailableSlots.map(datetime => {
        const time = datetime.split('T')[1]?.split(':').slice(0, 2).join(':');
        return time || '';
      }).filter(Boolean)
    );

    // Parse property's check-in time to get the starting hour
    const propertyCheckinHour = parseInt(checkinTime.split(':')[0]);
    const propertyCheckinMinute = parseInt(checkinTime.split(':')[1]);
    
    // Generate time slots based on property settings and slot duration
    const availableTimes: string[] = [];
    
    // Start from property's check-in time and go until late evening (23:00)
    let currentHour = propertyCheckinHour;
    let currentMinute = propertyCheckinMinute;
    
    while (currentHour < 23 || (currentHour === 23 && currentMinute === 0)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      if (!unavailableTimes.has(timeString)) {
        availableTimes.push(timeString);
      }
      
      // Add slot duration
      currentMinute += timeSlotDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    console.log('🕐 Available check-in times for', selectedCheckIn, '(starting from', checkinTime, '):', availableTimes);
    return availableTimes;
  }, [selectedCheckIn, unavailableTimeSlots, showTimeSlots, checkinTime, timeSlotDuration]);

  // Calculate latest available check-out time for a specific date
  const getLatestCheckOutTime = useMemo(() => {
    if (!selectedCheckOut || !showTimeSlots) return '';
    
    const unavailableSlots = unavailableTimeSlots.get(selectedCheckOut) || [];
    const unavailableTimes = new Set(
      unavailableSlots.map(datetime => {
        const time = datetime.split('T')[1]?.split(':').slice(0, 2).join(':');
        return time || '';
      }).filter(Boolean)
    );

    // Parse property's check-out time to get the default latest time
    const propertyCheckoutHour = parseInt(checkoutTime.split(':')[0]);
    const propertyCheckoutMinute = parseInt(checkoutTime.split(':')[1]);
    
    // Start from property's check-out time and work backwards to find latest available
    // But also check if we can go later than the default checkout time
    const maxHour = Math.max(propertyCheckoutHour + 12, 23); // Allow up to 12 hours after default or 11 PM
    
    // Work backwards from the maximum time to find the latest available slot
    for (let hour = maxHour; hour >= propertyCheckoutHour; hour--) {
      for (let minute = (hour === maxHour ? propertyCheckoutMinute : 59); minute >= 0; minute -= timeSlotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        if (!unavailableTimes.has(timeString)) {
          console.log('🕐 Latest check-out time for', selectedCheckOut, '(default:', checkoutTime, '):', timeString);
          return timeString;
        }
      }
    }

    // If no time found, return the property's default checkout time if it's available
    const defaultTime = `${propertyCheckoutHour.toString().padStart(2, '0')}:${propertyCheckoutMinute.toString().padStart(2, '0')}`;
    if (!unavailableTimes.has(defaultTime)) {
      console.log('🕐 Using default check-out time for', selectedCheckOut, ':', defaultTime);
      return defaultTime;
    }

    console.log('🕐 No available check-out times for', selectedCheckOut);
    return '';
  }, [selectedCheckOut, unavailableTimeSlots, showTimeSlots, checkoutTime, timeSlotDuration]);

  // Handle calendar date selection
  const handleCalendarDateSelect = (date: DateValue) => {
    const dateString = date.toString();
    const availability = availabilityMap.get(dateString);

    if (availability && !availability.isAvailable) {
      console.log('❌ Selected date is not available:', dateString);
      toast.error(
        t('booking.messages.dateUnavailableOn', { date: new Date(dateString).toLocaleDateString() })
      );
      return;
    }

    console.log('🗓️ Calendar date selected:', dateString);
    console.log('Current state - Check-in:', selectedCheckIn, 'Check-out:', selectedCheckOut);

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Start new selection with check-in
      console.log('📅 Setting new check-in date:', dateString);
      onDateChange(dateString, '');
      setSelectedDate(date);
      toast.success(t('booking.messages.checkInSelected'));
    } else if (selectedCheckIn && !selectedCheckOut) {
      // Set check-out date if it's after check-in
      const checkInDate = new Date(selectedCheckIn);
      const selectedDate = new Date(dateString);

      if (selectedDate > checkInDate) {
        console.log('📅 Setting check-out date:', dateString);
        onDateChange(selectedCheckIn, dateString);
        toast.success(t('booking.messages.checkOutSelected'));
      } else {
        // If selected date is before check-in, make it the new check-in
        console.log('📅 Selected date is before current check-in, updating check-in:', dateString);
        onDateChange(dateString, '');
        toast.success(t('booking.messages.checkInUpdated'));
      }
      setSelectedDate(date);
    }
  };

  // Check if a date range has any unavailable dates
  const isDateRangeAvailable = (
    startDate: Date,
    endDate: Date
  ): { isAvailable: boolean; conflictDate: string } => {
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const availability = availabilityMap.get(dateString);
      if (availability && !availability.isAvailable) {
        return { isAvailable: false, conflictDate: dateString };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return { isAvailable: true, conflictDate: '' };
  };

  // Handle direct input changes
  const handleInputChange = (type: 'checkin' | 'checkout', value: string) => {
    console.log(`🔄 Handling ${type} input change:`, value);

    if (!value) {
      if (type === 'checkin') {
        console.log('🗑️ Clearing check-in date');
        onDateChange('', ''); // Clear both dates when check-in is cleared
        toast.success(t('booking.messages.datesCleared'));
      } else {
        console.log('🗑️ Clearing check-out date');
        onDateChange(selectedCheckIn || '', ''); // Only clear check-out
        toast.success(t('booking.messages.checkOutCleared'));
      }
      return;
    }

    const newDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate date is not in the past
    if (newDate < today) {
      console.log('❌ Cannot select past date');
      toast.error(t('booking.messages.pastDateNotAllowed'));
      return;
    }

    // Check if the individual date is available
    const availability = availabilityMap.get(value);
    if (availability && !availability.isAvailable) {
      console.log('❌ Selected date is not available:', value);
      toast.error(
        t('booking.messages.dateUnavailableOn', { date: new Date(value).toLocaleDateString() })
      );
      return;
    }

    if (type === 'checkin') {
      const currentCheckOut = selectedCheckOut ? new Date(selectedCheckOut) : null;

      if (currentCheckOut) {
        // Check if the new date range has any unavailable dates
        const { isAvailable, conflictDate } = isDateRangeAvailable(newDate, currentCheckOut);
        if (!isAvailable) {
          console.log('❌ Date range contains unavailable date:', conflictDate);
          toast.error(
            t('booking.messages.rangeIncludesUnavailableOn', {
              date: new Date(conflictDate).toLocaleDateString(),
            })
          );
          return;
        }

        if (currentCheckOut <= newDate) {
          // If new check-in is after or equal to current check-out, clear check-out
          console.log('📅 New check-in affects check-out, clearing check-out');
          onDateChange(value, '');
          toast.success(t('booking.messages.checkOutClearedDueToCheckIn'));
        } else {
          console.log('📅 Updating check-in date:', value);
          onDateChange(value, selectedCheckOut || '');
          toast.success(t('booking.messages.checkInUpdated'));
        }
      } else {
        console.log('📅 Setting new check-in date:', value);
        onDateChange(value, '');
        toast.success(t('booking.messages.checkInSelected'));
      }
    } else {
      if (!selectedCheckIn) {
        console.log('❌ Please select check-in date first');
        toast.error(t('booking.messages.selectCheckInFirst'));
        return;
      }

      const checkInDate = new Date(selectedCheckIn);

      if (newDate <= checkInDate) {
        console.log('❌ Check-out must be after check-in');
        toast.error(t('booking.messages.checkoutAfterCheckin'));
        return;
      }

      // Check if the new date range has any unavailable dates
      const { isAvailable, conflictDate } = isDateRangeAvailable(checkInDate, newDate);
      if (!isAvailable) {
        console.log('❌ Date range contains unavailable date:', conflictDate);
        toast.error(
          t('booking.messages.rangeIncludesUnavailableOn', {
            date: new Date(conflictDate).toLocaleDateString(),
          })
        );
        return;
      }

      console.log('📅 Updating check-out date:', value);
      onDateChange(selectedCheckIn, value);
      toast.success(t('booking.messages.checkOutUpdated'));
    }
  };

  // Handle time selection
  const handleTimeSelection = (type: 'checkin' | 'checkout', time: string) => {
    if (type === 'checkin') {
      setSelectedCheckInTime(time);
      console.log('🕐 Check-in time selected:', time);
    } else {
      setSelectedCheckOutTime(time);
      console.log('🕐 Check-out time selected:', time);
    }
    
    // Call the parent callback if provided
    if (onTimeChange) {
      const newCheckInTime = type === 'checkin' ? time : selectedCheckInTime;
      const newCheckOutTime = type === 'checkout' ? time : selectedCheckOutTime;
      onTimeChange(newCheckInTime, newCheckOutTime);
    }
    
    toast.success(t(`booking.messages.${type}TimeSelected`, { time }));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Timezone Information */}
      {(city || country) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 text-blue-800">
            <MapPin className="size-4" />
            <div className="text-sm">
              {(city || country) && (
                <>
                  <span className="font-medium">
                    {city && country ? `${city}, ${country}` : city || country}
                  </span>
                  <span className="mx-2">•</span>
                </>
              )}
              <span>
                {timezoneInfo.displayName} ({timezoneInfo.offsetFromUTC})
              </span>
              <span className="mx-2">•</span>
              <span>
                {t('booking.calendar.localTimeLabel')} {timezoneInfo.currentTime}
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-blue-600">{t('booking.calendar.timezoneNotice')}</p>
        </div>
      )}

      {/* Primary Date Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border-2 border-gray-200 p-3 transition-all focus-within:border-primary-500 hover:border-gray-300">
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            {t('booking.labels.checkIn')}
          </label>
          <input
            type="date"
            value={selectedCheckIn || ''}
            onChange={(e) => handleInputChange('checkin', e.target.value)}
            min={today(getLocalTimeZone()).toString()}
            className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
          />
        </div>
        <div className="rounded-lg border-2 border-gray-200 p-3 transition-all focus-within:border-primary-500 hover:border-gray-300">
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            {t('booking.labels.checkOut')}
          </label>
          <input
            type="date"
            value={selectedCheckOut || ''}
            onChange={(e) => handleInputChange('checkout', e.target.value)}
            min={
              selectedCheckIn
                ? new Date(new Date(selectedCheckIn).getTime() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]
                : today(getLocalTimeZone()).toString()
            }
            className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Available Times Display */}
      {showTimeSlots && selectedCheckIn && getAvailableCheckInTimes.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <label className="mb-2 block text-sm font-semibold text-green-800">
            {t('booking.labels.availableCheckInTimes')} - {new Date(selectedCheckIn).toLocaleDateString()}
          </label>
          <div className="flex flex-wrap gap-2">
            {getAvailableCheckInTimes.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelection('checkin', time)}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCheckInTime === time
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-700 hover:bg-green-100 border border-green-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {selectedCheckInTime && (
            <p className="mt-2 text-xs text-green-700">
              {t('booking.messages.selectedCheckInTime', { time: selectedCheckInTime })}
            </p>
          )}
        </div>
      )}

      {showTimeSlots && selectedCheckOut && getLatestCheckOutTime && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <label className="mb-2 block text-sm font-semibold text-orange-800">
            {t('booking.labels.latestCheckOutTime')} - {new Date(selectedCheckOut).toLocaleDateString()}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTimeSelection('checkout', getLatestCheckOutTime)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCheckOutTime === getLatestCheckOutTime
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-orange-700 hover:bg-orange-100 border border-orange-300'
              }`}
            >
              {getLatestCheckOutTime}
            </button>
            <span className="text-xs text-orange-600">
              {t('booking.messages.latestAvailableTime')}
            </span>
          </div>
          {selectedCheckOutTime && (
            <p className="mt-2 text-xs text-orange-700">
              {t('booking.messages.selectedCheckOutTime', { time: selectedCheckOutTime })}
            </p>
          )}
        </div>
      )}

      {/* Calendar Toggle Button */}
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
      >
        <CalendarIcon className="size-5" />
        <span className="font-medium">
          {showCalendar ? t('booking.calendar.hide') : t('booking.calendar.show')}
        </span>
      </button>

      {/* Calendar Component */}
      {showCalendar && (
        <div className="booking-calendar-unavailable-dates w-full rounded-lg border border-gray-200 bg-white p-4">
          <Calendar
            value={selectedDate}
            onChange={handleCalendarDateSelect}
            minValue={today(getLocalTimeZone())}
            isDateUnavailable={(date) => {
              const dateString = date.toString();
              const availability = availabilityMap.get(dateString);
              const isUnavailable = availability ? !availability.isAvailable : false;

              // Add logging for date availability checks (limit to first few checks to avoid spam)
              if (Math.random() < 0.01) {
                // Log only 1% of checks to avoid console spam
                console.log('🗓️ BookingCalendar - Date availability check:', {
                  date: dateString,
                  availability_found: !!availability,
                  is_available: availability?.isAvailable,
                  is_unavailable: isUnavailable,
                  conflict_reason: availability?.conflictReason,
                });
              }

              return isUnavailable;
            }}
            className="w-full"
            classNames={{
              base: 'w-full',
              grid: 'w-full',
              gridWrapper: 'w-full',
              cell: 'w-full',
              cellButton: 'w-full h-full',
            }}
          />
        </div>
      )}

      {/* Helper Text */}
      <p className="text-center text-xs text-gray-500">{t('booking.calendar.helperText')}</p>
    </div>
  );
};

export default BookingCalendar;
