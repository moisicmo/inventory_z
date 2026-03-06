import * as ExcelJS from 'exceljs';

export interface SaleReportRow {
  date: string;
  orderId: string;
  customer: string;
  branch: string;
  product: string;
  code: string;
  quantity: number;
  price: number;
  subtotal: number;
  orderTotal: number;
}

export async function buildSaleTemplate(rows: SaleReportRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Reporte de Ventas');

  // Header row
  const headerRow = ws.addRow([
    'Fecha', 'Recibo', 'Cliente', 'Sucursal',
    'Producto', 'Código', 'Cantidad', 'Precio unit.', 'Subtotal', 'Total pedido',
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F7A4D' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Data rows
  rows.forEach((row) => {
    ws.addRow([
      row.date, row.orderId, row.customer, row.branch,
      row.product, row.code, row.quantity, row.price, row.subtotal, row.orderTotal,
    ]);
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
