import React, { useState } from 'react';
import { Clock, Calendar, Settings, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useConfig } from '../hooks/useConfig';
import type { DayOfWeek, WorkingHours } from '../../../shared/types';

interface ConfigManagementProps {
  onClose: () => void;
}

export const ConfigManagement: React.FC<ConfigManagementProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { config, updateConfig, isLoading } = useConfig();
  const [formData, setFormData] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const daysOfWeek: { key: DayOfWeek; label: string }[] = [
    { key: 'monday', label: t('days.monday') },
    { key: 'tuesday', label: t('days.tuesday') },
    { key: 'wednesday', label: t('days.wednesday') },
    { key: 'thursday', label: t('days.thursday') },
    { key: 'friday', label: t('days.friday') },
    { key: 'saturday', label: t('days.saturday') },
    { key: 'sunday', label: t('days.sunday') },
  ];

  const handleWorkingHoursChange = (day: DayOfWeek, field: keyof WorkingHours, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      await updateConfig({
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setSaveStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyHours = (sourceDay: DayOfWeek) => {
    const sourceHours = formData.workingHours[sourceDay];
    const updatedWorkingHours = { ...formData.workingHours };
    
    // Copy to all other days
    daysOfWeek.forEach(({ key }) => {
      if (key !== sourceDay) {
        updatedWorkingHours[key] = { ...sourceHours };
      }
    });
    
    setFormData(prev => ({
      ...prev,
      workingHours: updatedWorkingHours
    }));
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>{t('config.loadingConfiguration')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{t('config.restaurantConfiguration')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Restaurant Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings size={20} />
              {t('config.generalSettings')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('config.restaurantName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleSettingsChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('config.timeSlotDuration')} ({t('config.minutes')})
                </label>
                <select
                  value={formData.timeSlotDuration}
                  onChange={(e) => handleSettingsChange('timeSlotDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={15}>15 {t('config.minutes')}</option>
                  <option value={30}>30 {t('config.minutes')}</option>
                  <option value={60}>60 {t('config.minutes')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('config.reservationDuration')} ({t('config.minutes')})
                </label>
                <select
                  value={formData.reservationDuration}
                  onChange={(e) => handleSettingsChange('reservationDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={60}>1 {t('time.hours')}</option>
                  <option value={90}>1.5 {t('time.hours')}</option>
                  <option value={120}>2 {t('time.hours')}</option>
                  <option value={150}>2.5 {t('time.hours')}</option>
                  <option value={180}>3 {t('time.hours')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('config.advanceBooking')} ({t('days.monday')})
                </label>
                <select
                  value={formData.advanceBookingDays}
                  onChange={(e) => handleSettingsChange('advanceBookingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>1 {t('config.week')}</option>
                  <option value={14}>2 {t('config.weeks')}</option>
                  <option value={30}>1 {t('config.month')}</option>
                  <option value={60}>2 {t('config.months')}</option>
                  <option value={90}>3 {t('config.months')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={20} />
              {t('config.workingHours')}
            </h3>
            
            <div className="space-y-4">
              {daysOfWeek.map(({ key, label }) => {
                const dayHours = formData.workingHours[key];
                
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-800 w-20">{label}</h4>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={dayHours.isOpen}
                            onChange={(e) => handleWorkingHoursChange(key, 'isOpen', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">{t('actions.open')}</span>
                        </label>
                      </div>
                      
                      <button
                        onClick={() => handleCopyHours(key)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        {t('actions.copyToAllDays')}
                      </button>
                    </div>
                    
                    {dayHours.isOpen && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {t('time.openTime')}
                          </label>
                          <select
                            value={dayHours.openTime}
                            onChange={(e) => handleWorkingHoursChange(key, 'openTime', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {t('time.closeTime')}
                          </label>
                          <select
                            value={dayHours.closeTime}
                            onChange={(e) => handleWorkingHoursChange(key, 'closeTime', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${
              saveStatus === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {saveStatus === 'success' ? (
                <>
                  <CheckCircle size={20} />
                  <span>{t('config.configurationSaved')}</span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  <span>{t('config.failedToSave')}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('config.saving')}
              </>
            ) : (
              <>
                <Save size={16} />
                {t('config.saveConfiguration')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};