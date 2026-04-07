import { Module } from '@nestjs/common';
import { TransferRequestService } from './transfer-request.service';
import { TransferRequestController } from './transfer-request.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { KardexService } from '@/modules/kardex/kardex.service';
import { PdfModule } from '@/common/pdf/pdf.module';

@Module({
  controllers: [TransferRequestController],
  providers: [TransferRequestService, KardexService],
  imports: [PrismaModule, PdfModule],
})
export class TransferRequestModule {}
