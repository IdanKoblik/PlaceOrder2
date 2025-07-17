import { Request, Response } from "express";
import { getDatabase } from "../database";

export const verifyPassword = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  db.get(
    'SELECT password FROM admin_settings ORDER BY id DESC LIMIT 1',
    [],
    (err, row: any) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(500).json({ error: 'Admin password not configured' });
      }

      const isValid = password === row.password;
      
      if (isValid) {
        res.json({ success: true, message: 'Password verified successfully' });
      } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }
  );
};