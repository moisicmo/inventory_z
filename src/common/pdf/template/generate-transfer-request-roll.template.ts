import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { PdfUtils } from '../pdf-utils';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

const fontPath = path.join(process.cwd(), 'dist/assets');

const STATUS_LABELS: Record<string, string> = {
  SOLICITADO: 'Solicitado',
  DESPACHADO: 'Despachado',
  RECIBIDO: 'Recibido',
  RECHAZADO: 'Rechazado',
  OBSERVADO: 'Observado',
};

interface TransferRequestPdfData {
  status: string;
  note: string | null;
  rejectionNote: string | null;
  observationNote: string | null;
  createdAt: Date;
  dispatchedAt: Date | null;
  receivedAt: Date | null;
  fromBranch: { name: string };
  toBranch: { name: string };
  createdByName: string;
  dispatchedByName: string | null;
  receivedByName: string | null;
  items: {
    quantityRequested: number;
    quantityDispatched: number | null;
    typeUnit: string;
    price: number;
    product: { name: string; code: string | null };
  }[];
}

export function buildTransferRequestRollTemplate(data: TransferRequestPdfData): TDocumentDefinitions {
  const utils = new PdfUtils();
  const logoPath = path.join(fontPath, 'logo.png');

  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString('base64')
    : null;

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
    { text: 'SOLICITUD DE TRASPASO', style: 'header' },
    utils.createLine(),
    utils.createTable(
      [
        ['Estado :', STATUS_LABELS[data.status] ?? data.status, true],
        ['Origen :', data.fromBranch.name, true],
        ['Destino :', data.toBranch.name, true],
        [
          'Fecha solicitud :',
          format(new Date(data.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }),
          true,
        ],
        ['Solicitado por :', data.createdByName, true],
        ...(data.dispatchedAt
          ? [
            [
              'Fecha despacho :',
              format(new Date(data.dispatchedAt), 'dd/MM/yyyy HH:mm', { locale: es }),
              true,
            ] as [string, string, boolean],
            ['Despachado por :', data.dispatchedByName ?? '—', true] as [string, string, boolean],
          ]
          : []),
        ...(data.receivedAt
          ? [
            [
              'Fecha recepción :',
              format(new Date(data.receivedAt), 'dd/MM/yyyy HH:mm', { locale: es }),
              true,
            ] as [string, string, boolean],
            ['Recibido por :', data.receivedByName ?? '—', true] as [string, string, boolean],
          ]
          : []),
      ],
      'right',
      'left',
    ),
    ...(data.note
      ? [
        utils.createLine(),
        { text: 'NOTA', style: 'header' },
        { text: data.note, alignment: 'center' as const },
      ]
      : []),
    ...(data.rejectionNote
      ? [
        utils.createLine(),
        { text: 'MOTIVO DE RECHAZO', style: 'header' },
        { text: data.rejectionNote, alignment: 'center' as const },
      ]
      : []),
    ...(data.observationNote
      ? [
        utils.createLine(),
        { text: 'OBSERVACIÓN', style: 'header' },
        { text: data.observationNote, alignment: 'center' as const },
      ]
      : []),
    utils.createLine(),
    { text: 'DETALLE DE PRODUCTOS', style: 'header' },
    utils.createTable(
      data.items.map(
        (item): [string, string, boolean] => {
          const unit = item.typeUnit === 'CAJA' ? 'caja(s)' : 'ud(s)';
          const dispatched = item.quantityDispatched != null
            ? ` → Desp: ${item.quantityDispatched}`
            : '';
          return [
            `${item.product.name}`,
            `Sol: ${item.quantityRequested} ${unit}${dispatched}`,
            false,
          ];
        },
      ),
      'left',
      'right',
      'auto',
    ),
    utils.createLine(),
    utils.createTable(
      [
        [
          'Total solicitado :',
          `${data.items.reduce((s, i) => s + i.quantityRequested, 0)} uds`,
          false,
        ],
        ...(data.items.some((i) => i.quantityDispatched != null)
          ? [
            [
              'Total despachado :',
              `${data.items.reduce((s, i) => s + (i.quantityDispatched ?? 0), 0)} uds`,
              false,
            ] as [string, string, boolean],
          ]
          : []),
      ],
      'right',
      'right',
      'auto',
    ),
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
    },
  };
}
