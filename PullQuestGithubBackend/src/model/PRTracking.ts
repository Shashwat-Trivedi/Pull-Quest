// Create a simple PR tracking schema (add this to your models)
import mongoose, { Schema, Document } from "mongoose";

const PRTrackingSchema = new Schema({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  prNumber: { type: Number, required: true },
  author: { type: String, required: true },
  description: { type: String },
  labels: [String],
  stakeAmount: { type: Number, default: 0 },
  linkedIssue: { type: Number },
  walletCheckScheduled: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'wallet_verified', 'wallet_pending', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

export const PRTracking = mongoose.model('PRTracking', PRTrackingSchema);
