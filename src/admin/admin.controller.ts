import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { CreateAdminServiceDto, UpdateAdminServiceDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createAdminDto: CreateAdminDto) {
    if (createAdminDto.password !== createAdminDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const createAdminServiceDto: CreateAdminServiceDto = {
      username: createAdminDto.username,
      password: createAdminDto.password,
      name: createAdminDto.name,
      email: createAdminDto.email,
    };
    return this.adminService.create(createAdminServiceDto);
  }

  @Get()
  @Roles('admin')
  async findAll() {
    return this.adminService.findAll();
  }

  @Get(':uuid')
  @Roles('admin')
  async findOne(@Param('uuid') uuid: string) {
    return this.adminService.findOne(uuid);
  }

  @Patch(':uuid')
  @Roles('admin')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    if (
      updateAdminDto.password &&
      updateAdminDto.password !== updateAdminDto.confirmPassword
    ) {
      throw new BadRequestException('Passwords do not match');
    }
    const updateAdminServiceDto: UpdateAdminServiceDto = {
      username: updateAdminDto.username,
      password: updateAdminDto.password,
      name: updateAdminDto.name,
      email: updateAdminDto.email,
    };
    return this.adminService.update(uuid, updateAdminServiceDto);
  }

  @Delete(':uuid')
  @Roles('admin')
  async remove(@Param('uuid') uuid: string) {
    return this.adminService.delete(uuid);
  }
}