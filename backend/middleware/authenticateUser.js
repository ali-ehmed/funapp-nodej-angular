const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function authenticateUser(req, res, next) {
  const token = req.cookies.authToken;
  // const token = req.header('Authorization')?.replace('Bearer ', '');  // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });  // Unauthorized if no token
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });  // Forbidden if token is invalid
    }

    req.user = user;  // Attach the user info to the request object
    next();  // Proceed to the next middleware or route handler
  });
}

module.exports = authenticateUser;
