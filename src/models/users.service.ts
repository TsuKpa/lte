import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserEntity } from './user.entity';
import { UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private userModel: Model<UserDocument>,
  ) {}

  async createUser(authCredentialsDto: UserEntity): Promise<void> {
    const { email, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword: string = await bcrypt.hash(password, salt);
    const user = new this.userModel({
      email,
      password: hashedPassword,
      isActive: true,
    });
    try {
      await user.save();
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        // duplicate email
        throw new ConflictException('Email already exists!');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.userModel.findOne({ email }).exec();
    console.log(user, 'logging in');
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findOne(email: string): Promise<UserEntity> {
    const user = await this.userModel.findOne({ email }).exec();
    return user || null;
  }
}
