import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TypeUnit } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from 'class-transformer';

export class CreateProductDto {

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID de categoría' })
  categoryId: number;

  @IsString()
  @ApiProperty({ example: 'Product 1' })
  name: string;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID de la sucursal' })
  branchId: number;

  @IsEnum(TypeUnit)
  @ApiProperty({ example: TypeUnit.CAJA, enum: TypeUnit })
  typeUnit: TypeUnit;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 10.5 })
  price: number;

  @IsOptional()
  @ApiPropertyOptional({ type: 'string', format: 'binary', required: false })
  image?: any;


  
}
