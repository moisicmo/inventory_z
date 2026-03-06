import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { XlsxModule } from '@/common/xlsx/xlsx.module';

@Module({
  imports: [PrismaModule, XlsxModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
