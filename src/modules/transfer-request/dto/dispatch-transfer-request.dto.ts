import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DispatchItemDto {
  @IsString()
  @ApiProperty({ description: 'ID del item de solicitud' })
  itemId: string;

  @IsNumber()
  @ApiProperty({ example: 10, description: 'Cantidad despachada' })
  quantityDispatched: number;
}

export class DispatchTransferRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Se envía completo', required: false })
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispatchItemDto)
  @ApiProperty({ type: [DispatchItemDto], description: 'Cantidades despachadas por ítem' })
  items: DispatchItemDto[];
}
