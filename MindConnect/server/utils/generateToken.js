const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // টোকেন ৩০ দিন ভ্যালিড থাকবে
  });
};

module.exports = generateToken;