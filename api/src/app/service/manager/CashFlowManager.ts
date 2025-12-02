import { inject, injectable } from '../../boot';
import { Document } from '../../db/entity/Document';
import { DocumentType } from '../../models/enums/DocumentType';
import { CFDataRow, CFExtractedData } from '../../types';
import { DocumentDataService } from '../entity/DocumentDataService';
import { PayrollLineItems } from '../../constant/PayrollLineItems';

@injectable()
export class CashFlowManager {
  constructor(
    @inject(DocumentDataService) private readonly documentDataService: DocumentDataService,
  ) {
  }

  async reverseRowSigns(document: Document) {
    if (document.documentType === DocumentType.CF) {
      const documentData = await document.documentData;
      (documentData.editedData as CFExtractedData).rows.forEach((row: CFDataRow) => {
        this.reverseRowSign(row);
      });
      await this.documentDataService.save(documentData, null);
    }
  }

  private reverseRowSign(row: CFDataRow) {
    if (row.head === 'Income' && row.category === 'Non - Revenue Units') {
      this.reverseIncomeNRURow(row);
    } else if (row.head === 'Expense') {
      if (row.category === 'Reimbursements') {
        const needToReverse = Reflect.ownKeys(row)
          .filter((colKey: string) => colKey.startsWith('col'))
          .some((colKey: string) => parseFloat(row[colKey]) < 0);
        if (needToReverse) {
          this.reverseReimbursementsRow(row);
        }
      } else {
        const lowerLineItem = row.lineItem.toLowerCase();
        if (['baddebt', 'baddebts', 'bad debt', 'bad debts'].includes(lowerLineItem)) {
          this.reverseBadDebtRow(row);
        }
      }
    }
  }

  private reverseBadDebtRow(row: CFDataRow) {
    row.head = 'Income';
    row.category = 'Collection Loss';
    this.reverseColumnSigns(row);
  }

  private reverseColumnSigns(row: CFDataRow) {
    Reflect.ownKeys(row)
      .filter((colKey: string) => colKey.startsWith('col'))
      .forEach((colKey: string) => {
        row[colKey] = parseFloat(row[colKey]) * -1;
      });
  }

  private reverseReimbursementsRow(row: CFDataRow) {
    row.head = 'Income';
    row.category = 'Expense Reimbursements';
    this.reverseColumnSigns(row);
  }

  private reverseIncomeNRURow(row: CFDataRow) {
    row.head = 'Expense';
    if (PayrollLineItems.has(row.lineItem)) {
      row.category = 'Payroll';
    } else {
      row.category = 'General & Administrative';
    }
    this.reverseColumnSigns(row);
  }
}
