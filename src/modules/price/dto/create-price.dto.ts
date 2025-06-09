import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePriceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'presentation-123',
    description: 'Identificador de la presentación',
  })
  productPresentationId: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 10.2,
    description: 'Precio de la presentación',
  })
  price: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'reason-123',
    description: 'motivo de cambio',
    required: false,
  })
  changedReason?: string;
}