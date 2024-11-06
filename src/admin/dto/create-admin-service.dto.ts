import { BaseAdminDto } from './base-admin.dto';

export class CreateAdminServiceDto extends BaseAdminDto {
  password: string;
}
