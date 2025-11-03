/* eslint-disable prettier/prettier */
import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return {};
  }

  @Get('acceder')
  @Render('acceder')
  acceder() {
    return {};
  }
}
