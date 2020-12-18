const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  original_diary_list: [{
    type: mongoose.ObjectId,
    trim: true,
    ref: 'OriginalDiary'
  }],
});

module.exports = mongoose.model('User', userSchema);
