// const jwksClient = require("jwks-rsa");
// const jwt = require("jsonwebtoken");

// const client = jwksClient({
//   jwksUri: `https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`
// });

// function getKey(header, callback) {
//   client.getSigningKey(header.kid, function (err, key) {
//     const signingKey = key.getPublicKey();
//     callback(null, signingKey);
//   });
// }

// function verifyToken(token) {
//   return new Promise((resolve, reject) => {
//     jwt.verify(
//       token,
//       getKey,
//       {
//         audience: process.env.CLIENT_ID,
//         issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`
//       },
//       (err, decoded) => {
//         if (err) reject(err);
//         else resolve(decoded);
//       }
//     );
//   });
// }

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.decode(token); 
    // In production use proper Azure token validation

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { verifyToken };
