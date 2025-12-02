import { Service } from '../../../bootstrap/service/Service';

// Array-of-array data - a 2D array of data
export type AOAData = (string | number)[][];

export class XLSXService extends Service {
  xlsxPromise = import('xlsx');

  async downloadXLSXFile(aoaData: AOAData, sheetName: string, fileName: string) {
    const XLSX = await this.xlsxPromise;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFileXLSX(workbook, fileName);
  }
}

export const useXLSXService: () => XLSXService = () => XLSXService.useService();
