import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCategoryDto {

  @IsString()
  @ApiProperty({
    example: 'Category 1',
    description: 'Nombre de la categoría',
  })
  name: string;
}
