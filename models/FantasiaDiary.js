const mongoose = require('mongoose');

const fantasiaDiarySchema = new mongoose.Schema({
  creator: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  sentiment_Average: {
    type: Number,
    required: true,
    trim: true
  },
  fantasia_level_color: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model('FantasiaDiary', fantasiaDiarySchema);
