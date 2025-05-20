import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateBranchDto {

  @IsString()
  @ApiProperty({
    example: 'Product 1',
    description: 'Nombre de la sucursal',
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: 'direccion 123',
    description: 'Dirección de la sucursal',
  })
  address: string;

}
