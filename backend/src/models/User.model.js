import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES, USER_STATUS } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    avatar: { type: String, default: '' },
    lastLogin: { type: Date },
    refreshToken: { type: String, select: false },
    refreshTokenExpires: { type: Date, select: false },
    tokenVersion: { type: Number, default: 0 },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });

userSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIssuedAt < changedTimestamp;
};

export default mongoose.model('User', userSchema);
