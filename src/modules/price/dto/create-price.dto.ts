import { ApiProperty } from "@nestjs/swagger";
import { TypeUnit } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";


export class BasePriceDto {
  @IsString()
  @ApiProperty({ example: 'abc', description: 'ID de la sucursal' })
  branchId: string;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 10.5 })
  price: number;

  @IsEnum(TypeUnit)
  @ApiProperty({ example: TypeUnit.UNIDAD, enum: TypeUnit })
  typeUnit: TypeUnit;
}

export class CreatePriceDto extends BasePriceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'presentation-123',
    description: 'Identificador de la presentación',
  })
  productId: string;
}
