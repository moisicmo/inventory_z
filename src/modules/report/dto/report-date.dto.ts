import { IsDateString } from 'class-validator';

export class ReportDateDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
