import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TypeUnit } from '@/generated/prisma/enums';

export class ProductInputDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid', description: 'Identificador del producto' })
  productId: string;

  @IsNumber()
  @ApiProperty({ example: 100, description: 'Cantidad de producto' })
  quantity: number;

  @IsNumber()
  @ApiProperty({ example: 15.5, description: 'Precio del producto' })
  price: number;

  @IsEnum(TypeUnit)
  @ApiProperty({ enum: TypeUnit, description: 'Tipo de unidad (UNIDAD | CAJA)' })
  typeUnit: TypeUnit;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2023-10-01', description: 'Fecha de vencimiento', required: false })
  dueDate?: Date;
}