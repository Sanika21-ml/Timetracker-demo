const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); 

router.post("/", async (req, res) => {
  try {
    console.log("Body:", req.body);

    const { azure_ad_id } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE azure_ad_id = ? AND is_active = 1",
      [azure_ad_id]
    );

    console.log("Rows:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    console.log("JWT Secret:", process.env.JWT_SECRET);

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role_id: user.role_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });

  } catch (err) {
    console.error("Login error FULL:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
