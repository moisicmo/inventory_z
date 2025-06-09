import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductPresentationDto } from './create-product-presentation.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductPresentationDto extends PartialType(CreateProductPresentationDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'subio o rebajó el precio', description: 'razon del cambio', required: false })
  changedReason?: string;
}
