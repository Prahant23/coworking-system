const pool = require("../database/db");

// CREATE SPACE
exports.createSpace = async (req, res) => {
  try {
    const { name, type, price_per_day, price_per_month, description } = req.body;

   const result = await pool.query(
  `INSERT INTO spaces 
  (name, type, status, price_per_day, price_per_month, description)
  VALUES ($1,$2,'VACANT',$3,$4,$5)
  RETURNING *`,
  [
    name,
    type,
    price_per_day,
    price_per_month,
    description
  ]
);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL SPACES
exports.getAllSpaces = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM spaces ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE SPACE
exports.getSpace = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM spaces WHERE id=$1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Space not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE SPACE STATUS (VACANT / OCCUPIED)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE spaces 
       SET status=$1 
       WHERE id=$2 
       RETURNING *`,
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE SPACE
exports.deleteSpace = async (req, res) => {
  try {
    await pool.query("DELETE FROM spaces WHERE id=$1", [req.params.id]);

    res.json({ message: "Space deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};