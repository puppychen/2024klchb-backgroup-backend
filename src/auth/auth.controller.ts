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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Admin } from '@prisma/client';

@ApiTags('認證管理')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '管理員登入' })
  @ApiResponse({ status: 200, description: '登入成功，回傳 JWT token' })
  @ApiResponse({ status: 401, description: '登入失敗' })
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

  @ApiOperation({ summary: '註冊新管理員', description: '需要 admin 權限' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '成功註冊管理員' })
  @ApiResponse({ status: 403, description: '權限不足' })
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

  @ApiOperation({ summary: '取得當前登入用戶資料' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '成功取得用戶資料' })
  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  async getProfile(@Request() req) {
    console.log(req.user);
    return req.user;
  }

  @ApiOperation({ summary: '取得管理員詳細資料' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '成功取得管理員資料' })
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getAdminProfile(@Request() req) {
    const uuid = req.user.uuid;
    return this.authService.getAdminProfile(uuid);
  }

  @ApiOperation({ summary: '更新管理員資料' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '成功更新資料' })
  @ApiResponse({ status: 400, description: '資料格式錯誤' })
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
