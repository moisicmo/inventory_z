import { Module } from '@nestjs/common';
import { PresentationService } from './presentation.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { PresentationController } from './presentation.controller';
import { PriceService } from '@/modules/price/price.service';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [PresentationController],
  providers: [PresentationService,PriceService],
  imports: [PrismaModule,CaslModule],
})
export class PresentationModule {}
