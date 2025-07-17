export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  vipStatus?: boolean;
}

export interface Table {
  id: string;
  name: string;
  area: 'bar' | 'inside' | 'outside';
  capacity: {
    min: number;
    max: number;
  };
  isAdjustable: boolean;
  position: {
    x: number;
    y: number;
  };
  isActive: boolean;
}

export interface Reservation {
  id: string;
  customer: Customer;
  partySize: number;
  date: string;
  startTime: string;
  endTime: string;
  tableIds: string[];
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
  reservationId?: string;
}

export interface WorkingHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface RestaurantConfig {
  id: string;
  name: string;
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  timeSlotDuration: number; // in minutes (e.g., 30 for 30-minute slots)
  reservationDuration: number; // in minutes (e.g., 120 for 2-hour reservations)
  createdAt: string;
  updatedAt: string;
}

export type Language = 'en' | 'he' | 'ru';

export interface Translation {
  [key: string]: string | Translation;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';