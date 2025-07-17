// src/routes/reservations.ts
import { Request, Response } from "express";
import { getDatabase } from "../database";

export const removeReservation = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const id = req.query.id as string;

  if (!id) {
    res.status(400).json({ error: "Reservation ID is required" });
    return;
  }

  db.serialize(() => {
    // 1. Remove table links
    db.run(
      `DELETE FROM reservation_tables WHERE reservation_id = ?`,
      [id],
      function (err) {
        if (err) {
          console.error("Failed to delete table links:", err);
          return res.status(500).json({ error: "Failed to delete reservation tables" });
        }

        // 2. Remove reservation
        db.run(
          `DELETE FROM reservations WHERE id = ?`,
          [id],
          function (err) {
            if (err) {
              console.error("Failed to delete reservation:", err);
              return res.status(500).json({ error: "Failed to delete reservation" });
            }

            if (this.changes === 0) {
              return res.status(404).json({ error: "Reservation not found" });
            }

            res.status(200).json({ message: "Reservation deleted" });
          }
        );
      }
    );
  });
};
