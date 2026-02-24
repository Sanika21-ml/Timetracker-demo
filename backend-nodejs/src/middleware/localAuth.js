// middleware/localAuth.js
// Used in local development - bypasses token auth

module.exports = (req, res, next) => {
  req.user = {
    user_id: "f63dafb3-0ca3-11f1-a263-00155d888310",
    email: "krushna.lavhare@cnovate.io",
    role_id: 1
  };
  next();
};