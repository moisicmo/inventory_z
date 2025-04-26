import { ApiProperty } from "@nestjs/swagger";
import { TypeUnit } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";

export class CreateProductDto {

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'Identificador de la categoría a la que pertenece el producto',
  })
  categoryId: number;

  @IsString()
  @ApiProperty({
    example: 'Product 1',
    description: 'Nombre del producto',
  })
  name: string;

  @IsEnum(TypeUnit)
  @ApiProperty({
    example: TypeUnit.CAJA,
    description: 'Unidad de medida del producto',
    enum: TypeUnit,
  })
  typeUnit: TypeUnit;

  @IsNumber()
  @ApiProperty({
    example: 10.5,
    description: 'Precio del producto',
  })
  price: number;

}
