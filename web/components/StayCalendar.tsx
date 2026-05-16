import React from 'react';
import type { Guest } from '../shared/types';

interface StayCalendarProps {
  guest: Guest | null;
}

export default function StayCalendar({ guest }: StayCalendarProps) {
  if (!guest?.upcomingReservation) {
    return null;
  }

  const checkIn = new Date(guest.upcomingReservation.checkIn);
  const checkOut = new Date(guest.upcomingReservation.checkOut);

  const year = checkIn.getFullYear();
  const month = checkIn.getMonth();

  // Calculate days staying
  const daysStaying = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get first day of month and number of days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Month name
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    firstDay
  );

  // Create array of dates
  const dates: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    dates.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(i);
  }

  const isDateInStay = (day: number) => {
    const date = new Date(year, month, day);
    return date >= checkIn && date < checkOut;
  };

  const isCheckInDate = (day: number) => {
    return day === checkIn.getDate() && month === checkIn.getMonth();
  };

  const isCheckOutDate = (day: number) => {
    return day === checkOut.getDate() && month === checkOut.getMonth();
  };

  return (
    <div className="w-full max-w-sm p-6 bg-white rounded-lg border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif" style={{ color: '#1B4D3E' }}>
            {monthName} {year}
          </h3>
          <div className="text-right">
            <p className="text-sm text-gray-600">Nights staying</p>
            <p className="text-2xl font-serif" style={{ color: '#2D8659' }}>
              {daysStaying}
            </p>
          </div>
        </div>

        {/* Reservation dates */}
        <div className="space-y-1 text-xs text-gray-600">
          <p>
            <span className="font-semibold">Check-in:</span>{' '}
            {checkIn.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p>
            <span className="font-semibold">Check-out:</span>{' '}
            {checkOut.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-1">
          {dates.map((day, idx) => (
            <div key={idx} className="aspect-square flex items-center justify-center">
              {day === null ? (
                <div />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-sm font-medium rounded transition-colors ${
                    isCheckInDate(day)
                      ? 'rounded-l-lg'
                      : isCheckOutDate(day)
                        ? 'rounded-r-lg'
                        : ''
                  }`}
                  style={{
                    backgroundColor: isDateInStay(day)
                      ? '#D4EDE7'
                      : 'transparent',
                    color: isCheckInDate(day) || isCheckOutDate(day) ? '#1B4D3E' : '#6B7280',
                    fontWeight:
                      isCheckInDate(day) || isCheckOutDate(day)
                        ? '600'
                        : '500',
                  }}
                >
                  {day}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: '#D4EDE7' }}
          />
          <span className="text-gray-600">Your stay dates</span>
        </div>
      </div>
    </div>
  );
}
