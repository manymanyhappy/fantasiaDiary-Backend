const mongoose = require('mongoose');

const originalDiarySchema = new mongoose.Schema({
  creator: {
    type: mongoose.ObjectId,
    unique: true,
    required: true,
    trim: true
  },
  month: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  fantasia_diary: {
    type: mongoose.ObjectId,
    trim: true,
    ref: 'FantasiaDiary'
  }
});

module.exports = mongoose.model('OriginalDiary', originalDiarySchema);
