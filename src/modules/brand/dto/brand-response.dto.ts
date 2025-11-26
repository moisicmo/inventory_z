import { ApiProperty } from '@nestjs/swagger';

export class BrandResponseDto {
  @ApiProperty({ description: 'La identificación única de la marca' })
  id: string;

  @ApiProperty({ description: 'El nombre de la marca' })
  name: string;
}
