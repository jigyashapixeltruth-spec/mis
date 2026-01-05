const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

/* ======================
   Middleware
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   Database Connection
====================== */
const db = mysql.createConnection({
  host: process.env.DB_HOST || "metro.proxy.rlwy.net",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "railway",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 14597
});

db.connect(err => {
  if (err) {
    console.log("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ DB connected successfully");
  }
});

/* ======================
   Test Route
====================== */
app.get("/", (req, res) => {
  res.send("MIS Backend is running ✅");
});

/* ======================
   LOGIN API
====================== */
app.post("/login", (req, res) => {
  const { User_Mail, Password, Role, Department } = req.body;

  console.log("LOGIN HIT:", req.body);

  if (!User_Mail || !Password || !Role || !Department) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }

  const query = `
    SELECT * FROM mis_user_data
    WHERE User_Mail = ?
      AND Password = ?
      AND Role = ?
      AND Department = ?
  `;

  db.query(
    query,
    [User_Mail, Password, Role, Department],
    (err, results) => {
      if (err) {
        console.log("❌ Login DB Error:", err.message);
        return res.status(500).json({
          success: false,
          message: "Server error"
        });
      }

      console.log("DB RESULT:", results);

      if (results.length > 0) {
        return res.json({
          success: true,
          user: {
            User_Name: results[0].User_Name,
            User_Mail: results[0].User_Mail,
            Role: results[0].Role,
            Department: results[0].Department
          }
        });
      } else {
        return res.json({
          success: false,
          message: "Invalid credentials"
        });
      }
    }
  );
});

/* ======================
   Server Start
====================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
});
