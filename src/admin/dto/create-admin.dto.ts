// src/admin/dto/create-admin.dto.ts
import { BaseAdminDto } from './base-admin.dto';

export class CreateAdminDto extends BaseAdminDto {
  password: string;
  confirmPassword: string;
}