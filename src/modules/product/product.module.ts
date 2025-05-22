import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [PrismaModule,CloudinaryModule,CaslModule],
})
export class ProductModule { }
