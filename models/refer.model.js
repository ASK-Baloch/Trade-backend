// models/Referral.js
import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  commission: {
    level1: { type: Number, default: 0 }, 
    level2: { type: Number, default: 0 }, 
    level3: { type: Number, default: 0 }, 
  },
}, { timestamps: true });

export const Referral = mongoose.model('Referral', referralSchema);
