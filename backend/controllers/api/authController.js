const AuthService = require('../../services/authService');

exports.checkAuthStatus = (req, res) => {
  try {
    // If JWT is valid, the user information will be attached to req.user
    const user = req.user;  // From the authenticateJWT middleware

    // Respond with user data
    res.status(200).json({ user: user });
  } catch (err) {
    console.error('Error during checkAuthStatus:', err);
    res.status(500).json({ message: 'Error checking authentication status' });
  }
};

exports.logout = async (req, res) => {
  try {
    await AuthService.deleteUser(req.user.id);  // Remove the user from the database

    res.clearCookie('authToken'); // Clear the JWT cookie
    // Respond with user data
    res.status(200).json({ message: 'Logged out successfully.' });

    // Clear the JWT cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    });

    // Respond with a 200 OK status and no content
    res.status(200).send();
  } catch (err) {
    console.error('Error during checkAuthStatus:', err);
    res.status(500).json({ message: 'Error checking authentication status' });
  }
};
