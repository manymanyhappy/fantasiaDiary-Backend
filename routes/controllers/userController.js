const jwt = require('jsonwebtoken');

const UserService = require('../../services/UserService');
const { errorMessage } = require('../../constants/errorMessage');
const { statusMessage } = require('../../constants/statusMessage');

const SECRET_KEY = process.env.SECRET_KEY;

exports.getLogin = async (req, res, next) => {
  try {

    return res.status(201).json({
      result: statusMessage.success,
      token: jwt.sign(email, SECRET_KEY),
    });
  } catch (err) {
    err.status = 401;
    err.result = statusMessage.fail;
    err.message = errorMessage.invalidLogin;

    next(err);
  }
};
