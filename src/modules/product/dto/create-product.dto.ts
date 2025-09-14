import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TypeUnit } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from 'class-transformer';

export class CreateProductDto {

  @IsString()
  @ApiProperty({ example: 'abc', description: 'ID de categoría' })
  categoryId: string;

  @IsString()
  @ApiProperty({ example: 'Product 1' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'Product Presentation 1' })
  namePresentation: string;

  @IsString()
  @ApiProperty({ example: 'abc', description: 'ID de la sucursal' })
  branchId: string;

  @IsEnum(TypeUnit)
  @ApiProperty({ example: TypeUnit.UNIDAD, enum: TypeUnit })
  typeUnit: TypeUnit;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 10.5 })
  price: number;

  @IsOptional()
  @ApiPropertyOptional({ type: 'string', format: 'binary', required: false })
  image?: any;


  
}
