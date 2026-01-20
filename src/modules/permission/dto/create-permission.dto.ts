import { TypeSubject } from "@/common/subjects";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TypeAction } from '@/generated/prisma/enums';
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export class CreatePermissionDto {

  @IsEnum(TypeAction)
  @ApiProperty({
    enum: TypeAction,
    description: 'Acción que representa el permiso',
    example: TypeAction.create,
  })
  action: TypeAction;

  @IsEnum(TypeSubject)
  @ApiProperty({
    enum: TypeSubject,
    description: 'Entidad o recurso al que aplica el permiso',
    example: TypeSubject.product,
  })
  subject: TypeSubject;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Define si el permiso está activo o no',
    default: true,
  })
  active?: boolean;
}
