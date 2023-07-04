import { Controller, Get, Post } from '@nestjs/common';
import { AppService, Post as Posts } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<Posts[]> {
    return this.appService.getHello();
  }

  @Post()
  changeCache() {
    return this.appService.resetByPost();
  }
}
