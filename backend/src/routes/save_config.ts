import { Request, Response } from "express";
import { getDatabase } from "../database";
import { RestaurantConfig } from "../../../shared/types";

export const saveConfig = async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const config = req.body as RestaurantConfig;

  if (!config || !config.name || !config.workingHours) {
    res.status(400).json({ error: "Invalid configuration data" });
    return;
  }

  const updatedAt = new Date().toISOString();

  const sql = `
    UPDATE restaurant_config SET
      name = ?,
      monday_is_open = ?, monday_open_time = ?, monday_close_time = ?,
      tuesday_is_open = ?, tuesday_open_time = ?, tuesday_close_time = ?,
      wednesday_is_open = ?, wednesday_open_time = ?, wednesday_close_time = ?,
      thursday_is_open = ?, thursday_open_time = ?, thursday_close_time = ?,
      friday_is_open = ?, friday_open_time = ?, friday_close_time = ?,
      saturday_is_open = ?, saturday_open_time = ?, saturday_close_time = ?,
      sunday_is_open = ?, sunday_open_time = ?, sunday_close_time = ?,
      time_slot_duration = ?, reservation_duration = ?,
      updated_at = ?
    WHERE id = 'default'
  `;

  const params = [
    config.name,
    config.workingHours.monday.isOpen ? 1 : 0,
    config.workingHours.monday.openTime,
    config.workingHours.monday.closeTime,
    config.workingHours.tuesday.isOpen ? 1 : 0,
    config.workingHours.tuesday.openTime,
    config.workingHours.tuesday.closeTime,
    config.workingHours.wednesday.isOpen ? 1 : 0,
    config.workingHours.wednesday.openTime,
    config.workingHours.wednesday.closeTime,
    config.workingHours.thursday.isOpen ? 1 : 0,
    config.workingHours.thursday.openTime,
    config.workingHours.thursday.closeTime,
    config.workingHours.friday.isOpen ? 1 : 0,
    config.workingHours.friday.openTime,
    config.workingHours.friday.closeTime,
    config.workingHours.saturday.isOpen ? 1 : 0,
    config.workingHours.saturday.openTime,
    config.workingHours.saturday.closeTime,
    config.workingHours.sunday.isOpen ? 1 : 0,
    config.workingHours.sunday.openTime,
    config.workingHours.sunday.closeTime,
    config.timeSlotDuration,
    config.reservationDuration,
    updatedAt
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Failed to update restaurant config:", err);
      return res.status(500).json({ error: "Failed to save configuration" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Configuration not found" });
    }

    res.status(200).json({ 
      message: "Configuration saved successfully",
      updatedAt 
    });
  });
};