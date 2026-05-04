const pool = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// REGISTER
exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users(first_name,last_name,email,password)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [firstName, lastName, email, hashedPassword]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (user.rows.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.rows[0].password);

  if (!valid) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user.rows[0].id, email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, user: user.rows[0] });
};

// GET USER
exports.getUser = async (req, res) => {
  const id = req.params.id;

  const user = await pool.query(
    "SELECT * FROM users WHERE id=$1",
    [id]
  );

  res.json(user.rows[0]);
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const { firstName, lastName } = req.body;

  const updated = await pool.query(
    `UPDATE users 
     SET first_name=$1,last_name=$2 
     WHERE id=$3 RETURNING *`,
    [firstName, lastName, id]
  );

  res.json(updated.rows[0]);
};

// DELETE
exports.deleteUser = async (req, res) => {
  const id = req.params.id;

  await pool.query("DELETE FROM users WHERE id=$1", [id]);

  res.json({ message: "Deleted" });
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const email = req.body.email;

  const user = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (user.rows.length === 0) {
    return res.json({ message: "Email not found" });
  }

  const token = crypto.randomBytes(20).toString("hex");

  await pool.query(
    "UPDATE users SET reset_token=$1 WHERE email=$2",
    [token, email]
  );

  res.json({ message: "Reset token generated", token });
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE reset_token=$1",
    [token]
  );

  if (user.rows.length === 0) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const hashed = await bcrypt.hash(password, 10);

  await pool.query(
    "UPDATE users SET password=$1, reset_token=NULL WHERE reset_token=$2",
    [hashed, token]
  );

  res.json({ message: "Password reset" });
};