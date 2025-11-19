// src/common/pipes/parse-form-data-first.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFormDataFirstPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Transformar ANTES de que llegue a la validación
    const transformed = this.transformData(value);
    return transformed;
  }

  private transformData(value: any): any {
    const result = { ...value };

    // Parsear prices si viene como string JSON
    if (value.prices && typeof value.prices === 'string') {
      try {
        result.prices = JSON.parse(value.prices);
        console.log('✅ Prices transformado:', result.prices);
      } catch (error) {
        console.error('❌ Error parseando prices:', error);
        throw new BadRequestException('Invalid JSON in prices field');
      }
    }

    return result;
  }
}