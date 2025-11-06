import { ApiProperty } from '@nestjs/swagger';

export class ProviderResponseDto {
  @ApiProperty({ description: 'La identificación única del proveedor' })
  id: string;

  @ApiProperty({ description: 'El nombre del proveedor' })
  name: string;
}
