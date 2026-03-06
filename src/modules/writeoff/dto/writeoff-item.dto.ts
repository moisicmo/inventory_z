import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class WriteoffItemDto {
  @IsUUID()
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @IsInt()
  @Min(1)
  @ApiProperty({ description: 'Quantity to write off' })
  quantity: number;
}
