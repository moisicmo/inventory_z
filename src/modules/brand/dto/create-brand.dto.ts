import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateBrandDto {

  @IsString()
  @ApiProperty({
    example: 'Brand 1',
    description: 'Nombre de la marca',
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: 'descript 1',
    description: 'Descripción de la marca',
  })
  description: string;
}
