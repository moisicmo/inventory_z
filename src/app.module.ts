import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { CategoryModule } from './modules/category/category.module';
import { BrandModule } from './modules/brand/brand.module';
import { ProviderModule } from './modules/provider/provider.module';
import { ProductModule } from './modules/product/product.module';
import { BranchModule } from './modules/branch/branch.module';
import { CustomerModule } from './modules/customer/customer.module';
import { RoleModule } from './modules/role/role.module';
import { StaffModule } from './modules/staff/staff.module';
import { InputModule } from './modules/input/input.module';
import { OrderModule } from './modules/order/order.module';
import { PermissionModule } from './modules/permission/permission.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { CloudinaryService } from './common/cloudinary/clodinary.service';
import { KardexModule } from './modules/kardex/kardex.module';
import { ProductPresentationModule } from './modules/productPresentation/productPresentation.module';
import { PriceModule } from './modules/price/price.module';
import { TransferModule } from './modules/transfer/transfer.module';

import { GoogledriveModule } from './common/googledrive/googledrive.module';
import { GmailModule } from './common/gmail/gmail.module';
import { PdfModule } from './common/pdf/pdf.module';
import { XlsxModule } from './common/xlsx/xlsx.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchModule,
    PermissionModule,
    RoleModule,
    StaffModule,
    CategoryModule,
    BrandModule,
    ProviderModule,
    ProductModule,
    ProductPresentationModule,
    InputModule,
    CustomerModule,
    OrderModule,
    CloudinaryModule,
    PdfModule,
    XlsxModule,
    GoogledriveModule,
    GmailModule,
    KardexModule,
    PriceModule,
    TransferModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    CloudinaryService,
  ],
  exports: [PrismaService],
})
export class AppModule { }
