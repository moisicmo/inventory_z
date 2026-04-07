import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RejectTransferRequestDto {
  @IsString()
  @ApiProperty({ example: 'No hay stock disponible' })
  rejectionNote: string;
}
