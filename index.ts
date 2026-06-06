import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as cors from 'cors';
import * as express from 'express';
import * as functions from 'firebase-functions/v2';
import { AppModule } from './src/app.module';

const expressServer = express();
expressServer.use(cors());
const createFunction = async (expressInstance): Promise<void> => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  await app.init();
};

export const background = functions.https.onRequest(
  { region: 'asia-east1' },
  async (request, response) => {
    // CORS：反射請求來源（支援跨子網域 + 帶憑證），開發環境前端可跨域呼叫
    const origin = request.headers.origin;
    response.set('Access-Control-Allow-Origin', origin ? String(origin) : '*');
    response.set('Vary', 'Origin');
    response.set(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Allow-Credentials', 'true');
    // preflight 直接回應，不進入 Nest（避免被每請求 re-init 的路由攔截而缺 CORS header）
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }
    await createFunction(expressServer);
    expressServer(request, response);
  },
);
