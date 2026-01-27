import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString, IsUUID } from "class-validator";
import { CreateOutputDto } from "./create-output.dto";

export class CreateOrderDto {

  @IsUUID()
  @ApiProperty({
    example: 'customer123',
    description: 'Identificador del cliente',
  })
  customerId: string;

  @IsUUID()
  @ApiProperty({
    example: 'branch123',
    description: 'Identificador de la sucursal',
  })
  branchId: string;

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
        productPresentationId: 'presentation123',
        quantity: 1,
        price: 1.00
      }
    ],
    description: 'Lista de output',
  })
  outputs: CreateOutputDto[]
}
