import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateOutputDto {

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'Identificador del producto',
  })
  productId: number

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'Cantidad del producto',
  })
  quantity: number

  @IsNumber()
  @ApiProperty({
    example: 1.00,
    description: 'Precio del producto de salida',
  })
  price: number
}
