import { Module } from '@nestjs/common';
import { WriteoffService } from './writeoff.service';
import { WriteoffController } from './writeoff.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { KardexService } from '@/modules/kardex/kardex.service';

@Module({
  imports: [PrismaModule],
  controllers: [WriteoffController],
  providers: [WriteoffService, KardexService],
})
export class WriteoffModule {}
