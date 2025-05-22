import { Module } from '@nestjs/common';
import { InputService } from './input.service';
import { InputController } from './input.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { KardexService } from '@/modules/kardex/kardex.service';

@Module({
  controllers: [InputController],
  providers: [InputService,KardexService],
  imports: [PrismaModule,CaslModule],
})
export class InputModule {}
