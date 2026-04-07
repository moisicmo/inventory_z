import { Injectable } from '@nestjs/common';
import { buildInventoryTemplate, type InventoryReportRow } from './template/generate-inventory.template';
import { buildSaleTemplate, type SaleReportRow } from './template/generate-sale.template';
import { buildWriteoffTemplate, type WriteoffReportRow } from './template/generate-writeoff.template';

@Injectable()
export class XlsxService {
  constructor() {}

  async generateInventoryReport(rows: InventoryReportRow[]): Promise<Buffer> {
    return buildInventoryTemplate(rows);
  }

  async generateSaleReport(rows: SaleReportRow[]): Promise<Buffer> {
    return buildSaleTemplate(rows);
  }

  async generateWriteoffReport(rows: WriteoffReportRow[]): Promise<Buffer> {
    return buildWriteoffTemplate(rows);
  }
}
