import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { TypeUnit } from '@/generated/prisma/enums';

export class PurchaseItemDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid', description: 'Identificador del producto' })
  productId: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 10, description: 'Cantidad' })
  quantity: number;

  @IsNumber()
  @ApiProperty({ example: 15.5, description: 'Precio de compra unitario' })
  price: number;

  @IsEnum(TypeUnit)
  @ApiProperty({ enum: TypeUnit, description: 'Tipo de unidad (UNIDAD | CAJA)' })
  typeUnit: TypeUnit;

  @IsString()
  @ApiProperty({ example: 'compra', description: 'Detalle del ítem' })
  detail: string;
}
