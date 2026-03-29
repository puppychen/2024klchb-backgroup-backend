import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SourceKeywordLogService } from './source-keyword-log.service';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';
import { SourceKeywordLogResponseDto } from './dto/source-keyword-log-response.dto';

@Controller('source-keyword-log')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth('JWT-auth')
export class SourceKeywordLogController {
  constructor(private readonly service: SourceKeywordLogService) {}

  @Get()
  async findAll() {
    const logs = await this.service.findAll();
    return SourceKeywordLogResponseDto.fromArray(logs);
  }
}
