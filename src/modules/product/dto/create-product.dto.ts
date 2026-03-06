import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { plainToInstance, Transform, Type } from 'class-transformer';
import { BasePriceDto } from "@/modules/price/dto/create-price.dto";
import { UnitConversionDto } from "./unit-conversion.dto";

export class CreateProductDto {

  @IsString()
  @ApiProperty({ example: 'abc', description: 'ID de categoría' })
  categoryId: string;

  @IsString()
  @ApiProperty({ example: 'abc', description: 'ID de la marca' })
  brandId: string;

  @IsString()
  @ApiProperty({ example: 'Product 1' })
  code: string;

  @IsString()
  @ApiProperty({ example: 'Product 1' })
  name: string;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 10.5 })
  promoPrice: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: 5.0, description: 'Costo referencial del producto' })
  refCost?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'description product 1' })
  description?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'description product 1' })
  barCode?: string;

  @IsOptional()
  @ApiPropertyOptional({ type: 'string', format: 'binary', required: false })
  image?: any;

  @ApiProperty({ description: 'Conversión de unidades', type: UnitConversionDto })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return plainToInstance(UnitConversionDto, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  @ValidateNested()
  @Type(() => UnitConversionDto)
  unitConversion: UnitConversionDto;

  @ApiProperty({
    description: 'Precios por sucursal del producto',
    type: [BasePriceDto],
  })

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const arr = JSON.parse(value);
        return arr.map(item => plainToInstance(BasePriceDto, item));
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BasePriceDto)
  prices: BasePriceDto[];

}
