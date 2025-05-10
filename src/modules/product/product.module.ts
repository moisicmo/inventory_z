import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [PrismaModule,CloudinaryModule],
})
export class ProductModule { }
