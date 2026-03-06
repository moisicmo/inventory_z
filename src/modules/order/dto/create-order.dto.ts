import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsUUID, Min } from "class-validator";
import { CreateOutputDto } from "./create-output.dto";
import { PaymentType } from "@/generated/prisma/enums";

export class CreateOrderDto {

  @IsUUID()
  customerId: string;

  @IsUUID()
  branchId: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amountPaid?: number;

  @IsArray()
  outputs: CreateOutputDto[];
}
