import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

const FIREBASE_APP_NAME = 'background-attachment-reader';
const SIGNED_URL_READ_EXPIRY_DAYS = 7;

@Injectable()
export class AttachmentUrlService {
  private readonly logger = new Logger(AttachmentUrlService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateReadUrl(
    storagePath: string,
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    if (!storagePath) {
      throw new BadRequestException('Attachment storage path is empty');
    }

    const bucket = this.getBucket();
    const file = bucket.file(storagePath);
    const expiresAt = new Date(
      Date.now() + SIGNED_URL_READ_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    try {
      const [downloadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: expiresAt,
      });
      return { downloadUrl, expiresAt };
    } catch (error) {
      this.logger.warn(
        `Failed to generate attachment read URL: ${error.message}`,
      );
      throw new BadRequestException('無法生成附件下載連結');
    }
  }

  private getBucket() {
    const app = this.getOrCreateFirebaseApp();
    return app.storage().bucket();
  }

  private getOrCreateFirebaseApp(): admin.app.App {
    const existingApp = admin.apps.find((app) => app?.name === FIREBASE_APP_NAME);
    if (existingApp) {
      return existingApp;
    }

    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const storageBucket = this.configService.get<string>(
      'FIREBASE_STORAGE_BUCKET',
    );

    if (!projectId || !privateKey || !clientEmail || !storageBucket) {
      throw new BadRequestException('Firebase Storage 未初始化');
    }

    return admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
        storageBucket,
      },
      FIREBASE_APP_NAME,
    );
  }
}
