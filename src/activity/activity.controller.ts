import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAdminGuard } from 'src/auth/jwt-admin.guard';

interface ActivitySubmissionResponse {
  uuid: string;
  lineId: string;
  lineName: string; // user.name
  name: string; // content.name（基本資料姓名）
  identity: string;
  dueDate: string | null;
  babyBirth: string | null;
  pediatricianStatus: string | null;
  pediatricianClinicName: string | null;
  hasProofImage: boolean;
  profileSyncStatus: string | null;
  linePushStatus: string | null;
  submittedAt: Date;
}

@Controller('activity-submission')
@UseGuards(JwtAdminGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async findAll(): Promise<ActivitySubmissionResponse[]> {
    const list = await this.activityService.findAll();
    return list.map((a) => this.transform(a));
  }

  @Get(':uuid/proof-url')
  async proofUrl(
    @Param('uuid') uuid: string,
  ): Promise<{ status_code: number; data: { url?: string } | null }> {
    const r = await this.activityService.getProofUrl(uuid);
    if (!r) return { status_code: 404, data: null };
    return { status_code: 200, data: { url: r.url } };
  }

  private transform(a: any): ActivitySubmissionResponse {
    const content = (a.user?.content as any) || {};
    const clinic = (a.pediatricianClinic as any) || null;
    return {
      uuid: a.uuid,
      lineId: a.lineId,
      lineName: a.user?.name || '',
      name: content.name || '',
      identity: a.identity,
      dueDate: a.dueDate ?? null,
      babyBirth: a.babyBirth ?? null,
      pediatricianStatus: a.pediatricianStatus ?? null,
      pediatricianClinicName: clinic?.name ?? null,
      hasProofImage: !!a.proofImageStoragePath,
      profileSyncStatus: a.profileSyncStatus ?? null,
      linePushStatus: a.linePushStatus ?? null,
      submittedAt: a.submittedAt,
    };
  }
}
