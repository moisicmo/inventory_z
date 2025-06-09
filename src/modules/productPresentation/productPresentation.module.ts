import { Module } from '@nestjs/common';
import { ProductPresentationService } from './productPresentation.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { ProductPresentationController } from './productPresentation.controller';
import { PriceService } from '@/modules/price/price.service';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [ProductPresentationController],
  providers: [ProductPresentationService,PriceService],
  imports: [PrismaModule,CaslModule],
})
export class ProductPresentationModule {}
