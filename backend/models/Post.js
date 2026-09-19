const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    calendar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Calendar',
      required: true,
    },
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
    date: {
      type: Date,
      required: true,
    },
    platform: {
      type: String,
      enum: ['Instagram', 'LinkedIn', 'X', 'X/Twitter', 'TikTok', 'Facebook', 'YouTube'],
      required: true,
    },
    postType: {
      type: String,
      default: 'Educational',
    },
    idea: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    timeSlot: {
      type: String,
      default: '09:00 AM',
    },
    imagePrompt: {
      type: String,
      default: '',
    },
    engagementTip: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published'],
      default: 'draft',
    },
    linkedinUrn: {
      type: String,
    },
    linkedinStatus: {
      type: String,
      enum: ['draft', 'published', 'error'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

// Virtual alias title <-> idea for frontend compatibility
PostSchema.virtual('title').get(function () {
  return this.idea;
}).set(function (v) {
  this.idea = v;
});

// Virtual aliases for calendarId and brandId
PostSchema.virtual('calendarId').get(function () {
  return this.calendar;
});
PostSchema.virtual('brandId').get(function () {
  return this.brand;
});

PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', PostSchema);
