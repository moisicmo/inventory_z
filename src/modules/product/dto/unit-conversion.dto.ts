import { TypeUnit } from "@/generated/prisma/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber } from "class-validator";

export class UnitConversionDto {
  @IsEnum(TypeUnit)
  @ApiProperty({ example: TypeUnit.UNIDAD, enum: TypeUnit })
  fromUnit: TypeUnit;

  @IsEnum(TypeUnit)
  @ApiProperty({ example: TypeUnit.CAJA, enum: TypeUnit })
  toUnit: TypeUnit;

  @IsNumber()
  @ApiProperty({ example: 12 })
  factor: number;
}