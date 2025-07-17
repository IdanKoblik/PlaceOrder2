import { useState, useCallback, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import type { RestaurantConfig, DayOfWeek } from '../../../shared/types';

const defaultConfig: RestaurantConfig = {
  id: 'default',
  name: 'ReserveFlow Restaurant',
  workingHours: {
    monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
    sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' },
  },
  timeSlotDuration: 30,
  reservationDuration: 120,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const useConfig = () => {
  const [config, setConfig] = useState<RestaurantConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Load config from database on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.CONFIG));
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data: RestaurantConfig = await response.json();
        setConfig(data);
      } catch (err) {
        console.error("Error loading config:", err);
        // Use default config on error
        setConfig(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const saveConfigEndpoint = async (configToSave: RestaurantConfig) => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CONFIG), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configToSave),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error("Error saving config:", err);
      throw err;
    }
  };

  const updateConfig = useCallback(async (newConfig: RestaurantConfig) => {
    setConfig(newConfig);
    
    try {
      await saveConfigEndpoint(newConfig);
    } catch (err) {
      console.error("Failed to save config to database:", err);
      throw err;
    }
  }, []);

  const updateWorkingHours = useCallback(async (day: DayOfWeek, hours: { isOpen: boolean; openTime: string; closeTime: string }) => {
    const newConfig = {
      ...config,
      workingHours: {
        ...config.workingHours,
        [day]: hours
      },
      updatedAt: new Date().toISOString()
    };
    await updateConfig(newConfig);
  }, [config, updateConfig]);

  const updateRestaurantSettings = useCallback(async (settings: {
    name?: string;
    timeSlotDuration?: number;
    reservationDuration?: number;
    advanceBookingDays?: number;
  }) => {
    const newConfig = {
      ...config,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    await updateConfig(newConfig);
  }, [config, updateConfig]);

  const getWorkingHoursForDate = useCallback((date: string) => {
    // Get day of week as a number (0 = Sunday, 1 = Monday, etc.)
    const dayIndex = new Date(date).getDay();
    
    // Convert to our DayOfWeek type
    const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dayIndex];
    
    return config.workingHours[dayOfWeek];
  }, [config]);

  const generateTimeSlots = useCallback((date: string) => {
    const workingHours = getWorkingHoursForDate(date);
    
    if (!workingHours.isOpen) {
      return [];
    }

    const slots = [];
    const [openHour, openMinute] = workingHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = workingHours.closeTime.split(':').map(Number);
    
    const openTimeMinutes = openHour * 60 + openMinute;
    const closeTimeMinutes = closeHour * 60 + closeMinute;
    
    // Generate slots from open time to close time minus reservation duration
    // Use timeSlotDuration for the increment between slots
    const lastSlotTime = closeTimeMinutes - config.reservationDuration;
    
    for (let time = openTimeMinutes; time <= lastSlotTime; time += config.timeSlotDuration) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    return slots;
  }, [config, getWorkingHoursForDate]);

  const isDateAvailable = useCallback((date: string) => {
    const workingHours = getWorkingHoursForDate(date);
    const selectedDate = new Date(date);
    const today = new Date();
    
    return workingHours.isOpen && 
           selectedDate >= today;
  }, [config, getWorkingHoursForDate]);

  const getReservationEndTime = useCallback((startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + config.reservationDuration;
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }, [config]);

  return {
    config,
    updateConfig,
    updateWorkingHours,
    updateRestaurantSettings,
    getWorkingHoursForDate,
    generateTimeSlots,
    isDateAvailable,
    getReservationEndTime,
    isLoading
  };
};