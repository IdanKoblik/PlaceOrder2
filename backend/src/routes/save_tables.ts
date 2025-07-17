import { Request, Response } from "express";
import { getDatabase } from "../database";
import { Table } from "../../../shared/types";

export const saveTables = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const tables = req.body as Table[];

  if (!Array.isArray(tables)) {
    res.status(400).json({ error: "Tables data must be an array" });
    return;
  }

  db.serialize(() => {
    // Create tables table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS tables (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        area TEXT NOT NULL,
        min_capacity INTEGER NOT NULL,
        max_capacity INTEGER NOT NULL,
        is_adjustable INTEGER NOT NULL DEFAULT 1,
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error("Failed to create tables table:", err);
        return res.status(500).json({ error: "Failed to create tables table" });
      }

      // Clear existing tables
      db.run("DELETE FROM tables", (err) => {
        if (err) {
          console.error("Failed to clear existing tables:", err);
          return res.status(500).json({ error: "Failed to clear existing tables" });
        }

        // Insert new tables
        const stmt = db.prepare(`
          INSERT INTO tables (
            id, name, area, min_capacity, max_capacity, 
            is_adjustable, position_x, position_y, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let completed = 0;
        let hasError = false;

        tables.forEach((table) => {
          stmt.run([
            table.id,
            table.name,
            table.area,
            table.capacity.min,
            table.capacity.max,
            table.isAdjustable ? 1 : 0,
            table.position.x,
            table.position.y,
            table.isActive ? 1 : 0
          ], function(err) {
            if (err && !hasError) {
              hasError = true;
              console.error("Failed to insert table:", err);
              return res.status(500).json({ error: "Failed to save tables" });
            }

            completed++;
            if (completed === tables.length && !hasError) {
              stmt.finalize();
              res.status(200).json({ 
                message: "Tables saved successfully", 
                count: tables.length 
              });
            }
          });
        });

        if (tables.length === 0) {
          stmt.finalize();
          res.status(200).json({ 
            message: "Tables cleared successfully", 
            count: 0 
          });
        }
      });
    });
  });
};