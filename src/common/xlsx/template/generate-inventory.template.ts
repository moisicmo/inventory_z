import * as ExcelJS from 'exceljs';

export interface InventoryReportRow {
  date: string;
  type: string;
  branch: string;
  product: string;
  code: string;
  quantity: number;
  price: number;
  detail: string;
}

const TYPE_FILL: Record<string, string> = {
  Entrada: 'C6EFCE',
  Venta: 'DDEBF7',
  Baja: 'FFCCCC',
  Salida: 'FFF2CC',
};

export async function buildInventoryTemplate(rows: InventoryReportRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Reporte de Inventario');

  // Header row
  const headerRow = ws.addRow(['Fecha', 'Tipo', 'Sucursal', 'Producto', 'Código', 'Cantidad', 'Precio unit.', 'Detalle']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5597' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Data rows
  rows.forEach((row) => {
    const dataRow = ws.addRow([row.date, row.type, row.branch, row.product, row.code, row.quantity, row.price, row.detail]);
    const fill = TYPE_FILL[row.type] ?? 'FFF9F9F9';
    dataRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${fill}` } };
    dataRow.getCell(2).font = { bold: true };
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
