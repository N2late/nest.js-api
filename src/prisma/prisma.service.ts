import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// provides a way to interact with a database using the Prisma API
@Injectable()
export class PrismaService extends PrismaClient {
  // Call the parent class's constructor method with the options
  constructor() {
    // Call the parent class's constructor method with the options
    super({
      datasources: {
        db: {
          url: 'postgresql://nestapi:nestapi@localhost:5434/nestapi?schema=public',
        },
      },
    });
  }
}
