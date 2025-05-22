import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';
import { CaslModule } from '@/casl/casl.module';
import { PresentationService } from '@/modules/presentation/presentation.service';
import { PriceService } from '@/modules/price/price.service';
@Module({
  controllers: [ProductController],
  providers: [ProductService, PresentationService, PriceService],
  imports: [PrismaModule, CloudinaryModule, CaslModule],
})
export class ProductModule { }
