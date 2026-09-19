const mongoose = require('mongoose');

const CalendarSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Calendar title is required'],
    },
    month: {
      type: Number, // 1 - 12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    topicNiche: {
      type: String,
      default: '',
    },
    goals: {
      type: String,
      default: 'Brand awareness & engagement',
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    platforms: {
      type: [String],
      default: ['Instagram', 'LinkedIn', 'X'],
    },
  },
  { timestamps: true }
);

CalendarSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Calendar', CalendarSchema);

