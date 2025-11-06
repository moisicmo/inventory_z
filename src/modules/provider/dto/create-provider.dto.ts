import { CreateAddressDto } from "@/common/dto/create-address.dto";
import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class CreateProviderDto extends CreateAddressDto {

  @IsString()
  @ApiProperty({
    example: '213123213',
    description: 'Nit del proveedor',
  })
  nit: string;

  @IsString()
  @ApiProperty({
    example: 'Provider 1',
    description: 'Nombre del proveedor',
  })
  name: string;


  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    example: ['70123456', '78912345'],
    description: 'Teléfonos de la sucursal',
  })
  phone: string[];

}
