// middleware/auth.js
// Auto-switches auth strategy based on environment

const isProduction = process.env.NODE_ENV === "prod";

module.exports = isProduction
  ? require("./jwtAuth")    // prod: validates JWT token
  : require("./localAuth"); // dev: hardcoded test user