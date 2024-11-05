import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConsultationService } from './consultation.service';
import { Consultation } from './consultation.entity';

@Controller('consultation')
@UseGuards(AuthGuard('jwt'))
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get()
  async findAll(): Promise<Consultation[]> {
    return this.consultationService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<Consultation> {
    return this.consultationService.findOne(uuid);
  }
}
