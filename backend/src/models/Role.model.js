import mongoose from 'mongoose';
import { DEFAULT_ROLE_PERMISSIONS } from '../constants/index.js';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    permissions: {
      type: [String],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roleSchema.statics.seedDefaults = async function () {
  const roles = Object.entries(DEFAULT_ROLE_PERMISSIONS);
  for (const [name, permissions] of roles) {
    await this.findOneAndUpdate(
      { name },
      {
        name,
        displayName: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        permissions,
        isSystem: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }
};

export default mongoose.model('Role', roleSchema);
