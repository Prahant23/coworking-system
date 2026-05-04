require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});