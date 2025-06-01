import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isModified(path: string): boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  settings?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
    [key: string]: string | boolean | undefined;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre(
  'save',
  async function (this: IUser, next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (!this.isModified('password')) return next();

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(
        new AppError(
          ErrorType.INTERNAL,
          ErrorModule.DATABASE,
          ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.QUERY_ERROR,
          500,
          { module: ErrorModule.DATABASE, method: 'hashPassword' },
          { error: (error as Error).message }
        )
      );
    }
  }
);

// Method to compare password
userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new AppError(
      ErrorType.INTERNAL,
      ErrorModule.DATABASE,
      ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.QUERY_ERROR,
      500,
      { module: ErrorModule.DATABASE, method: 'comparePassword' },
      { error: (error as Error).message }
    );
  }
};

export const User = mongoose.model<IUser>('User', userSchema);
