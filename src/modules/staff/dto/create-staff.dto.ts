import { CreateUserDto } from "@/common/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID, ValidateNested } from "class-validator";

export class CreateStaffDto extends CreateUserDto {
  @IsUUID()
  @ApiProperty({
    example: 'rol123',
    description: 'Identificador del rol del cliente',
  })
  roleId: string;
  
  @IsArray()
  @ApiProperty({
      example: ['suc123','suc321'],
      description: 'Lista de Identificadores de sucursales',
  })
  branchIds: string[];
}

