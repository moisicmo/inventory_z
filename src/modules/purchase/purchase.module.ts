import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PdfModule } from '@/common/pdf/pdf.module';
import { KardexService } from '@/modules/kardex/kardex.service';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, KardexService],
  imports: [PrismaModule, PdfModule],
})
export class PurchaseModule {}
