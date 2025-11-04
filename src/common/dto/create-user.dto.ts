import { ApiProperty } from "@nestjs/swagger";
import { TypeDocument } from "@prisma/client";
import { IsEmail, IsEnum, IsString } from "class-validator";

export class CreateUserDto {

  @IsString()
  @ApiProperty({
    example: '123456789',
    description: 'Número de documento del usuario',
  })
  numberDocument: string;

  @IsEnum(TypeDocument)
  @ApiProperty({
    example: TypeDocument.dni,
    description: 'Tipo de documento del usuario',
    enum: TypeDocument,
  })
  typeDocument: TypeDocument;

  @IsString()
  @ApiProperty({
    example: 'Pablo',
    description: 'Nombre del usuario',
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: 'Rios',
    description: 'Apellido del usuario',
  })
  lastName: string;

  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'example@example.com',
    description: 'Correo electrónico del usuario',
  })
  email: string;
}
