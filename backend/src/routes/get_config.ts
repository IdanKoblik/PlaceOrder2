import { Request, Response } from "express";
import { getDatabase } from "../database";
import { RestaurantConfig } from "../../../shared/types";

interface ConfigRow {
  id: string;
  name: string;
  monday_is_open: number;
  monday_open_time: string;
  monday_close_time: string;
  tuesday_is_open: number;
  tuesday_open_time: string;
  tuesday_close_time: string;
  wednesday_is_open: number;
  wednesday_open_time: string;
  wednesday_close_time: string;
  thursday_is_open: number;
  thursday_open_time: string;
  thursday_close_time: string;
  friday_is_open: number;
  friday_open_time: string;
  friday_close_time: string;
  saturday_is_open: number;
  saturday_open_time: string;
  saturday_close_time: string;
  sunday_is_open: number;
  sunday_open_time: string;
  sunday_close_time: string;
  time_slot_duration: number;
  reservation_duration: number;
  created_at: string;
  updated_at: string;
}

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();

  const sql = `
    SELECT * FROM restaurant_config 
    WHERE id = 'default' 
    ORDER BY updated_at DESC 
    LIMIT 1
  `;

  db.get<ConfigRow>(sql, [], (err, row) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Restaurant configuration not found' });
    }

    const config: RestaurantConfig = {
      id: row.id,
      name: row.name,
      workingHours: {
        monday: {
          isOpen: !!row.monday_is_open,
          openTime: row.monday_open_time,
          closeTime: row.monday_close_time
        },
        tuesday: {
          isOpen: !!row.tuesday_is_open,
          openTime: row.tuesday_open_time,
          closeTime: row.tuesday_close_time
        },
        wednesday: {
          isOpen: !!row.wednesday_is_open,
          openTime: row.wednesday_open_time,
          closeTime: row.wednesday_close_time
        },
        thursday: {
          isOpen: !!row.thursday_is_open,
          openTime: row.thursday_open_time,
          closeTime: row.thursday_close_time
        },
        friday: {
          isOpen: !!row.friday_is_open,
          openTime: row.friday_open_time,
          closeTime: row.friday_close_time
        },
        saturday: {
          isOpen: !!row.saturday_is_open,
          openTime: row.saturday_open_time,
          closeTime: row.saturday_close_time
        },
        sunday: {
          isOpen: !!row.sunday_is_open,
          openTime: row.sunday_open_time,
          closeTime: row.sunday_close_time
        }
      },
      timeSlotDuration: row.time_slot_duration,
      reservationDuration: row.reservation_duration,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(config);
  });
};