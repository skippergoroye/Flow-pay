import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    return req.user;
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() updates: any) {
    return this.userService.updateProfile(req.user.id, updates);
  }
}