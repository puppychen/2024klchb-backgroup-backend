import { BaseAdminDto } from './base-admin.dto';

export class UpdateAdminServiceDto extends BaseAdminDto {
  password?: string;
}