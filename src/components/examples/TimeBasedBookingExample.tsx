import React, { useState } from 'react';
import BookingCalendar from '../shared/BookingCalendar';

// Example component showing how the time-based booking calendar works
const TimeBasedBookingExample: React.FC = () => {
  const [selectedCheckIn, setSelectedCheckIn] = useState('');
  const [selectedCheckOut, setSelectedCheckOut] = useState('');
  const [selectedCheckInTime, setSelectedCheckInTime] = useState('');
  const [selectedCheckOutTime, setSelectedCheckOutTime] = useState('');

  // Example unavailable dates with specific times
  const exampleUnavailableDates = [
    // January 15th - booked from 10 AM to 2 PM
    '2025-01-15T10:00:00Z',
    '2025-01-15T11:00:00Z', 
    '2025-01-15T12:00:00Z',
    '2025-01-15T13:00:00Z',
    '2025-01-15T14:00:00Z',
    
    // January 16th - booked from 6 PM to 10 PM
    '2025-01-16T18:00:00Z',
    '2025-01-16T19:00:00Z',
    '2025-01-16T20:00:00Z',
    '2025-01-16T21:00:00Z',
    '2025-01-16T22:00:00Z',
    
    // January 17th - fully booked (all day)
    ...Array.from({ length: 17 }, (_, i) => `2025-01-17T${(i + 6).toString().padStart(2, '0')}:00:00Z`),
  ];

  const handleDateChange = (checkIn: string, checkOut: string) => {
    setSelectedCheckIn(checkIn);
    setSelectedCheckOut(checkOut);
    
    // Clear times when dates change
    if (checkIn !== selectedCheckIn) {
      setSelectedCheckInTime('');
    }
    if (checkOut !== selectedCheckOut) {
      setSelectedCheckOutTime('');
    }
  };

  const handleTimeChange = (checkInTime: string, checkOutTime: string) => {
    setSelectedCheckInTime(checkInTime);
    setSelectedCheckOutTime(checkOutTime);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Time-Based Booking Calendar Demo
        </h2>
        <p className="text-gray-600">
          Select dates to see available check-in times and latest check-out times
        </p>
      </div>

      <BookingCalendar
        propertyId="demo-property"
        unavailableDates={exampleUnavailableDates}
        timezone="America/New_York"
        city="New York"
        country="USA"
        selectedCheckIn={selectedCheckIn}
        selectedCheckOut={selectedCheckOut}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        showTimeSlots={true}
        timeSlotDuration={60}
        checkinTime="15:00:00" // 3 PM check-in (typical hotel time)
        checkoutTime="11:00:00" // 11 AM check-out (typical hotel time)
      />

      {/* Booking Summary */}
      {(selectedCheckIn || selectedCheckOut || selectedCheckInTime || selectedCheckOutTime) && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            {selectedCheckIn && (
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in Date:</span>
                <span className="font-medium">{new Date(selectedCheckIn).toLocaleDateString()}</span>
              </div>
            )}
            {selectedCheckInTime && (
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in Time:</span>
                <span className="font-medium text-green-600">{selectedCheckInTime}</span>
              </div>
            )}
            {selectedCheckOut && (
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out Date:</span>
                <span className="font-medium">{new Date(selectedCheckOut).toLocaleDateString()}</span>
              </div>
            )}
            {selectedCheckOutTime && (
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out Time:</span>
                <span className="font-medium text-orange-600">{selectedCheckOutTime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Example Data Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Example Data</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Property Check-in:</strong> 3:00 PM (15:00)</p>
          <p>• <strong>Property Check-out:</strong> 11:00 AM (11:00)</p>
          <p>• <strong>Jan 15th:</strong> Booked 10 AM - 2 PM (other times available)</p>
          <p>• <strong>Jan 16th:</strong> Booked 6 PM - 10 PM (other times available)</p>
          <p>• <strong>Jan 17th:</strong> Fully booked (no available times)</p>
          <p>• <strong>Other dates:</strong> Available from 3 PM onwards</p>
        </div>
      </div>
    </div>
  );
};

export default TimeBasedBookingExample;