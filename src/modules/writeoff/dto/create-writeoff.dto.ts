import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WriteoffItemDto } from './writeoff-item.dto';
import { TypeBaja } from '@/generated/prisma/enums';

export class CreateWriteoffDto {
  @IsUUID()
  @ApiProperty({ description: 'Branch ID' })
  branchId: string;

  @IsEnum(TypeBaja)
  @ApiProperty({ enum: TypeBaja, description: 'Write-off reason' })
  reason: TypeBaja;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Additional description' })
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WriteoffItemDto)
  @ApiProperty({ type: [WriteoffItemDto], description: 'Products to write off' })
  items: WriteoffItemDto[];
}
