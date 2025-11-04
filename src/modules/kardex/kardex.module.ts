import { Module } from '@nestjs/common';
import { KardexService } from './kardex.service';
import { KardexController } from './kardex.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [KardexController],
  providers: [KardexService],
  imports: [PrismaModule],
})
export class KardexModule {}
