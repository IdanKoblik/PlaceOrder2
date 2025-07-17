import React from 'react';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reservation, Table } from '../../../shared/types';

interface DashboardProps {
  reservations: Reservation[];
  tables: Table[];
}

export const Dashboard: React.FC<DashboardProps> = ({ reservations, tables }) => {
  const { t } = useLanguage();

  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.date === today);
  
  const stats = {
    totalReservations: todayReservations.length,
    totalGuests: todayReservations.reduce((sum, r) => sum + r.partySize, 0),
    confirmedReservations: todayReservations.filter(r => r.status === 'confirmed').length,
    occupiedTables: todayReservations.filter(r => r.status === 'seated').length
  };

  const upcomingReservations = todayReservations
    .filter(r => r.status === 'confirmed')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('dashboard.todaysReservations')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalReservations}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalGuests')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalGuests}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('dashboard.confirmedReservations')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.confirmedReservations}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('dashboard.occupiedTables')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.occupiedTables}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reservations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.upcomingReservations')}</h3>
          <div className="space-y-3">
            {upcomingReservations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t('dashboard.noUpcomingReservations')}</p>
            ) : (
              upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{reservation.customer.name}</p>
                    <p className="text-sm text-gray-600">
                      {reservation.partySize} {t('dashboard.guests')} • {reservation.startTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
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