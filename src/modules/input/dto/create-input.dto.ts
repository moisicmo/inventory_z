import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductInputDto } from './product-input.dto';

export class CreateInputDto {
  @IsNumber()
  @ApiProperty({ example: 1, description: 'Identificador de la sucursal' })
  branchId: number;

  @IsString()
  @ApiProperty({
    example:'compra',
    description: 'Detalle de ingreso',
  })
  detail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductInputDto)
  @ApiProperty({
    type: [ProductInputDto],
    description: 'Lista de productos a ingresar',
  })
  products: ProductInputDto[];
}
