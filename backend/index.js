const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
require("./database/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Coworking ERP API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});