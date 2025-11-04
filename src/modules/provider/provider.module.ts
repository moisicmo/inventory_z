import { Module } from '@nestjs/common';
import { ProviderService } from './providerservice';
import { ProviderController } from './provider.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService],
  imports: [PrismaModule],
})
export class ProviderModule { }
