import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { Consultation } from './consultation.entity';
import { JwtAdminGuard } from 'src/auth/jwt-admin.guard';

interface ConsultationResponse {
  uuid: string;
  userUuid?: string;
  lineName: string;
  name: string;
  phone: string;
  address: string;
  childName: string;
  yearSelected: string;
  weight: string;
  primaryMedical: string;
  topicSelected: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

@Controller('consultation')
@UseGuards(JwtAdminGuard)
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get()
  async findAll(): Promise<ConsultationResponse[]> {
    const consultations = await this.consultationService.findAll();
    return consultations.map((consultation) =>
      this.transformConsultation(consultation),
    );
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<Consultation> {
    return this.consultationService.findOne(uuid);
  }

  private transformConsultation(
    consultation: Consultation,
  ): ConsultationResponse {
    return {
      uuid: consultation.uuid,
      userUuid: consultation.user?.uuid,
      lineName: consultation.lineName,
      name: this.anonymizeName(consultation.name),
      phone: this.anonymizePhone(consultation.phone),
      address: consultation.address,
      childName: this.anonymizeName(consultation.childName),
      yearSelected: consultation.yearSelected,
      weight: consultation.weight,
      primaryMedical: consultation.primaryMedical,
      topicSelected: consultation.topicSelected,
      content: consultation.content,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  }

  private anonymizeName(name: string): string {
    if (!name || name.length < 2) return name;
    return name[0] + 'O'.repeat(name.length - 1);
  }

  private anonymizePhone(phone: string): string {
    if (!phone || phone.length < 3) return phone;
    return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
  }
}
