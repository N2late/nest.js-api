import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { PrismaClient } from '@prisma/client';

// provides a way to interact with a database using the Prisma API
@Injectable()
export class PrismaService extends PrismaClient {
  /* Calling the parent class's constructor method with the options. */
  constructor(config: ConfigService) {
    // Call the parent class's constructor method with the options
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}
