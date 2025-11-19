import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFormDataPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const result = { ...value };

      // Parsear prices si viene como string JSON
      if (value.prices && typeof value.prices === 'string') {
        result.prices = JSON.parse(value.prices);
      }

      return result;
    } catch (error) {
      throw new BadRequestException('Error parsing prices array: ' + error.message);
    }
  }
}