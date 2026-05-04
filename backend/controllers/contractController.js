const pool = require("../database/db");


// ==============================
// CREATE CONTRACT (AUTO OCCUPY)
// ==============================
exports.createContract = async (req, res) => {
  try {
    const {
      user_id,
      space_id,
      start_date,
      end_date,
      monthly_rent
    } = req.body;

    // 1. Check if space exists & is available
    const space = await pool.query(
      "SELECT * FROM spaces WHERE id=$1",
      [space_id]
    );

    if (!space.rows.length) {
      return res.status(404).json({ message: "Space not found" });
    }

    if (space.rows[0].status === "OCCUPIED") {
      return res.status(400).json({ message: "Space already occupied" });
    }

    // 2. Check if user already has active contract for same space
    const activeContract = await pool.query(
      `SELECT * FROM contracts 
       WHERE space_id=$1 AND status='ACTIVE'`,
      [space_id]
    );

    if (activeContract.rows.length > 0) {
      return res.status(400).json({ message: "Active contract already exists for this space" });
    }

    // 3. Create contract
    const contract = await pool.query(
      `INSERT INTO contracts 
      (user_id, space_id, start_date, end_date, monthly_rent)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [user_id, space_id, start_date, end_date, monthly_rent]
    );

    // 4. AUTO OCCUPY SPACE
    await pool.query(
      `UPDATE spaces SET status='OCCUPIED' WHERE id=$1`,
      [space_id]
    );

    res.json({
      message: "Contract created & space occupied",
      contract: contract.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// GET ALL CONTRACTS
// ==============================
exports.getAllContracts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
             u.first_name, u.last_name,
             s.name AS space_name
      FROM contracts c
      JOIN users u ON c.user_id = u.id
      JOIN spaces s ON c.space_id = s.id
      ORDER BY c.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// END CONTRACT (AUTO VACATE)
// ==============================
exports.endContract = async (req, res) => {
  try {
    const contractId = req.params.id;

    // 1. Get contract
    const contract = await pool.query(
      "SELECT * FROM contracts WHERE id=$1",
      [contractId]
    );

    if (!contract.rows.length) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const spaceId = contract.rows[0].space_id;

    // 2. End contract
    await pool.query(
      `UPDATE contracts SET status='ENDED' WHERE id=$1`,
      [contractId]
    );

    // 3. FREE SPACE AUTOMATICALLY
    await pool.query(
      `UPDATE spaces SET status='VACANT' WHERE id=$1`,
      [spaceId]
    );

    res.json({
      message: "Contract ended & space is now VACANT"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};