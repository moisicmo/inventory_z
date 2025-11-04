import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { KardexService } from '../kardex/kardex.service';

@Module({
  controllers: [TransferController],
  providers: [TransferService,KardexService],
  imports: [PrismaModule],
})
export class TransferModule { }
