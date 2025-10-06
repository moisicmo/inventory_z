import { CreateOutputDto } from "@/modules/order/dto/create-output.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateTransferDto {
  @IsString()
  @ApiProperty({
    example: 'branch123',
    description: 'Identificador de la sucursal',
  })
  fromBranchId: string;

  @IsString()
  @ApiProperty({
    example: 'branch123',
    description: 'Identificador de la sucursal',
  })
  toBranchId: string;

  @IsString()
  @ApiProperty({
    example: 'Transferencia de productos',
    description: 'Descripción de la transferencia',
  })
  detail: string

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
