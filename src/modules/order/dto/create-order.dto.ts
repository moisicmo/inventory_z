import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";
import { CreateOutputDto } from "./create-output.dto";

export class CreateOrderDto {

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del punto de venta',
  })
  pointSaleId: number

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del cliente',
  })
  customerId: number

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'Monto total de la orden',
  })
  amount: number

  @IsArray()
  @ApiProperty({
    example: [
      {
        productId: 1,
        quantity: 1,
        price: 1.00
      }
    ],
    description: 'Lista de output',
  })
  outputs: CreateOutputDto[]
}
