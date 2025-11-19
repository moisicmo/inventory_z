import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductInputDto {
  @IsString()
  @ApiProperty({ example: 'abc', description: 'Identificador del producto' })
  productId: string;

  @IsNumber()
  @ApiProperty({ example: 100, description: 'Cantidad de producto' })
  quantity: number;

  @IsNumber()
  @ApiProperty({ example: 15.5, description: 'Precio del producto' })
  price: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2023-10-01', description: 'Fecha de vencimiento', required: false })
  dueDate?: Date;
}