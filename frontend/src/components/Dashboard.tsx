import React from 'react';
import { Calendar, Users, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reservation, Table } from '../../../shared/types';

interface DashboardProps {
  reservations: Reservation[];
  tables: Table[];
}

export const Dashboard: React.FC<DashboardProps> = ({ reservations, tables }) => {
  const { t } = useLanguage();

  // Get current week dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Start from Sunday
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const today = new Date().toISOString().split('T')[0];
  const currentWeekDates = getCurrentWeekDates();
  const todayReservations = reservations.filter(r => r.date === today);
  const weekReservations = reservations.filter(r => currentWeekDates.includes(r.date));
  
  // Group reservations by date for the week view
  const reservationsByDate = currentWeekDates.reduce((acc, date) => {
    acc[date] = reservations.filter(r => r.date === date);
    return acc;
  }, {} as Record<string, Reservation[]>);
  
  const stats = {
    totalReservations: todayReservations.length,
    totalGuests: todayReservations.reduce((sum, r) => sum + r.partySize, 0),
    confirmedReservations: todayReservations.filter(r => r.status === 'confirmed').length,
    occupiedTables: todayReservations.filter(r => r.status === 'seated').length,
    weekTotalReservations: weekReservations.length,
    weekTotalGuests: weekReservations.reduce((sum, r) => sum + r.partySize, 0)
  };

  const upcomingReservations = todayReservations
    .filter(r => r.status === 'confirmed')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('dashboard.todaysReservations')}</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalReservations}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('dashboard.totalGuests')}</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalGuests}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('dashboard.confirmedReservations')}</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.confirmedReservations}</p>
            </div>
            <div className="p-2 sm:p-3 bg-amber-100 rounded-lg">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('dashboard.occupiedTables')}</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.occupiedTables}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Week Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Current Week Overview</h3>
          <div className="text-sm text-gray-600">
            {stats.weekTotalReservations} reservations • {stats.weekTotalGuests} guests
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {currentWeekDates.map((date, index) => {
            const dayReservations = reservationsByDate[date] || [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const isToday = date === today;
            
            return (
              <div
                key={date}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className={`text-xs font-medium ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                    {dayNames[index]}
                  </div>
                  <div className={`text-sm sm:text-base font-bold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                    {new Date(date).getDate()}
                  </div>
                  <div className={`text-xs mt-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {dayReservations.length} res
                  </div>
                  <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {dayReservations.reduce((sum, r) => sum + r.partySize, 0)} guests
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Upcoming Reservations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.upcomingReservations')}</h3>
          <div className="space-y-3">
            {upcomingReservations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('dashboard.noUpcomingReservations')}</p>
            ) : (
              upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{reservation.customer.name}</p>
                    <p className="text-sm text-gray-600">
                      {reservation.partySize} {t('dashboard.guests')} • {reservation.startTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      {reservation.tableIds.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tables.find(t => reservation.tableIds.includes(t.id))?.area}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};