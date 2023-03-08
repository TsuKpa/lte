import { listKeysToValidate, UserEntity } from './../models/user.entity';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from '../models/users.service';
import { UserValidator } from '../validators/user.validator';
import Utils from '../utils/utils';

@Controller('/auth')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Get('/register')
  @Render('auth/register/register')
  renderRegister(@Req() request) {
    let isShowError = false; // check show error when login failed
    if (request.session.notification?.countShowErrorRegister === 0) {
      isShowError = true;
      request.session.notification.countShowErrorRegister = 1;
    }
    return {
      flashErrors: isShowError ? request.session.flashErrors : [],
    };
  }

  @Get('/notifi-register')
  @Render('auth/register/before-verify-email')
  beforeVerifyRegister(@Req() request) {
    const email = request.session.email || 'test@example.com';
    return {
      email,
    };
  }

  @Get('/verify/:id')
  @Render('auth/register/verify')
  async verifyRegister(@Param('id') id) {
    const hashEmail = await this.usersService.findHash(id);
    if (hashEmail) {
      const cloneEmail = Utils.cloneDeep(hashEmail);
      await this.usersService.findOneAndUpdate(cloneEmail.email, {
        isActive: true,
      });
      await this.usersService.removeHash(hashEmail.email);
      return {
        email: cloneEmail.email || 'test@example.com',
      };
    }
  }

  @Post('/register')
  async register(
    @Body() body: Pick<UserEntity, 'email' | 'password'>,
    @Res() response,
    @Req() request,
  ) {
    const errors: string[] = UserValidator.validate(body, listKeysToValidate);
    console.log(errors);
    if (errors.length) {
      request.session.flashErrors = errors;
      return response.redirect('/auth/register');
    } else {
      const user = await this.usersService.findOne({ email: body.email });
      if (!user) {
        await this.usersService.createUser(body);
        // request.session.notification = {
        //   countShowToast: 0,
        // };
        request.session.email = body.email;
        return response.redirect('/auth/notifi-register');
      }
      // request.session.notification = {
      //   ...request.session.notification,
      //   countShowErrorRegister: 0, // show error
      // };
      request.session.flashErrors = ['Email already registered'];
      return response.redirect('/auth/register');
    }
  }

  @Get('/login')
  @Render('auth/login/login')
  renderLogin(@Req() request) {
    let isShowToast = false; // check if user created successfull then show toast
    if (request.session.notification?.countShowToast === 0) {
      isShowToast = true;
      request.session.notification.countShowToast = 1;
    }
    let isShowError = false; // check show error when login failed
    if (request.session.notification?.countShowError === 0) {
      isShowError = true;
      request.session.notification.countShowError = 1;
    }
    return {
      isShowToast,
      flashErrors: isShowError ? request.session.flashErrors : [],
    };
  }

  @Post('/login')
  async login(@Body() body, @Req() request, @Res() response) {
    const errors: string[] = UserValidator.validate(body, listKeysToValidate);
    if (errors.length) {
      request.session.flashErrors = errors;
      return response.redirect('/auth/login');
    }
    const { email, password } = body;
    const user = await this.usersService.login(email, password);
    if (user) {
      request.session.user = user;
      return response.redirect('/home');
    } else {
      request.session.notification = {
        ...request.session.notification,
        countShowError: 0, // show error
      };
      request.session.flashErrors = ['Email or password is incorrect'];
      console.log(request.session);
      return response.redirect('/auth/login');
    }
  }

  @Get('/forgot')
  @Render('auth/password/forgot-password')
  renderForgotPassword(@Req() request) {
    let isShowError = false; // check show error when login failed
    if (request.session.notification?.countShowError === 0) {
      isShowError = true;
      request.session.notification.countShowError = 1;
    }
    return {
      flashErrors: isShowError ? request.session.flashErrors : [],
    };
  }

  @Post('/forgot')
  async forgotPassword(
    @Body() body: { email: string },
    @Res() response,
    @Req() request,
  ) {
    const { email } = body;
    const user = await this.usersService.findOne({ email, isActive: true });
    if (user) {
      await this.usersService.sendEmailForgot(email);
      request.session.email = email;
      console.log(request.session.email);
      return response.redirect('/auth/notifi-forgot');
    } else {
      request.session.flashErrors = ['Email is not exist!'];
      request.session.notification = {
        ...request.session.notification,
        countShowError: 0, // show error
      };
      return response.redirect('/auth/forgot');
    }
  }

  @Get('/notifi-forgot')
  @Render('auth/password/notifi-forgot')
  renderNotifiForgot(@Req() request) {
    const email = request.session.email || 'test@example.com';
    return {
      email,
    };
  }

  @Get('/changepwd/:id')
  @Render('auth/password/change-password')
  async renderChangePassword(@Req() request, @Res() response, @Param('id') id) {
    const emailHash = await this.usersService.findHash(id);
    if (!emailHash) {
      response.redirect('/auth/forgot');
    }
    request.session.recoverHash = id;
  }

  @Post('/recover')
  async recoverPassword(
    @Body() body: { password: string; password_confirm: string },
    @Res() response,
    @Req() request,
  ) {
    console.log(request.session, body, 'recoverpwd post data');
    const { password, password_confirm } = body;
    if (!password || !password_confirm || password !== password_confirm) return;
    const emailHash = await this.usersService.findHash(
      request.session.recoverHash,
    );
    if (!emailHash) {
      response.redirect('/auth/forgot');
    }
    const email: string = Utils.cloneDeep(emailHash.email);
    const hashedPassword: string = await Utils.createHash(password);
    await this.usersService.findOneAndUpdate(email, {
      password: hashedPassword,
    });
    await this.usersService.removeHash(email);
    console.log('changed password for user: ', email);
    request.session.email = email;
    response.redirect('/auth/after-change'); // direct to notification page
  }

  @Get('/after-change')
  @Render('auth/password/after-change')
  renderNotificationChangedPwd(@Req() request, @Res() response) {
    if (request.session.email) {
      return {
        email: request.session.email,
      };
    }
    response.redirect('/auth/login');
  }

  @Get('/logout')
  @Redirect('/')
  logout(@Req() request) {
    request.session.user = null;
  }
}
