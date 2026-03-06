import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { PdfUtils } from '../pdf-utils';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { PurchaseFullType } from '@/modules/purchase/entities/purchase.entity';
import { PaymentType } from '@/generated/prisma/enums';

const fontPath = path.join(process.cwd(), 'dist/assets');

export function buildPurchaseRollTemplate(purchase: PurchaseFullType): TDocumentDefinitions {
  const utils = new PdfUtils();
  const logoPath = path.join(fontPath, 'logo.png');

  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString('base64')
    : null;

  const esCuotas = purchase.paymentType === PaymentType.CUOTAS;

  const content: TDocumentDefinitions['content'] = [
    ...(logoBase64
      ? [
        {
          image: `data:image/png;base64,${logoBase64}`,
          width: 50,
          margin: [0, 0, 0, 5] as [number, number, number, number],
          alignment: 'center' as const,
        },
      ]
      : []),
    { text: 'IMPORTADORA JHOMIR', style: 'header' },
    { text: purchase.branch.name.toUpperCase(), style: 'subheader' },
    utils.createLine(),
    { text: 'COMPROBANTE DE COMPRA', style: 'header' },
    utils.createTable(
      [
        ['Código :', purchase.code, true],
        ['Proveedor :', purchase.provider.name, true],
        ['NIT :', purchase.provider.nit, true],
        [
          'Fecha descarga :',
          format(new Date(purchase.dischargeDate), 'dd/MM/yyyy', { locale: es }),
          true,
        ],
        [
          'Fecha registro :',
          format(new Date(purchase.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }),
          true,
        ],
        ['Tipo de pago :', esCuotas ? 'A cuotas' : 'Al contado', true],
      ],
      'right',
      'left',
    ),
    utils.createLine(),
    { text: 'DETALLE', style: 'header' },
    utils.createTable(
      purchase.inputs.map(
        (input): [string, string, boolean] => [
          `${input.product.name} (${input.quantity} ${input.typeUnit})`,
          `Bs. ${(input.price * input.quantity).toFixed(2)}`,
          false,
        ],
      ),
      'left',
      'right',
      'auto',
    ),
    utils.createLine(),
    utils.createTable(
      [['TOTAL Bs :', purchase.totalAmount.toFixed(2), false]],
      'right',
      'right',
      'auto',
    ),
    ...(esCuotas && purchase.installments.length > 0
      ? [
        utils.createLine(),
        { text: 'PLAN DE CUOTAS', style: 'header' },
        utils.createTable(
          purchase.installments.map(
            (inst): [string, string, boolean] => [
              `Cuota ${inst.installmentNumber}  ${format(new Date(inst.dueDate), 'dd/MM/yyyy', { locale: es })}`,
              `Bs. ${inst.amount.toFixed(2)}`,
              false,
            ],
          ),
          'left',
          'right',
          'auto',
        ),
      ]
      : []),
  ];

  return {
    pageMargins: [15, 25, 15, 15],
    content,
    defaultStyle: {
      font: 'Poppins',
      fontSize: 5,
      lineHeight: 1.2,
    },
    pageSize: {
      width: 164,
      height: 'auto',
    },
    styles: {
      header: { bold: true, alignment: 'center' },
      subheader: { alignment: 'center' },
      content: { alignment: 'justify' },
    },
  };
}
