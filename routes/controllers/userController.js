const jwt = require('jsonwebtoken');

const User = require('../../models/User');

const { errorMessage } = require('../../constants/errorMessage');
const { statusMessage } = require('../../constants/statusMessage');

const SECRET_KEY = process.env.SECRET_KEY;

exports.getLogin = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const userData = {
        email: email,
        origin_diary: []
      };

      const newUser = await User.create(userData);

      return res.status(201).json({
        result: statusMessage.success,
        token: jwt.sign(email, SECRET_KEY),
        userData: newUser
      });
    } else {
      return res.status(201).json({
        result: statusMessage.success,
        token: jwt.sign(email, SECRET_KEY),
        userData: existingUser
      });
    }
  } catch (err) {
    err.status = 401;
    err.result = statusMessage.fail;
    err.message = errorMessage.invalidLogin;

    next(err);
  }
};
