import { useState, useCallback, useMemo, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { useConfig } from './useConfig';
import type { Reservation, Customer, Table } from '../../../shared/types';

const mockReservations: Reservation[] = [
  {
    id: '1',
    customer: { id: '1', name: 'John Smith', phone: '+1-555-0123' },
    partySize: 4,
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    endTime: '21:00',
    tableIds: ['in-1'],
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    customer: { id: '2', name: 'Sarah Johnson', phone: '+1-555-0456' },
    partySize: 2,
    date: new Date().toISOString().split('T')[0],
    startTime: '20:00',
    endTime: '22:00',
    tableIds: ['bar-1'],
    status: 'seated',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { generateTimeSlots, getReservationEndTime, isDateAvailable } = useConfig();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }); 
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const data: Reservation[] = await res.json();
        setReservations(data);
      } catch (err) {
        console.error("Error loading reservations:", err);
      }
    };

    fetchReservations();
  }, []);

  const createReservationEndpoint = async (reservation: Reservation) => {
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservation),
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
    } catch (err) {
      console.error("Error creating reservation:", err);
    }
  }
  
  const createReservation = useCallback((reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    createReservationEndpoint(newReservation);
    setReservations(prev => [...prev, newReservation]);
    return newReservation;
  }, []);

  const updateReservationEndpoint = async (reservation: Reservation) => {
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.RESERVATIONS), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservation),
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
    } catch (err) {
      console.error("Error creating reservation:", err);
    }
  }

  const updateReservation = useCallback(async (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(reservation => 
      reservation.id === id 
        ? { ...reservation, ...updates, updatedAt: new Date().toISOString() }
        : reservation
    ));
  
    const updatedReservation = reservations.find(r => r.id === id);
    if (updatedReservation) {
      const payload = { ...updatedReservation, ...updates, updatedAt: new Date().toISOString() };
      await updateReservationEndpoint(payload);
    }
  }, [reservations]);

  const deleteReservationEndpoint = async (id: string) => {
    try {
      const res = await fetch(`${buildApiUrl(API_ENDPOINTS.RESERVATIONS)}?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
    } catch (err) {
      console.error("Error creating reservation:", err);
    }
  }

  const deleteReservation = useCallback((id: string) => {
    deleteReservationEndpoint(id);
    setReservations(prev => prev.filter(reservation => reservation.id !== id));
  }, []);

  const getAvailableTables = useCallback((date: string, startTime: string, endTime: string, partySize: number, tables: Table[] = []) => {
    // Check if the date is available (restaurant is open)
    if (!isDateAvailable(date)) {
      return [];
    }

    const conflictingReservations = reservations.filter(reservation => 
      reservation.date === date &&
      reservation.status !== 'cancelled' &&
      !(endTime <= reservation.startTime || startTime >= reservation.endTime)
    );

    const occupiedTableIds = new Set(
      conflictingReservations.flatMap(reservation => reservation.tableIds)
    );

    return tables.filter(table => 
      table.isActive &&
      !occupiedTableIds.has(table.id) &&
      table.capacity.min <= partySize &&
      table.capacity.max >= partySize
    );
  }, [reservations, isDateAvailable]);

  const getTableStatus = useCallback((tableId: string, date: string, time: string) => {
    const currentReservation = reservations.find(reservation =>
      reservation.date === date &&
      reservation.tableIds.includes(tableId) &&
      reservation.startTime <= time &&
      reservation.endTime > time &&
      reservation.status !== 'cancelled'
    );

    if (!currentReservation) return 'available';
    
    switch (currentReservation.status) {
      case 'confirmed':
        return 'reserved';
      case 'seated':
        return 'occupied';
      default:
        return 'available';
    }
  }, [reservations]);

  const searchReservations = useCallback((query: string) => {
    if (!query.trim()) return reservations;
    
    const lowercaseQuery = query.toLowerCase();
    return reservations.filter(reservation =>
      reservation.customer.name.toLowerCase().includes(lowercaseQuery) ||
      reservation.customer.phone.includes(query) ||
      reservation.id.includes(query)
    );
  }, [reservations]);

  const getReservationsByDate = useCallback((date: string) => {
    return reservations.filter(reservation => reservation.date === date);
  }, []);

  return {
    reservations,
    createReservation,
    updateReservation,
    deleteReservation,
    getAvailableTables,
    getTableStatus,
    generateTimeSlots,
    getReservationEndTime,
    isDateAvailable,
    searchReservations,
    getReservationsByDate
  };
};