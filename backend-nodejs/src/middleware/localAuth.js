// middleware/localAuth.js
// Used in local development - bypasses token auth

module.exports = (req, res, next) => {
  req.user = {
    user_id: "6d5db6b1-13b0-11f1-875a-005056c00001",
    email: "krushna.lavhare@cnovate.io",
    role_id: 1
  };
  next();
};