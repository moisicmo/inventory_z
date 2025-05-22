import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePresentationDto } from './create-presentation.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePresentationDto extends PartialType(CreatePresentationDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'subio o rebajó el precio', description: 'razon del cambio', required: false })
  changedReason?: string;
}
