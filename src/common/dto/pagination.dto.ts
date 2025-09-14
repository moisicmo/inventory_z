import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {

  @IsOptional()
  @Type(() => String)
  branchId?: string = '';

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 1000000000;

  @IsOptional()
  @Type(() => String)
  keys?: string = '';

}