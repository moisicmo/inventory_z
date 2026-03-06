import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportDateDto } from './dto/report-date.dto';
import { checkAbilities } from '@/decorator';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('inventory')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.report })
  getInventoryReport(@Query() dto: ReportDateDto) {
    return this.reportService.getInventoryReport(dto);
  }

  @Get('sale')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.report })
  getSaleReport(@Query() dto: ReportDateDto) {
    return this.reportService.getSaleReport(dto);
  }
}
