import React, { useState } from 'react';
import { Search, Calendar, Clock, Users, Phone, Edit, Trash2, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reservation } from '../../../shared/types';

interface ReservationListProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Reservation['status']) => void;
}

export const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = !searchQuery || 
      reservation.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.customer.phone.includes(searchQuery) ||
      reservation.id.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && reservation.date === new Date().toISOString().split('T')[0]) ||
      (dateFilter === 'tomorrow' && reservation.date === new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'seated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('time.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('time.tomorrow');
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDeleteClick = (id: string, customerName: string) => {
    if (confirm(t('messages.reservationDeleted') + ` - ${customerName}?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={20} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('reservation.searchReservations')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('status.allStatus')}</option>
              <option value="confirmed">{t('status.confirmed')}</option>
              <option value="seated">{t('status.seated')}</option>
              <option value="completed">{t('status.completed')}</option>
              <option value="cancelled">{t('status.cancelled')}</option>
              <option value="no-show">{t('status.noShow')}</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('status.allDates')}</option>
              <option value="today">{t('time.today')}</option>
              <option value="tomorrow">{t('time.tomorrow')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="divide-y divide-gray-200">
        {filteredReservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">{t('reservation.noReservationsFound')}</p>
            <p className="text-sm">{t('reservation.adjustFilters')}</p>
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.customer.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(reservation.status)}`}>
                      {t(`status.${reservation.status}`)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{reservation.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{reservation.partySize} {reservation.partySize === 1 ? t('forms.person') : t('forms.people')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(reservation.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{reservation.startTime} - {reservation.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>
                      {t('table.selectTables')}: {reservation.tableIds.join(', ')}
                    </span>
                  </div>

                  {reservation.specialRequests && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      <strong>{t('reservation.specialRequests')}:</strong> {reservation.specialRequests}
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                  {reservation.status === 'confirmed' && (
                    <select
                      value={reservation.status}
                      onChange={(e) => onStatusChange(reservation.id, e.target.value as Reservation['status'])}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="confirmed">{t('status.confirmed')}</option>
                      <option value="seated">{t('status.seated')}</option>
                      <option value="no-show">{t('status.noShow')}</option>
                      <option value="cancelled">{t('status.cancelled')}</option>
                    </select>
                  )}
                  
                  <button
                    onClick={() => onEdit(reservation)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t('actions.edit')}
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClick(reservation.id, reservation.customer.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('actions.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};