import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailSchema } from '@src/models/email.schema';
import { UserSchema } from '@src/models/user.schema';
import { UsersService } from '@src/models/users.service';
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
