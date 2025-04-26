import { ApiProperty } from "@nestjs/swagger";
import { TypeDocument } from "@prisma/client";
import { IsEmail, IsEnum, IsNumber, IsString } from "class-validator";

export class CreateStaffDto {

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

    @IsNumber()
    @ApiProperty({
      example: 1,
      description: 'ID del rol del cliente',
    })
    roleId: number;
    
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

    @IsString()
    @IsEmail()
    @ApiProperty({
      example: 'example@example.com',
      description: 'Correo del cliente',
    })
    email: string;
}
