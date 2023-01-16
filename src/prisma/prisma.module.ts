import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/* It makes the module available to the entire application. No need to import it for each module to interact with the db. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
