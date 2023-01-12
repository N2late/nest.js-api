import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { appendFile } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /* A global pipe that validates the data that is passed to the controller. Used in the signup and signin validation step */
  app.useGlobalPipes(
    new ValidationPipe({
      /* Telling the validation pipe to only validate the data that is passed to the controller, meaning, only the properties that are expected by a given class, for instance */
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
