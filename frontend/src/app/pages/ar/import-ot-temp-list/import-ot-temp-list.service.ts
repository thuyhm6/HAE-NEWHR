import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ImportOtTempRow {
  lineId?: string;
  applyName?: string;
  empId?: string;
  deptName?: string;
  applyOtDate?: string;
  otFromDate?: string;
  otFromTime?: string;
  otToDate?: string;
  otToTime?: string;
  otTypeName?: string;
  otApplyHour?: string;
  otTotalMonth?: string;
  otLimit?: string;
  deductYn?: string;
  specialYn?: string;
  applyOtRemark?: string;
  affirmFlagName?: string;
  uploadErrorMsg?: string;
  uploadBy?: string;
  uploadDate?: string;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceMintenance/api/overtime/importTemp/list';
const SAVE_URL = '/ar/attendanceMintenance/api/overtime/importTemp/save';

/**
 * Kết quả import Excel đơn tăng ca hàng loạt - mở ra sau khi Import Excel
 * thành công từ ApplyOtBatchComponent (`/ar/attendanceMintenance/api/overtime/importTemp/*`).
 * Port lại từ ar/attendanceMintenance/viewImportOtTempList.html (đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class ImportOtTempListService {
  private readonly http = inject(HttpClient);

  getList(errorOnly?: string): Promise<ImportOtTempRow[]> {
    const params: Record<string, string> = {};
    if (errorOnly) params['errorOnly'] = errorOnly;
    return firstValueFrom(this.http.get<ImportOtTempRow[]>(LIST_URL, { params }));
  }

  save(): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, {}));
  }
}
