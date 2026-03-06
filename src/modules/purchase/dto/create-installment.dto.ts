import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInstallmentDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 1, description: 'Número de cuota' })
  installmentNumber: number;

  @IsNumber()
  @ApiProperty({ example: 500.0, description: 'Monto de la cuota' })
  amount: number;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-03-01', description: 'Fecha de vencimiento de la cuota' })
  dueDate: Date;
}
