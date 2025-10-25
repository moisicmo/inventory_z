import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { KardexService } from '../kardex/kardex.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { PdfModule } from '@/common/pdf/pdf.module';
import { GoogledriveModule } from '@/common/googledrive/googledrive.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService,KardexService],
  imports: [PrismaModule, CaslModule, PdfModule, GoogledriveModule],
})
export class OrderModule { }
