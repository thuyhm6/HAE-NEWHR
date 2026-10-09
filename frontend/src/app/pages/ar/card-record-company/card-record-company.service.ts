import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DataTablesResponse, ImportFromDeviceResponse } from '../card-record-for-self/card-record-for-self.service';

export interface CardRecordCompanyRow {
  recordNo?: number;
  cardNo?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  rDate?: string;
  rTime?: string;
  doorType?: string;
}

export interface CardRecordCompanyFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
}

const LIST_URL = '/ar/attendanceMintenance/api/arCardRecordCompany/list';
const EXPORT_URL = '/ar/attendanceMintenance/api/arCardRecordCompany/exportExcel';
const IMPORT_URL = '/ar/attendanceMintenance/api/arCardRecordCompany/importFromDevice';

/**
 * Dữ liệu quẹt thẻ ra/vào cổng công ty (AR_MAC_RECORDS_COMPANY) - port từ
 * viewArCardRecordCompany.jsp của dự án cũ. Dùng chung type
 * DataTablesResponse/ImportFromDeviceResponse với CardRecordForSelfService.
 */
@Injectable({ providedIn: 'root' })
export class CardRecordCompanyService {
  private readonly http = inject(HttpClient);

  getPageList(filter: CardRecordCompanyFilter, draw: number, start: number, length: number): Promise<DataTablesResponse<CardRecordCompanyRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<CardRecordCompanyRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  importFromDevice(fromDate: string, toDate: string): Promise<ImportFromDeviceResponse> {
    return firstValueFrom(this.http.post<ImportFromDeviceResponse>(IMPORT_URL, null, { params: { fromDate, toDate } }));
  }

  buildExportUrl(filter: CardRecordCompanyFilter): string {
    const params = new URLSearchParams(this.toHttpParams({ ...filter }));
    return `${EXPORT_URL}?${params.toString()}`;
  }

  private toHttpParams(filter: Record<string, string | undefined>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.keys(filter).forEach((key) => {
      const value = filter[key];
      if (value !== undefined && value !== null) {
        params[key] = value;
      }
    });
    return params;
  }
}
