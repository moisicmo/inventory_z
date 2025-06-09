import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { KardexService } from '../kardex/kardex.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService,KardexService],
  imports: [PrismaModule, CaslModule],
})
export class OrderModule { }
