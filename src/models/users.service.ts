import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { EmailEntity } from './email.entity';
import { EmailDocument } from './email.schema';
import { UserEntity } from './user.entity';
import { UserDocument } from './user.schema';
const nodemailer = require('nodemailer');

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private userModel: Model<UserDocument>,
    @InjectModel('Email')
    private emailModel: Model<EmailDocument>,
  ) {}

  async createUser(authCredentialsDto: UserEntity): Promise<void> {
    const { email, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword: string = await bcrypt.hash(password, salt);
    const user = new this.userModel({
      email,
      password: hashedPassword,
      isActive: false,
    });
    try {
      await user.save();
      await this.sendEmailVerify(email);
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

  async sendEmail(
    emailTo: string,
    content: {
      subject: string;
      html: string;
    },
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'lorna.emmerich30@ethereal.email',
        pass: 'EKEk9v2TnyFvkzVcZJ',
      },
    });

    const mailOptions = {
      from: 'nqnamfe1996@gmail.com',
      to: emailTo,
      subject: 'Verify your account',
      html: content,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error, 'Error sending mail');
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async sendEmailVerify(email: string): Promise<void> {
    if (!email) return;
    const salt = await bcrypt.genSalt();
    let hashedString: string = await bcrypt.hash(email, salt);
    hashedString = hashedString.replace(/\//g, 's');
    const emailHash = new this.emailModel({
      email,
      hash: hashedString,
    });
    await emailHash.save();
    await this.sendEmail(email, {
      subject: 'Verify your account',
      html:
        '<h1>Welcome user ' +
        email +
        '!</h1><p>Please click the link below to active your account:</p><b><a href="' +
        `http://${process.env.DOMAIN}:${process.env.PORT}/auth/verify/` +
        hashedString +
        '"></b>',
    });
  }

  async sendEmailForgot(email: string): Promise<void> {
    if (!email) return;
    const salt = await bcrypt.genSalt();
    let hashedString: string = await bcrypt.hash(email, salt);
    hashedString = hashedString.replace(/\//g, 'f');
    const emailHash = new this.emailModel({
      email,
      hash: hashedString,
    });
    await emailHash.save();
    await this.sendEmail(email, {
      subject: 'Change your password',
      html:
        '<h1>Welcome user ' +
        email +
        '!</h1><p>Please click the link below to change your password:</p><b><a href="' +
        `http://${process.env.DOMAIN}:${process.env.PORT}/auth/changepwd/` +
        hashedString +
        '"></b>',
    });
  }

  async removeHash(email: string): Promise<void> {
    await this.emailModel.findOneAndRemove({ email }).exec();
  }

  async findHash(hash: string): Promise<EmailEntity> {
    const email = await this.emailModel.findOne({ hash }).exec();
    return email || null;
  }

  async login(
    email: string,
    password: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.userModel.findOne({ email, isActive: true }).exec();
    console.log(user, 'logging in');
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findOne(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userModel.findOne(data).exec();
    return user || null;
  }

  async findOneAndUpdate(
    email: string,
    data: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.userModel.findOneAndUpdate({ email }, data).exec();
    return user || null;
  }
}
