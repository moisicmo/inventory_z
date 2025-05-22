import { CreateUserDto } from "@/common/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateStaffDto extends CreateUserDto {
  @IsString()
  @ApiProperty({
    example: 1,
    description: 'ID del rol del cliente',
  })
  roleId: string;
}
