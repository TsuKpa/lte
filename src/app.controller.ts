import { Controller, Get, Redirect, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  @Redirect('/home')
  index() {}

  @Get('/home')
  @Render('index')
  home() {}

  @Get('/about')
  @Render('about')
  about() {}
}
