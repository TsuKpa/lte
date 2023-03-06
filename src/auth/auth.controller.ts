import { listKeysToValidate, UserEntity } from './../models/user.entity';
import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from '../models/users.service';
import { UserValidator } from '../validators/user.validator';

@Controller('/auth')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Get('/register')
  @Render('auth/register')
  renderRegister() {
    const viewData = [];
    viewData['title'] = 'User Register - Online Store';
    viewData['subtitle'] = 'User Register';
    return { viewData };
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
      await this.usersService.createUser(body);
      request.session.notification = {
        countShowToast: 0,
      };
      return response.redirect('/auth/login');
    }
  }

  @Get('/login')
  @Render('auth/login')
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

  @Get('/logout')
  @Redirect('/')
  logout(@Req() request) {
    request.session.user = null;
  }
}
