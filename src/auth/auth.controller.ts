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
import Utils from '@utils/utils';

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
      const user = await this.usersService.findOne(body.email);
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
    console.log(request.session, '*******************************');
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
  forgotPassword() {}

  @Get('/logout')
  @Redirect('/')
  logout(@Req() request) {
    request.session.user = null;
  }
}
