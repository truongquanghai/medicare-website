import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSpecialties = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.description, COUNT(d.id) AS doctor_count
     FROM specialties s
     LEFT JOIN doctors d ON d.specialty_id = s.id
     GROUP BY s.id, s.name, s.description
     ORDER BY s.name`,
  );
  res.json(rows);
});

export const listFacilities = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, address, phone FROM facilities ORDER BY name');
  res.json(rows);
});
