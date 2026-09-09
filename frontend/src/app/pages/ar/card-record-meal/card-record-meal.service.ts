import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DataTablesResponse, ImportFromDeviceResponse } from '../card-record-for-self/card-record-for-self.service';

export interface CardRecordMealRow {
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  attendanceDate?: string;
  rDate?: string;
  rTime?: string;
  eatName?: string;
  eatDate?: string;
  amount?: number;
  outdoorTime?: string;
  remark?: string;
}

export interface CardRecordMealFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  eatDate?: string;
}

const LIST_URL = '/ar/attendanceMintenance/api/macRecordEat/list';
const EXPORT_URL = '/ar/attendanceMintenance/api/macRecordEat/exportExcel';
const IMPORT_URL = '/ar/attendanceMintenance/api/macRecordEat/importFromDevice';

/**
 * Tra cứu dữ liệu quẹt thẻ suất ăn, đọc trực tiếp từ máy chủ - port lại từ
 * ar/attendanceMintenance/viewArCardRecordMeal.html (đã xoá). Cùng pattern
 * phân trang server-side + import modal như CardRecordForSelfComponent
 * (dùng chung type DataTablesResponse/ImportFromDeviceResponse).
 */
@Injectable({ providedIn: 'root' })
export class CardRecordMealService {
  private readonly http = inject(HttpClient);

  getPageList(filter: CardRecordMealFilter, draw: number, start: number, length: number): Promise<DataTablesResponse<CardRecordMealRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<CardRecordMealRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  importFromDevice(fromDate: string, toDate: string): Promise<ImportFromDeviceResponse> {
    return firstValueFrom(this.http.post<ImportFromDeviceResponse>(IMPORT_URL, null, { params: { fromDate, toDate } }));
  }

  buildExportUrl(filter: CardRecordMealFilter): string {
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
