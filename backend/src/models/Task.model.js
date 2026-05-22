import mongoose from 'mongoose';
import { TASK_STATUS, TASK_PRIORITY } from '../constants/index.js';

const historySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    field: { type: String },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 5000 },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    dueDate: { type: Date },
    completedAt: { type: Date },
    tags: [{ type: String, trim: true, lowercase: true }],
    order: { type: Number, default: 0 },
    history: [historySchema],
  },
  { timestamps: true }
);

taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ title: 'text', description: 'text', tags: 'text' });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ createdAt: -1 });

taskSchema.pre('save', function (next) {
  if (!this.reporter) this.reporter = this.createdBy;
  if (!this.assignee) this.assignee = this.createdBy;
  next();
});

taskSchema.methods.addHistory = function ({ action, field, oldValue, newValue, user, message }) {
  this.history.push({ action, field, oldValue, newValue, user, message });
  if (this.history.length > 50) {
    this.history = this.history.slice(-50);
  }
};

export default mongoose.model('Task', taskSchema);
