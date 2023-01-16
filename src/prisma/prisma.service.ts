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

  // tear down logic for the e2e tests (we could also simply setup the prima schema to delete on cascade)
  // the $transaction method is a Prisma method that allows us to execute multiple queries in a single transaction by the order we pass them in
  cleanDb() {
    return this.$transaction([
      this.bookmark.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
