import { CreateAddressDto } from "@/common/dto/create-address.dto";
import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class CreateBranchDto extends CreateAddressDto {

  @IsString()
  @ApiProperty({
    example: 'Bloque A',
    description: 'Nombre de la sucursal',
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: '123456789',
    description: 'Número de cuenta bancaria',
  })
  bankAccount: string;


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
