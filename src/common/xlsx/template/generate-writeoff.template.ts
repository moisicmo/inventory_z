import * as ExcelJS from 'exceljs';

export interface WriteoffReportRow {
  date: string;
  branch: string;
  reason: string;
  description: string;
  product: string;
  code: string;
  quantity: number;
}

const REASON_FILL: Record<string, string> = {
  Vencimiento: 'FFFCE4D6',
  'Daño': 'FFFFC7CE',
  Robo: 'FFE2BFFF',
  'Pérdida': 'FFFFF2CC',
  Otro: 'FFF2F2F2',
};

export async function buildWriteoffTemplate(rows: WriteoffReportRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Reporte de Bajas');

  // Header row
  const headerRow = ws.addRow([
    'Fecha', 'Sucursal', 'Motivo', 'Descripción',
    'Producto', 'Código', 'Cantidad',
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0392B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Data rows
  rows.forEach((row) => {
    const dataRow = ws.addRow([
      row.date, row.branch, row.reason, row.description,
      row.product, row.code, row.quantity,
    ]);
    const fill = REASON_FILL[row.reason] ?? 'FFF9F9F9';
    dataRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    dataRow.getCell(3).font = { bold: true };
  });

  // Auto-fit columns
  ws.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const value = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, value.length);
    });
    column.width = maxLength + 2;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
