import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: 'La identificación única de la categoría' })
  id: string;

  @ApiProperty({ description: 'El nombre de la categoría' })
  name: string;
}
