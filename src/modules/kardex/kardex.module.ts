import { Module } from '@nestjs/common';
import { KardexService } from './kardex.service';
import { KardexController } from './kardex.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [KardexController],
  providers: [KardexService],
  imports: [PrismaModule,CaslModule],
})
export class KardexModule {}
