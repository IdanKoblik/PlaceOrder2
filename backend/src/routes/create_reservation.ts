import { Request, Response } from "express";
import { getDatabase } from "../database";
import { Reservation } from "../../../shared/types";
import crypto from "crypto";

export const createReservation = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const {
    customer,
    partySize,
    date,
    startTime,
    endTime,
    tableIds,
    status,
    specialRequests,
  } = req.body as Omit<Reservation, "id" | "createdAt" | "updatedAt">;

  if (!customer?.id || !partySize || !date || !startTime || !endTime || !tableIds?.length) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const reservationId = crypto.randomUUID();

  db.serialize(() => {
    db.run(
      `
      INSERT INTO customers (id, name, phone, email, notes, vip_status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        phone=excluded.phone,
        email=excluded.email,
        notes=excluded.notes,
        vip_status=excluded.vip_status
      `,
      [
        customer.id,
        customer.name,
        customer.phone,
        customer.email || null,
        customer.notes || null,
        customer.vipStatus ? 1 : 0,
      ],
      function (err) {
        if (err) {
          console.error("Customer insert error:", err);
          return res.status(500).json({ error: "Failed to create/update customer" });
        }
  
        // 2. Insert reservation
        db.run(
          `
          INSERT INTO reservations (
            id, customer_id, party_size, date, start_time, end_time,
            status, special_requests, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            reservationId,
            customer.id,
            partySize,
            date,
            startTime,
            endTime,
            status || "confirmed",
            specialRequests || null,
            createdAt,
            updatedAt,
          ],
          function (err) {
            if (err) {
              console.error("Reservation insert error:", err);
              return res.status(500).json({ error: "Failed to create reservation" });
            }
  
            // 3. Link tables
            for (const tableId of tableIds) {
              db.run(
                `INSERT INTO reservation_tables (reservation_id, table_id) VALUES (?, ?)`,
                [reservationId, tableId],
                (err) => {
                  if (err) {
                    console.error("Table link error:", err);
                  }
                }
              );
            }
  
            // 4. Send response
            res.status(201).json({
              id: reservationId,
              customer,
              partySize,
              date,
              startTime,
              endTime,
              tableIds,
              status: status || "confirmed",
              specialRequests,
              createdAt,
              updatedAt,
            });
          }
        );
      }
    );
  });
};
