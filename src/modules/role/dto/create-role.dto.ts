import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsArray()
  @ApiProperty({
    example: [
      { id: 'perm-1', conditions: null },
      { id: 'perm-2', conditions: { sucursalId: '3' } },
    ],
  })
  permissions: { id: string; conditions?: any }[];
}
