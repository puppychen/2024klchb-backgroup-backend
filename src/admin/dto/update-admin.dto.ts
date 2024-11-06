// src/admin/dto/update-admin.dto.ts
import { BaseAdminDto } from './base-admin.dto';

export class UpdateAdminDto extends BaseAdminDto {
  password?: string;
  confirmPassword?: string;
}
