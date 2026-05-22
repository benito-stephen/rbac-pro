import mongoose from 'mongoose';
import { TASK_STATUS } from '../constants/index.js';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    key: { type: String, required: true, unique: true, uppercase: true, trim: true },
    color: { type: String, default: '#6366f1' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['active', 'archived', 'on_hold'],
      default: 'active',
    },
    settings: {
      defaultView: { type: String, enum: ['board', 'list', 'calendar'], default: 'board' },
      isPrivate: { type: Boolean, default: false },
    },
    stats: {
      totalTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
