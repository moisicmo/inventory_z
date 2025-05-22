import { Module } from '@nestjs/common';
import { InputService } from './input.service';
import { InputController } from './input.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { KardexService } from '../kardex/kardex.service';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [InputController],
  providers: [InputService,KardexService],
  imports: [PrismaModule,CaslModule],
})
export class InputModule {}
