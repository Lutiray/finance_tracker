// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async create(email: string, hashedPassword: string) {
    const newUser = new this.userModel({ email, password: hashedPassword });
    return newUser.save();
  }
}

