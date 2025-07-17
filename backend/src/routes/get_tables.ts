import { Request, Response } from "express";
import { getDatabase } from "../database";
import { Table } from "../../../shared/types";

interface TableRow {
  id: string;
  name: string;
  area: 'bar' | 'inside' | 'outside';
  min_capacity: number;
  max_capacity: number;
  is_adjustable: number;
  position_x: number;
  position_y: number;
  is_active: number;
}

export const getTables = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();

  const sql = `
    SELECT 
      id, name, area, min_capacity, max_capacity, 
      is_adjustable, position_x, position_y, is_active
    FROM tables
    WHERE is_active = 1
    ORDER BY area, name
  `;

  db.all<TableRow>(sql, [], (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const tables: Table[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      area: row.area,
      capacity: {
        min: row.min_capacity,
        max: row.max_capacity
      },
      isAdjustable: !!row.is_adjustable,
      position: {
        x: row.position_x,
        y: row.position_y
      },
      isActive: !!row.is_active
    }));

    res.json(tables);
  });
};