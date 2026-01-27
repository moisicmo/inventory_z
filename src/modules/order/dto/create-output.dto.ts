import { IsNumber, IsString, IsUUID } from "class-validator";

export class CreateOutputDto {

  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}
