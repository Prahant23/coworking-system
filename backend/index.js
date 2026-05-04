require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/spaces", require("./routes/spaceRoutes"));
app.use("/api/contracts", require("./routes/contractRoutes"));

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});