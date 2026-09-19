const mongoose = require('mongoose');

const LinkedInTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  expiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('LinkedInToken', LinkedInTokenSchema);
