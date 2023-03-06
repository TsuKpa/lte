import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./environments/.env', './environments/.env.production'],
    }),
    MongooseModule.forRoot(
      `mongodb://${
        process.env.DB_USERNAME +
        ':' +
        process.env.DB_PASSWORD +
        '@' +
        process.env.DB_HOST +
        ':' +
        process.env.DB_PORT +
        '/' +
        process.env.DB_NAME
      }`,
    ),
    AdminModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
