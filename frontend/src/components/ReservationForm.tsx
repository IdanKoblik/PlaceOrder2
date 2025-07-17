import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, User, MessageSquare, Save, X, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useReservations } from '../hooks/useReservations';
import { useConfig } from '../hooks/useConfig';
import { TableLayout } from './TableLayout';
import type { Reservation, Table } from '../../../shared/types';

interface ReservationFormProps {
  reservation?: Reservation;
  onSave: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  tables: Table[];
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  reservation,
  onSave,
  onCancel,
  tables
}) => {
  const { t, isRTL } = useLanguage();
  const { getAvailableTables, getTableStatus } = useReservations();
  const { generateTimeSlots, getReservationEndTime, isDateAvailable, getWorkingHoursForDate } = useConfig();

  const [formData, setFormData] = useState({
    customer: {
      name: reservation?.customer.name || '',
      phone: reservation?.customer.phone || '',
      email: reservation?.customer.email || '',
      notes: reservation?.customer.notes || ''
    },
    partySize: reservation?.partySize || 2,
    date: reservation?.date || new Date().toISOString().split('T')[0],
    startTime: reservation?.startTime || '19:00',
    specialRequests: reservation?.specialRequests || '',
    status: reservation?.status || 'confirmed'
  });

  const [selectedArea, setSelectedArea] = useState<'bar' | 'inside' | 'outside'>('inside');
  const [selectedTables, setSelectedTables] = useState<string[]>(reservation?.tableIds || []);
  const [availableTables, setAvailableTables] = useState(tables);
  const [dateError, setDateError] = useState<string>('');

  const timeSlots = generateTimeSlots(formData.date);
  const endTime = getReservationEndTime(formData.startTime);
  const workingHours = getWorkingHoursForDate(formData.date);

  useEffect(() => {
    // Check if selected date is available
    if (!isDateAvailable(formData.date)) {
      const dayName = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!workingHours.isOpen) {
        setDateError(`Restaurant is closed on ${dayName}`);
      } else {
        setDateError('Selected date is not available for booking');
      }
    } else {
      setDateError('');
    }

    const available = getAvailableTables(
      formData.date,
      formData.startTime,
      endTime,
      formData.partySize,
      tables
    );
    setAvailableTables(available);
    
    setSelectedTables(prev => prev.filter(id => available.some(table => table.id === id)));
  }, [formData.date, formData.startTime, formData.partySize, getAvailableTables, endTime, tables, isDateAvailable, workingHours]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('customer.')) {
      const customerField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customer: { ...prev.customer, [customerField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTables(prev => {
      if (prev.includes(tableId)) {
        return prev.filter(id => id !== tableId);
      } else {
        return [...prev, tableId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer.name.trim() || !formData.customer.phone.trim() || selectedTables.length === 0) {
      return;
    }

    if (!isDateAvailable(formData.date)) {
      return;
    }

    const reservationData = {
      customer: {
        id: reservation?.customer.id || Date.now().toString(),
        ...formData.customer
      },
      partySize: formData.partySize,
      date: formData.date,
      startTime: formData.startTime,
      endTime,
      tableIds: selectedTables,
      status: formData.status as any,
      specialRequests: formData.specialRequests
    };

    onSave(reservationData);
  };

  const getTotalCapacity = () => {
    return selectedTables.reduce((total, tableId) => {
      const table = tables.find(t => t.id === tableId);
      return total + (table?.capacity.max || 0);
    }, 0);
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {reservation ? t('reservation.editReservation') : t('reservation.newReservation')}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} className="text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={16} />
              {t('reservation.customerName')}
            </label>
            <input
              type="text"
              value={formData.customer.name}
              onChange={(e) => handleInputChange('customer.name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} />
              {t('reservation.phoneNumber')}
            </label>
            <input
              type="tel"
              value={formData.customer.phone}
              onChange={(e) => handleInputChange('customer.phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users size={16} />
              {t('reservation.partySize')}
            </label>
            <select
              value={formData.partySize}
              onChange={(e) => handleInputChange('partySize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(size => (
                <option key={size} value={size}>{size} {size === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} />
              {t('reservation.date')}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                dateError ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {dateError && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} />
                <span>{dateError}</span>
              </div>
            )}
            {workingHours.isOpen && !dateError && (
              <div className="mt-1 text-xs text-gray-500">
                Open: {workingHours.openTime} - {workingHours.closeTime}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} />
              {t('reservation.time')}
            </label>
            <select
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={timeSlots.length === 0}
            >
              {timeSlots.length === 0 ? (
                <option value="">No available times</option>
              ) : (
                timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time} - {getReservationEndTime(time)}
                  </option>
                ))
              )}
            </select>
            {timeSlots.length === 0 && workingHours.isOpen && (
              <div className="mt-1 text-xs text-amber-600">
                No available time slots for this date
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={16} />
              {t('reservation.specialRequests')}
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Area Selection - Only show if date is available */}
        {!dateError && timeSlots.length > 0 && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Seating Area</h3>
              <div className="flex gap-2 mb-4">
                {(['bar', 'inside', 'outside'] as const).map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setSelectedArea(area)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedArea === area
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t(`areas.${area}`)}
                  </button>
                ))}
              </div>

              <TableLayout
                tables={availableTables}
                selectedArea={selectedArea}
                selectedTables={selectedTables}
                onTableSelect={handleTableSelect}
                getTableStatus={(tableId) => getTableStatus(tableId, formData.date, formData.startTime)}
                date={formData.date}
                time={formData.startTime}
              />
            </div>

            {/* Summary */}
            {selectedTables.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Reservation Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Party Size:</span>
                    <span className="font-medium ml-2">{formData.partySize}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Capacity:</span>
                    <span className="font-medium ml-2">{getTotalCapacity()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium ml-2">{getReservationEndTime(formData.startTime)} - {endTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tables:</span>
                    <span className="font-medium ml-2">{selectedTables.length}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            disabled={
              !formData.customer.name.trim() || 
              !formData.customer.phone.trim() || 
              selectedTables.length === 0 ||
              !!dateError ||
              timeSlots.length === 0
            }
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            {t('actions.save')}
          </button>
        </div>
      </form>
    </div>
  );
};