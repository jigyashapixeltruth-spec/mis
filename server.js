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
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.log("❌ DB connection failed:", err);
  } else {
    console.log("✅ DB connected");
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
        console.log("Login Error:", err);
        return res.status(500).json({
          success: false,
          message: "Server error"
        });
      }

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
