import React from 'react';
import { Calendar, Users, Clock, TrendingUp, ChevronLeft, ChevronRight, X, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reservation, Table } from '../../../shared/types';

interface DashboardProps {
  reservations: Reservation[];
  tables: Table[];
}

export const Dashboard: React.FC<DashboardProps> = ({ reservations, tables }) => {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);

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

  const getSelectedDayReservations = () => {
    if (!selectedDay) return [];
    return reservations.filter(r => r.date === selectedDay);
  };

  const getSelectedDayStats = () => {
    const dayReservations = getSelectedDayReservations();
    return {
      totalReservations: dayReservations.length,
      totalGuests: dayReservations.reduce((sum, r) => sum + r.partySize, 0),
      confirmedCount: dayReservations.filter(r => r.status === 'confirmed').length,
      seatedCount: dayReservations.filter(r => r.status === 'seated').length,
      completedCount: dayReservations.filter(r => r.status === 'completed').length,
      cancelledCount: dayReservations.filter(r => r.status === 'cancelled').length
    };
  };

  const formatSelectedDayDate = () => {
    if (!selectedDay) return '';
    const date = new Date(selectedDay);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
                onClick={() => setSelectedDay(date)}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                } cursor-pointer hover:bg-gray-100 ${isToday ? 'hover:bg-blue-100' : ''}`}
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

      {/* Selected Day Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {formatSelectedDayDate()}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getSelectedDayStats().totalReservations} reservations • {getSelectedDayStats().totalGuests} guests
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Day Stats */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{getSelectedDayStats().confirmedCount}</div>
                  <div className="text-xs text-blue-700">Confirmed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{getSelectedDayStats().seatedCount}</div>
                  <div className="text-xs text-green-700">Seated</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{getSelectedDayStats().completedCount}</div>
                  <div className="text-xs text-gray-700">Completed</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{getSelectedDayStats().cancelledCount}</div>
                  <div className="text-xs text-red-700">Cancelled</div>
                </div>
              </div>
            </div>

            {/* Reservations List */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Reservations</h4>
              <div className="space-y-3">
                {getSelectedDayReservations().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No reservations for this day</p>
                  </div>
                ) : (
                  getSelectedDayReservations()
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((reservation) => (
                      <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-gray-900">{reservation.customer.name}</h5>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                reservation.status === 'seated' ? 'bg-green-100 text-green-800' :
                                reservation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {reservation.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <span>{reservation.customer.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={14} />
                                <span>{reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>{reservation.startTime} - {reservation.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                <span>{reservation.tableIds.join(', ')}</span>
                              </div>
                            </div>

                            {reservation.specialRequests && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                                <strong>Special Requests:</strong> {reservation.specialRequests}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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