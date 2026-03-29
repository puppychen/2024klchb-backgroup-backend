import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { ConsultationModule } from './consultation/consultation.module';
import { FacilityModule } from './facility/facility.module';
import { UserModule } from './user/user.module';
import { SourceKeywordLogModule } from './source-keyword-log/source-keyword-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AdminModule,
    ConsultationModule,
    FacilityModule,
    UserModule,
    SourceKeywordLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
