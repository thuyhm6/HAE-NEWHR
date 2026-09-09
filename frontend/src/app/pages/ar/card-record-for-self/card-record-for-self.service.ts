import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CardRecordForSelfRow {
  empId?: string;
  localName?: string;
  deptName?: string;
  swipeDate?: string;
  swipeTime?: string;
  doorType?: string;
  dataSourceName?: string;
}

export interface CardRecordForSelfFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
}

export interface ImportFromDeviceResponse {
  success: boolean;
  message?: string;
  total?: number;
  imported?: number;
  skipped?: number;
  notFound?: number;
}

const LIST_URL = '/ar/attendanceMintenance/api/cardRecordForSelf/list';
const EXPORT_URL = '/ar/attendanceMintenance/api/cardRecordForSelf/exportExcel';
const IMPORT_URL = '/ar/attendanceMintenance/api/cardRecordForSelf/importFromDevice';

/**
 * Tra cứu lịch sử ra vào (quẹt thẻ) của chính nhân viên đang đăng nhập, có
 * thể đọc dữ liệu trực tiếp từ máy chủ chấm công - port lại từ
 * ar/attendanceMintenance/viewArCardRecordForSelf.html (đã xoá). Dùng
 * nz-table phân trang phía server (contract draw/start/length kiểu
 * DataTables cũ, giống ManageCountInfoListComponent) vì backend
 * `getCardRecordForSelfList` trả `DataTablesResponse`. Xuất Excel gọi thẳng
 * endpoint backend có sẵn (POI tạo .xlsx thật) thay vì SheetJS client.
 */
@Injectable({ providedIn: 'root' })
export class CardRecordForSelfService {
  private readonly http = inject(HttpClient);

  getPageList(filter: CardRecordForSelfFilter, draw: number, start: number, length: number): Promise<DataTablesResponse<CardRecordForSelfRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<CardRecordForSelfRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  importFromDevice(fromDate: string, toDate: string): Promise<ImportFromDeviceResponse> {
    return firstValueFrom(
      this.http.post<ImportFromDeviceResponse>(IMPORT_URL, null, { params: { fromDate, toDate } }),
    );
  }

  buildExportUrl(filter: CardRecordForSelfFilter): string {
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
