import { ApiProperty } from "@nestjs/swagger";
import { TypeDocument } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class CreateCustomerDto {

  @IsString()
  @ApiProperty({
    example: '123456789',
    description: 'Número de documento del cliente',
  })
  numberDocument: string;

  @IsEnum(TypeDocument)
  @ApiProperty({
    example: TypeDocument.DNI,
    description: 'Tipo de documento del cliente',
    enum: TypeDocument,
  })
  typeDocument: TypeDocument;
  
  @IsString()
  @ApiProperty({
    example: 'Pablo',
    description: 'Nombre del cliente',
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: 'Rios',
    description: 'Apellido del cliente',
  })
  lastName: string;

}
