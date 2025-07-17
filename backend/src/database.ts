import sqlite3 from "sqlite3";
import path from "node:path";

const dbFilePath = path.join(__dirname, "../../data/database.db");
const db = new sqlite3.Database(dbFilePath);

// Initialize database schema
const initializeDatabase = () => {
  // Create tables table
  db.run(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      area TEXT NOT NULL CHECK (area IN ('bar', 'inside', 'outside')),
      min_capacity INTEGER NOT NULL,
      max_capacity INTEGER NOT NULL,
      is_adjustable INTEGER NOT NULL DEFAULT 0,
      position_x REAL NOT NULL,
      position_y REAL NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create customers table
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      notes TEXT,
      vip_status INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create reservations table
  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      party_size INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'seated', 'completed', 'cancelled', 'no-show')),
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id)
    )
  `);

  // Create reservation_tables junction table
  db.run(`
    CREATE TABLE IF NOT EXISTS reservation_tables (
      reservation_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reservation_id) REFERENCES reservations (id),
      FOREIGN KEY (table_id) REFERENCES tables (id),
      PRIMARY KEY (reservation_id, table_id)
    )
  `);

  // Create admin_settings table for storing admin password
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating admin_settings table:', err);
      return;
    }

    // Insert default admin password if table is empty
    db.get('SELECT COUNT(*) as count FROM admin_settings', (err, row: any) => {
      if (err) {
        console.error('Error checking admin_settings:', err);
        return;
      }

      if (row.count === 0) {
        db.run(
          'INSERT INTO admin_settings (password) VALUES (?)',
          ['admin123'],
          (err) => {
            if (err) {
              console.error('Error inserting default admin password:', err);
            } else {
              console.log('Default admin password set to: admin123');
            }
          }
        );
      }
    });
  });

  // Create restaurant_config table for working hours and settings
  db.run(`
    CREATE TABLE IF NOT EXISTS restaurant_config (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      monday_is_open INTEGER NOT NULL DEFAULT 1,
      monday_open_time TEXT NOT NULL DEFAULT '09:00',
      monday_close_time TEXT NOT NULL DEFAULT '22:00',
      tuesday_is_open INTEGER NOT NULL DEFAULT 1,
      tuesday_open_time TEXT NOT NULL DEFAULT '09:00',
      tuesday_close_time TEXT NOT NULL DEFAULT '22:00',
      wednesday_is_open INTEGER NOT NULL DEFAULT 1,
      wednesday_open_time TEXT NOT NULL DEFAULT '09:00',
      wednesday_close_time TEXT NOT NULL DEFAULT '22:00',
      thursday_is_open INTEGER NOT NULL DEFAULT 1,
      thursday_open_time TEXT NOT NULL DEFAULT '09:00',
      thursday_close_time TEXT NOT NULL DEFAULT '22:00',
      friday_is_open INTEGER NOT NULL DEFAULT 1,
      friday_open_time TEXT NOT NULL DEFAULT '09:00',
      friday_close_time TEXT NOT NULL DEFAULT '22:00',
      saturday_is_open INTEGER NOT NULL DEFAULT 1,
      saturday_open_time TEXT NOT NULL DEFAULT '09:00',
      saturday_close_time TEXT NOT NULL DEFAULT '23:00',
      sunday_is_open INTEGER NOT NULL DEFAULT 1,
      sunday_open_time TEXT NOT NULL DEFAULT '10:00',
      sunday_close_time TEXT NOT NULL DEFAULT '21:00',
      time_slot_duration INTEGER NOT NULL DEFAULT 30,
      reservation_duration INTEGER NOT NULL DEFAULT 120,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating restaurant_config table:', err);
      return;
    }

    // Insert default restaurant config if table is empty
    db.get('SELECT COUNT(*) as count FROM restaurant_config', (err, row: any) => {
      if (err) {
        console.error('Error checking restaurant_config:', err);
        return;
      }

      if (row.count === 0) {
        db.run(
          `INSERT INTO restaurant_config (
            id, name, 
            monday_is_open, monday_open_time, monday_close_time,
            tuesday_is_open, tuesday_open_time, tuesday_close_time,
            wednesday_is_open, wednesday_open_time, wednesday_close_time,
            thursday_is_open, thursday_open_time, thursday_close_time,
            friday_is_open, friday_open_time, friday_close_time,
            saturday_is_open, saturday_open_time, saturday_close_time,
            sunday_is_open, sunday_open_time, sunday_close_time,
            time_slot_duration, reservation_duration,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'default',
            'ReserveFlow Restaurant',
            1, '09:00', '22:00', // Monday
            1, '09:00', '22:00', // Tuesday
            1, '09:00', '22:00', // Wednesday
            1, '09:00', '22:00', // Thursday
            1, '09:00', '23:00', // Friday
            1, '09:00', '23:00', // Saturday
            1, '10:00', '21:00', // Sunday
            30, 120, // time slot duration, reservation duration, advance booking days
            new Date().toISOString(), // created_at
            new Date().toISOString()  // updated_at
          ],
          (err) => {
            if (err) {
              console.error('Error inserting default restaurant config:', err);
            } else {
              console.log('Default restaurant configuration created');
            }
          }
        );
      }
    });
  });
};

// Initialize the database when this module is loaded
initializeDatabase();

export const getDatabase = () => db;