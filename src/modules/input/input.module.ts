import { Module } from '@nestjs/common';
import { InputService } from './input.service';
import { InputController } from './input.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [InputController],
  providers: [InputService],
    imports: [PrismaModule],
})
export class InputModule {}
