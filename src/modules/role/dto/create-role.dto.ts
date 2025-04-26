import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class CreateRoleDto {

  @IsString()
  @ApiProperty({
    example: 'Admin',
    description: 'Nombre del rol',
  })
  name: string;
  
  @IsArray()
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Lista de permisos del rol',
  })
  permissionIds: number[];
}
