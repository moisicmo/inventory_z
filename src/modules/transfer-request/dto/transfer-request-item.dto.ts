import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TypeUnit } from '@/generated/prisma/enums';

export class TransferRequestItemDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid', description: 'Identificador del producto' })
  productId: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 10, description: 'Cantidad solicitada' })
  quantityRequested: number;

  @IsEnum(TypeUnit)
  @ApiProperty({ enum: TypeUnit, description: 'Tipo de unidad (UNIDAD | CAJA)' })
  typeUnit: TypeUnit;

  @IsNumber()
  @ApiProperty({ example: 15.5, description: 'Precio unitario' })
  price: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Detalle del ítem', required: false })
  detail?: string;
}
