import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReceiveTransferRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Faltaron 2 unidades del producto X', required: false })
  observationNote?: string;
}
