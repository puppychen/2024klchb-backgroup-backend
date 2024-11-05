export class CreateFacilityDto {
  code: string;
  name: string;
  isChildCare: boolean;
  isFluoride: boolean;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  serviceInfo?: any;
}
