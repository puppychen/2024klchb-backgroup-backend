import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AttachmentUrlService } from '../user/attachment-url.service';

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachmentUrl: AttachmentUrlService,
  ) {}

  async findAll() {
    return this.prisma.activitySubmission.findMany({
      include: { user: { select: { uuid: true, name: true, content: true } } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /** 取得證明照片的短效 signed URL（私有圖片，僅授權後台可取） */
  async getProofUrl(uuid: string): Promise<{ url: string } | null> {
    const rec = await this.prisma.activitySubmission.findUnique({
      where: { uuid },
    });
    if (!rec?.proofImageStoragePath) return null;
    const { downloadUrl } = await this.attachmentUrl.generateReadUrl(
      rec.proofImageStoragePath,
    );
    return { url: downloadUrl };
  }
}
