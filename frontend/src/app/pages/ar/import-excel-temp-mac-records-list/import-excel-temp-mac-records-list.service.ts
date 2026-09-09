import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface MacRecordTempRow {
  lineId?: number;
  empId?: string;
  localName?: string;
  arDateStr?: string;
  rDate?: string;
  rTime?: string;
  doorType?: string;
  remark?: string;
  uploadErrorMsg?: string;
}

export interface MacRecordTempConfirmResponse {
  success: boolean;
  message?: string;
  total?: number;
  inserted?: number;
  skippedDup?: number;
  skippedNoEmp?: number;
}

const LIST_URL = '/ar/attendanceMintenance/api/macRecordTemp/list';
const CONFIRM_URL = '/ar/attendanceMintenance/api/macRecordTemp/confirm';

/**
 * Xem/xác nhận kết quả import Excel dữ liệu quẹt thẻ - port lại từ
 * ar/attendanceMintenance/viewImportExcelTempMacRecordsList.html (đã xoá).
 * Trang này luôn mở bằng window.open(...,'_blank') từ CardRecordComponent
 * sau khi import Excel thành công; sau khi xác nhận thành công thì đóng tab
 * (window.close()) và quay lại trang danh sách.
 */
@Injectable({ providedIn: 'root' })
export class ImportExcelTempMacRecordsListService {
  private readonly http = inject(HttpClient);

  getList(errorOnly?: string): Promise<MacRecordTempRow[]> {
    const params: Record<string, string> = {};
    if (errorOnly) params['errorOnly'] = errorOnly;
    return firstValueFrom(this.http.get<MacRecordTempRow[]>(LIST_URL, { params }));
  }

  confirm(): Promise<MacRecordTempConfirmResponse> {
    return firstValueFrom(this.http.post<MacRecordTempConfirmResponse>(CONFIRM_URL, null));
  }
}
