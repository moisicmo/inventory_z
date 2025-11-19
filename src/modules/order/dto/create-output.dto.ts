import { IsNumber, IsString } from "class-validator";

export class CreateOutputDto {

  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}
