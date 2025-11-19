import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductInputDto } from './product-input.dto';

export class CreateInputDto {
  @IsUUID()
  @ApiProperty({ example: 'abc', description: 'Identificador de la sucursal' })
  branchId: string;

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
    description: 'Lista de presentaciones a ingresar',
  })
  products: ProductInputDto[];
}
