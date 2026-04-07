import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransferRequestItemDto } from './transfer-request-item.dto';

export class CreateTransferRequestDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid', description: 'Sucursal origen (de donde se solicita)' })
  fromBranchId: string;

  @IsUUID()
  @ApiProperty({ example: 'uuid', description: 'Sucursal destino (quien solicita)' })
  toBranchId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Necesito reponer stock', required: false })
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferRequestItemDto)
  @ApiProperty({ type: [TransferRequestItemDto], description: 'Productos solicitados' })
  items: TransferRequestItemDto[];
}
