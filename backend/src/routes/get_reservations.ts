import { Request, Response } from "express";
import { getDatabase } from "../database";
import { Reservation } from "../../../shared/types/"

interface ReservationRow {
    id: string;
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    email?: string;
    notes?: string;
    vip_status?: number;
    party_size: number;
    date: string;
    start_time: string;
    end_time: string;
    status: 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
    special_requests?: string;
    created_at: string;
    updated_at: string;
}
  
export const getReservations = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();

  const sql = `
    SELECT 
      r.*, 
      c.id as customer_id, c.name as customer_name, c.phone as customer_phone, 
      c.email, c.notes, c.vip_status,
      rt.table_id as table_id
    FROM reservations r
    JOIN customers c ON r.customer_id = c.id
    LEFT JOIN reservation_tables rt ON r.id = rt.reservation_id
  `;

  db.all<ReservationRow & { table_id: string | null }>(sql, [], (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const reservationMap = new Map<string, Reservation>();

    for (const row of rows) {
      if (!reservationMap.has(row.id)) {
        reservationMap.set(row.id, {
          id: row.id,
          customer: {
            id: row.customer_id,
            name: row.customer_name,
            phone: row.customer_phone,
            email: row.email,
            notes: row.notes,
            vipStatus: !!row.vip_status,
          },
          partySize: row.party_size,
          date: row.date,
          startTime: row.start_time,
          endTime: row.end_time,
          tableIds: row.table_id ? [row.table_id] : [],
          status: row.status,
          specialRequests: row.special_requests,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      } else {
        const existing = reservationMap.get(row.id)!;
        if (row.table_id && !existing.tableIds.includes(row.table_id)) {
          existing.tableIds.push(row.table_id);
        }
      }
    }

    res.json(Array.from(reservationMap.values()));
  });
};
