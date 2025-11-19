import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Transform, Type } from 'class-transformer';
import { BasePriceDto } from "@/modules/price/dto/create-price.dto";

export class CreateProductDto {

  @IsString()
  @ApiProperty({ example: 'abc', description: 'ID de categoría' })
  categoryId: string;

  @IsString()
  @ApiProperty({ example: 'abc', description: 'ID de la marca' })
  brandId: string;

  @IsString()
  @ApiProperty({ example: 'abc', description: 'ID del proveedor' })
  providerId: string;

  @IsString()
  @ApiProperty({ example: 'Product 1' })
  code: string;

  @IsString()
  @ApiProperty({ example: 'Product 1' })
  name: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'description product 1' })
  description?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'description product 1' })
  barCode?: string;

  @IsOptional()
  @ApiPropertyOptional({ type: 'string', format: 'binary', required: false })
  image?: any;

  @ApiProperty({
    description: 'Precios por sucursal del producto',
    type: [BasePriceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BasePriceDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  prices: BasePriceDto[];

}
