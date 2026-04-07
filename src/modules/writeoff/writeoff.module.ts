import { Module } from '@nestjs/common';
import { WriteoffService } from './writeoff.service';
import { WriteoffController } from './writeoff.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { KardexService } from '@/modules/kardex/kardex.service';
import { XlsxService } from '@/common/xlsx/xlsx.service';

@Module({
  imports: [PrismaModule],
  controllers: [WriteoffController],
  providers: [WriteoffService, KardexService, XlsxService],
})
export class WriteoffModule {}
