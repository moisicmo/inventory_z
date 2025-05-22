import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  imports: [PrismaModule,CaslModule],
})
export class CustomerModule { }
