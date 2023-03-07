import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
const hbs = require('hbs');
const hbsUtils = require('hbs-utils');
const session = require('express-session');
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  hbs.registerPartials(join(__dirname, '..', 'views/layouts'));
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views/layouts'));
  app.setViewEngine('hbs');
  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use('/home', function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/auth/login');
    }
  });
  app.use('/auth/login', function (req, res, next) {
    if (!req.session.user) {
      next();
    } else {
      res.redirect('/home');
    }
  });

  app.use('/auth/register', function (req, res, next) {
    if (!req.session.user) {
      next();
    } else {
      res.redirect('/home');
    }
  });

  await app.listen(process.env.PORT || 3000);
  const logger = new Logger();
  logger.warn(`Server is running on port ${process.env.PORT}`);
}
bootstrap();
