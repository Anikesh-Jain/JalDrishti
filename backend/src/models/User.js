const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      default: null
    },
    googleId: {
      type: String,
      default: null,
      sparse: true
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['Admin', 'Citizen'],
        message: '{VALUE} is not a valid user role'
      },
      default: 'Citizen'
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Active'
    },
    lastLogin: {
      type: Date,
      default: null
    },
    organization: {
      type: String,
      trim: true,
      default: 'JalDrishti Project'
    },
    avatar: {
      type: String,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null,
      index: true
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    hardwareOnboarding: {
      status: {
        type: String,
        enum: {
          values: ['yes', 'no', 'not_sure', 'pending'],
          message: '{VALUE} is not a valid hardware onboarding status'
        },
        default: 'pending'
      },
      completedAt: {
        type: Date,
        default: null
      }
    },
    assignedNodeId: {
      type: String,
      default: null,
      trim: true,
      uppercase: true
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
