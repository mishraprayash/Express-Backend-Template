import { User, IUser } from '../models/user.model';
import { FilterQuery } from 'mongoose';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findOne(filter: FilterQuery<IUser>): Promise<IUser | null> {
    return User.findOne(filter);
  }

  async find(filter: FilterQuery<IUser>): Promise<IUser[]> {
    return User.find(filter);
  }

  async findByIdAndUpdate(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  async findByIdAndDelete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }
}
