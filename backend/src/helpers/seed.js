import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import { ROLES, USER_STATUS } from '../constants/index.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rbac_pro');
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@rbacpro.com' });
    if (!admin) {
      await User.create({
        name: 'System Admin',
        email: 'admin@rbacpro.com',
        password: 'Admin@123456',
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
      });
      console.log('Admin created: admin@rbacpro.com / Admin@123456');
    } else {
      admin.name = admin.name || 'System Admin';
      admin.role = ROLES.ADMIN;
      admin.status = USER_STATUS.ACTIVE;
      await admin.save();
      console.log('Admin account updated');
    }

    const demoUser = await User.findOne({ email: 'user@rbacpro.com' });
    if (!demoUser) {
      await User.create({
        name: 'Demo User',
        email: 'user@rbacpro.com',
        password: 'User@123456',
        role: ROLES.USER,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
      });
      console.log('Demo user created: user@rbacpro.com / User@123456');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
