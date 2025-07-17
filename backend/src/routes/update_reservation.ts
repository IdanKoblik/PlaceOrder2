import { Request, Response } from "express";
import { getDatabase } from "../database";
import { Reservation } from "../../../shared/types";

export const updateReservation = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const {
    id,
    customer,
    partySize,
    date,
    startTime,
    endTime,
    tableIds,
    status,
    specialRequests,
  } = req.body as Reservation;

  if (
    !id || !customer?.id || !partySize || !date ||
    !startTime || !endTime || !tableIds?.length
  ) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const updatedAt = new Date().toISOString();

  db.serialize(() => {
    db.run(
      `
      UPDATE customers SET
        name = ?, phone = ?, email = ?, notes = ?, vip_status = ?
      WHERE id = ?
      `,
      [
        customer.name,
        customer.phone,
        customer.email || null,
        customer.notes || null,
        customer.vipStatus ? 1 : 0,
        customer.id,
      ],
      function (err) {
        if (err) {
          console.error("Customer update error:", err);
          return res.status(500).json({ error: "Failed to update customer" });
        }

        db.run(
          `
          UPDATE reservations SET
            party_size = ?, date = ?, start_time = ?, end_time = ?,
            status = ?, special_requests = ?, updated_at = ?
          WHERE id = ?
          `,
          [
            partySize,
            date,
            startTime,
            endTime,
            status || "confirmed",
            specialRequests || null,
            updatedAt,
            id,
          ],
          function (err) {
            if (err) {
              console.error("Reservation update error:", err);
              return res.status(500).json({ error: "Failed to update reservation" });
            }

            // Clear existing table links
            db.run(
              `DELETE FROM reservation_tables WHERE reservation_id = ?`,
              [id],
              (err) => {
                if (err) {
                  console.error("Table unlink error:", err);
                  return res.status(500).json({ error: "Failed to update table links" });
                }

                // Re-link tables
                for (const tableId of tableIds) {
                  db.run(
                    `INSERT INTO reservation_tables (reservation_id, table_id) VALUES (?, ?)`,
                    [id, tableId],
                    (err) => {
                      if (err) {
                        console.error("Table re-link error:", err);
                      }
                    }
                  );
                }

                res.status(200).json({
                  id,
                  customer,
                  partySize,
                  date,
                  startTime,
                  endTime,
                  tableIds,
                  status: status || "confirmed",
                  specialRequests,
                  updatedAt,
                });
              }
            );
          }
        );
      }
    );
  });
};
