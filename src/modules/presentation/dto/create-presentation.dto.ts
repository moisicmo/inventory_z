import { ApiProperty } from "@nestjs/swagger";
import { TypeUnit } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePresentationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'product-123',
    description: 'Identificador del producto',
  })
  productId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'branch-123',
    description: 'identificador de la sucursal',
  })
  branchId: string;

  @IsNotEmpty()
  @IsEnum(TypeUnit)
  @ApiProperty({
    example: TypeUnit.CAJA,
    description: 'Tipo de unidad',
  })
  typeUnit: TypeUnit;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 10.2,
    description: 'Precio de la presentación',
  })
  price: number;
}
