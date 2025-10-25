import { Injectable } from '@nestjs/common';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as fs from 'fs';
import * as path from 'path';
import { OrderType } from '@/modules/order/entities/kardex.entity';
import { buildInvoiceRollTemplate } from './template/generate-invoice-roll.template';

const fontPath = path.join(process.cwd(), 'dist/assets/fonts');


@Injectable()
export class PdfService {

  constructor() {
    (pdfMake as any).vfs = {};
    const poppinsPaths = {
      'Poppins-Regular.ttf': path.join(fontPath, 'Poppins-Regular.ttf'),
      'Poppins-Medium.ttf': path.join(fontPath, 'Poppins-Medium.ttf'),
      'Poppins-Italic.ttf': path.join(fontPath, 'Poppins-Italic.ttf'),
      'Poppins-MediumItalic.ttf': path.join(fontPath, 'Poppins-MediumItalic.ttf'),
      'Poppins-Bold.ttf': path.join(fontPath, 'Poppins-Bold.ttf'),
    };

    for (const [key, filePath] of Object.entries(poppinsPaths)) {
      if (fs.existsSync(filePath)) {
        (pdfMake as any).vfs[key] = fs.readFileSync(filePath).toString('base64');
      }
    }

    (pdfMake as any).fonts = {
      Poppins: {
        normal: 'Poppins-Regular.ttf',
        bold: 'Poppins-Bold.ttf',
        italics: 'Poppins-Italic.ttf',
        bolditalics: 'Poppins-MediumItalic.ttf',
      },
    };
  }


  async generateInvoiceRoll(output: OrderType): Promise<Buffer> {
    const documentDefinition = await buildInvoiceRollTemplate(output);
    return documentDefinition;
  }


}
