import { Injectable } from '@nestjs/common';
import * as path from 'path';

import PdfPrinter from 'pdfmake'; // ✅ solución limpia y estable
import { buildInvoiceRollTemplate } from './template/generate-invoice-roll.template';
import { buildPurchaseRollTemplate } from './template/generate-purchase-roll.template';
import { OrderType } from '@/modules/order/entities/order.entity';
import { PurchaseFullType } from '@/modules/purchase/entities/purchase.entity';

const fontPath = path.join(process.cwd(), 'dist/assets/fonts');

@Injectable()
export class PdfService {
  private printer: any;

  constructor() {
    const fonts = {
      Poppins: {
        normal: path.join(fontPath, 'Poppins-Regular.ttf'),
        bold: path.join(fontPath, 'Poppins-Bold.ttf'),
        italics: path.join(fontPath, 'Poppins-Italic.ttf'),
        bolditalics: path.join(fontPath, 'Poppins-MediumItalic.ttf'),
      },
    };

    this.printer = new PdfPrinter(fonts); // ✅ ahora sí
  }

  async generateInvoiceRoll(output: OrderType): Promise<Buffer> {
    const docDefinition = buildInvoiceRollTemplate(output);

    return new Promise((resolve, reject) => {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);

      pdfDoc.end();
    });
  }

  async generatePurchaseRoll(purchase: PurchaseFullType): Promise<Buffer> {
    const docDefinition = buildPurchaseRollTemplate(purchase);

    return new Promise((resolve, reject) => {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);

      pdfDoc.end();
    });
  }
}
