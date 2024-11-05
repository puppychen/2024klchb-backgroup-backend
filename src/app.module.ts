import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { ConsultationModule } from './consultation/consultation.module';
import { FacilityModule } from './facility/facility.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AdminModule,
    ConsultationModule,
    FacilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
