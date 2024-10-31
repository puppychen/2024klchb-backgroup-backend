import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions/v2';
import { AppModule } from './src/app.module';

const expressServer = express();

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
    await createFunction(expressServer);
    expressServer(request, response);
  },
);
