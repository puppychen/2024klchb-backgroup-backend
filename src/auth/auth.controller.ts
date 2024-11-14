import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Admin } from '@prisma/client';

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
  async getProfile(@Request() req) {
    console.log(req.user);
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getAdminProfile(@Request() req) {
    const uuid = req.user.uuid;
    return this.authService.getAdminProfile(uuid);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body()
    updateData: Partial<Pick<Admin, 'name' | 'email' | 'password'>> & {
      confirmPassword?: string;
    },
  ) {
    const uuid = req.user.uuid;

    console.log(updateData);
    const { confirmPassword, ...updateAdminData } = updateData;
    console.log(updateAdminData);
    if (updateData.password && updateData.password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    return this.authService.updateAdminProfile(uuid, updateAdminData);
  }
}
