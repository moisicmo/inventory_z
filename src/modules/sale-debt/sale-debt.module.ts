import { Module } from '@nestjs/common';
import { SaleDebtService } from './sale-debt.service';
import { SaleDebtController } from './sale-debt.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SaleDebtController],
  providers: [SaleDebtService],
})
export class SaleDebtModule {}
