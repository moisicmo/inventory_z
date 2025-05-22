import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [],
  providers: [PriceService],
  imports: [PrismaModule],
})
export class PriceModule { }
