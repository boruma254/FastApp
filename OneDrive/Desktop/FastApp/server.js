require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/loan", require("./src/routes/loan"));
app.use("/api/invest", require("./src/routes/investment"));
app.use("/api/withdraw", require("./src/routes/withdrawal"));

// Start scheduled jobs
const { scheduleWeeklyFriday } = require("./src/jobs/withdrawalsJob");
scheduleWeeklyFriday();

app.get("/", (req, res) => res.send({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
