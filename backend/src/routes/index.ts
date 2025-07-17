import express from "express";
import { getReservations } from "./get_reservations";
import { createReservation } from "./create_reservation";
import { removeReservation } from "./remove_reservation";
import { updateReservation } from "./update_reservation";
import { getTables } from "./get_tables";
import { saveTables } from "./save_tables";
import { verifyPassword } from "./verify_password";
import { getConfig } from "./get_config";
import { saveConfig } from "./save_config";

const router = express.Router();

router.get("/reservations", getReservations);
router.put("/reservations", createReservation);
router.delete("/reservations", removeReservation);
router.post("/reservations", updateReservation);

router.get("/tables", getTables);
router.post("/tables", saveTables);

router.get("/config", getConfig);
router.post("/config", saveConfig);

router.post("/verify-password", verifyPassword);

export default router;