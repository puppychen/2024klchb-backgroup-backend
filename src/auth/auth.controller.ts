import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    try {
      const admin = await this.authService.validateAdmin(
        body.username,
        body.password,
      );
      return this.authService.login(admin);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('register')
  async register(
    @Body()
    body: {
      username: string;
      password: string;
      email: string;
      name: string;
    },
  ) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    console.log(req.user);
    return req.user;
  }
}
