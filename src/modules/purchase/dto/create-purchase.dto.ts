import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '@/generated/prisma/enums';
import { PurchaseItemDto } from './purchase-item.dto';
import { CreateInstallmentDto } from './create-installment.dto';

export class CreatePurchaseDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid', description: 'Identificador de la sucursal' })
  branchId: string;

  @IsUUID()
  @ApiProperty({ example: 'uuid', description: 'Identificador del proveedor' })
  providerId: string;

  @IsString()
  @ApiProperty({ example: 'COMP-001', description: 'Código de la compra' })
  code: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-02-26', description: 'Fecha de descarga' })
  dischargeDate: Date;

  @IsEnum(PaymentType)
  @ApiProperty({ enum: PaymentType, description: 'Tipo de pago: CONTADO o CUOTAS' })
  paymentType: PaymentType;

  @IsNumber()
  @ApiProperty({ example: 1500.0, description: 'Monto total de la compra' })
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  @ApiProperty({ type: [PurchaseItemDto], description: 'Productos de la compra' })
  items: PurchaseItemDto[];

  @IsOptional()
  @ValidateIf((o) => o.paymentType === PaymentType.CUOTAS)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentDto)
  @ApiProperty({ type: [CreateInstallmentDto], description: 'Cuotas (requerido si paymentType = CUOTAS)', required: false })
  installments?: CreateInstallmentDto[];
}
