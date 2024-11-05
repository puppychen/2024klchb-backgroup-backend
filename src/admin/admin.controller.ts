// src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
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
    return this.adminService.update(uuid, updateAdminDto);
  }

  @Delete(':uuid')
  @Roles('admin')
  async remove(@Param('uuid') uuid: string) {
    return this.adminService.delete(uuid);
  }
}
