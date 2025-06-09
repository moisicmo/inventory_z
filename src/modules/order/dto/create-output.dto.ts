import { IsNumber, IsString } from "class-validator";

export class CreateOutputDto {

  @IsString()
  productPresentationId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}
