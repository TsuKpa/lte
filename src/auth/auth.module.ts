import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailSchema } from '../models/email.schema';
import { UserSchema } from '../models/user.schema';
import { UsersService } from '../models/users.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Email', schema: EmailSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [UsersService],
})
export class AuthModule {}
