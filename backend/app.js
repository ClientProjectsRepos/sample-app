const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/authRoutes");
const createSuperUser = require("./utils/createSuperUser");

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, false);
      return callback(null, origin);
    },
    credentials: true,
  })
);

connectDB().then((db) => {
  createSuperUser();
  app.use("/api/auth", authRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
