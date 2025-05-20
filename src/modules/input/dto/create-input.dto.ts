import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PresentationInputDto } from './product-input.dto';

export class CreateInputDto {
  @IsString()
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
  @Type(() => PresentationInputDto)
  @ApiProperty({
    type: [PresentationInputDto],
    description: 'Lista de presentaciones a ingresar',
  })
  presentations: PresentationInputDto[];
}
