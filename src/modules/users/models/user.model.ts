import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  settings: Map<string, any>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    settings: {
      type: Map,
      of: Schema.Types.Mixed,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        if (ret.settings instanceof Map) {
          ret.settings = Object.fromEntries(ret.settings);
        } else if (ret.settings && typeof ret.settings === 'object') {
          ret.settings = Object.fromEntries(new Map(Object.entries(ret.settings)));
        }
        return ret;
      },
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.password;
        if (ret.settings instanceof Map) {
          ret.settings = Object.fromEntries(ret.settings);
        } else if (ret.settings && typeof ret.settings === 'object') {
          ret.settings = Object.fromEntries(new Map(Object.entries(ret.settings)));
        }
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', userSchema);
