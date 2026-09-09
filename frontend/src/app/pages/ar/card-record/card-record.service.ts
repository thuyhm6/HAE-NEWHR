import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DataTablesResponse, ImportFromDeviceResponse } from '../card-record-for-self/card-record-for-self.service';

export interface CardRecordRow {
  recordNo?: number;
  insertBy?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  shiftName?: string;
  arDateStr?: string;
  swipeTime?: string;
  doorType?: string;
  dataSourceName?: string;
}

export interface CardRecordFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  shiftNo?: string;
}

export interface CardRecordDetail {
  recordNo?: number;
  personId?: string;
  empId?: string;
  localName?: string;
  arDateStr?: string;
  swipeDatetime?: string;
  doorType?: string;
  remark?: string;
}

export interface CardRecordSavePayload {
  recordNo: number | null;
  personId: string;
  cardNo: string | null;
  arDateStr: string;
  doorType: string | null;
  remark: string | null;
  swipeDatetime: string;
}

export interface CardRecordDetailResponse {
  success: boolean;
  message?: string;
  data?: CardRecordDetail;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
}

export interface UploadExcelResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

const LIST_URL = '/ar/attendanceMintenance/api/cardRecord/list';
const DETAIL_URL = '/ar/attendanceMintenance/api/cardRecord/detail';
const INSERT_URL = '/ar/attendanceMintenance/api/cardRecord/insert';
const UPDATE_URL = '/ar/attendanceMintenance/api/cardRecord/update';
const DELETE_URL = '/ar/attendanceMintenance/api/cardRecord/delete';
const IMPORT_FROM_DEVICE_URL = '/ar/attendanceMintenance/api/cardRecord/importFromDevice';
const UPLOAD_EXCEL_URL = '/ar/attendanceMintenance/api/macRecordTemp/uploadExcel';
export const DOWNLOAD_TEMPLATE_URL = '/sy/excel/api/downloadTemplate?templateName=Card_Template';

/**
 * CRUD đầy đủ bản ghi quẹt thẻ (thêm/sửa/xóa từng dòng + xóa hàng loạt, đọc
 * dữ liệu quẹt thẻ trực tiếp từ máy chủ, import Excel) - port lại từ
 * ar/attendanceMintenance/viewArCardRecord.html (đã xoá). Dữ liệu tự động từ
 * máy quẹt thẻ/import (insertBy = 'M'/'A') không cho sửa/xóa, khớp đúng logic
 * `canDelete`/checkbox ẩn ở bản gốc. `DataTablesResponse`/`ImportFromDeviceResponse`
 * tái sử dụng từ CardRecordForSelfService.
 *
 * Ghi chú quan trọng: backend (`ArAttendanceSearchController`) có guard
 * `isEssMode(session)` chặn sửa/xóa/import khi `session.sysMode == 'ess'`,
 * nhưng `sysMode` KHÔNG BAO GIỜ được set ở bất kỳ đâu trong codebase (đã grep
 * xác nhận) nên trong thực tế guard này luôn cho phép. Component này vì vậy
 * KHÔNG replicate điều kiện ẩn/hiện nút theo sysMode của bản gốc Thymeleaf
 * (`th:if="${sysMode == 'hrm'}"`) - luôn hiển thị đầy đủ nút CRUD, đúng hành
 * vi thực tế hiện tại của ứng dụng.
 */
@Injectable({ providedIn: 'root' })
export class CardRecordService {
  private readonly http = inject(HttpClient);

  getPageList(filter: CardRecordFilter, draw: number, start: number, length: number): Promise<DataTablesResponse<CardRecordRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<CardRecordRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  getDetail(recordNo: number): Promise<CardRecordDetailResponse> {
    return firstValueFrom(this.http.get<CardRecordDetailResponse>(DETAIL_URL, { params: { recordNo: String(recordNo) } }));
  }

  insert(payload: CardRecordSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(INSERT_URL, payload));
  }

  update(payload: CardRecordSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(UPDATE_URL, payload));
  }

  delete(recordNo: number): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(DELETE_URL, { recordNo }));
  }

  importFromDevice(fromDate: string, toDate: string): Promise<ImportFromDeviceResponse> {
    return firstValueFrom(
      this.http.post<ImportFromDeviceResponse>(IMPORT_FROM_DEVICE_URL, null, { params: { fromDate, toDate } }),
    );
  }

  uploadExcel(file: File): Promise<UploadExcelResponse> {
    const form = new FormData();
    form.append('file', file);
    return firstValueFrom(this.http.post<UploadExcelResponse>(UPLOAD_EXCEL_URL, form));
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
