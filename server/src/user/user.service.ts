import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(email: string, hashedPassword: string): Promise<UserDocument> {

    if (await this.userModel.exists({ email })) {
      throw new ConflictException('Email already in use');
    }

    return this.userModel.create({ email, password: hashedPassword });
  }

  async update(id: string, data: UpdateUserDto): Promise<UserDocument> {
    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const updateData: Partial<User> = {};
    if (data.email) updateData.email = data.email;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}