import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsOptional } from "class-validator";

export class CreateInputDto {
  
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'Identificador de la sucursal',
  })
  branchId:number;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'Identificador del producto',
  })
  productId: number;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'cantidad de producto',
  })
  quantity: number;

  @IsNumber()
  @ApiProperty({
    example: 1.00,
    description: 'precio de producto',
  })
  price: number;

  @IsDate()
  @IsOptional()
  @ApiProperty({
    example: '2023-10-01',
    description: 'fecha de vencimiento',
  })
  dueDate: Date;
    
}
