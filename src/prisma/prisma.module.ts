import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
@Module({
  providers: [
    PrismaService,
    {
      provide: 'ExtendedPrisma',
      useFactory: (prismaService: PrismaService) => prismaService.extendedPrisma,
      inject: [PrismaService],
    },
  ],
  exports: [PrismaService, 'ExtendedPrisma'],
})
export class PrismaModule { }