const mongoose = require('mongoose');

const fantasiaDiarySchema = new mongoose.Schema({
  creator: {
    type: mongoose.ObjectId,
    unique: true,
    required: true,
    trim: true
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  fantasia_level_color: {
    type: String,
    required: true,
    trim: true
  },
  original_diary: {
    type: mongoose.ObjectId,
    trim: true,
    ref: 'OriginalDiary'
  }
});

module.exports = mongoose.model('FantasiaDiary', fantasiaDiarySchema);
