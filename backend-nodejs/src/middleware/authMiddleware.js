const { verifyToken } = require("../config/auth");

module.exports = async function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = await verifyToken(token);
    req.user = {
      email: decoded.preferred_username,
      name: decoded.name
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
