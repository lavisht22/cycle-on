const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config.js');

const checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers.authorization; // Express headers are auto converted to lowercase
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          type: 'error',
          message: 'Token is not valid'
        });
      }
      req.user = decoded;
      next();
    });
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

module.exports = {
  checkToken
};
