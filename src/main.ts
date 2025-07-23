import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // OpenAPI/Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('遠距諮詢管理後台 API')
    .setDescription('遠距諮詢管理系統後端 API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 提供 OpenAPI JSON 端點
  SwaggerModule.setup('api-docs', app, document, {
    jsonDocumentUrl: '/api-docs/openapi.json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
