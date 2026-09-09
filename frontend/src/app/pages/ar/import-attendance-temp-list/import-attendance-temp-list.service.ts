import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ImportAttendanceTempRow {
  lineId?: string;
  applyName?: string;
  empId?: string;
  deptName?: string;
  leaveTypeName?: string;
  leaveFromDate?: string;
  leaveFromTime?: string;
  leaveToDate?: string;
  leaveToTime?: string;
  applyLength?: string;
  leaveReason?: string;
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

const LIST_URL = '/ar/attendanceMintenance/api/leaveApply/importTemp/list';
const SAVE_URL = '/ar/attendanceMintenance/api/leaveApply/importTemp/save';

/**
 * Kết quả import Excel đơn nghỉ phép hàng loạt - mở ra sau khi Import Excel
 * thành công từ ApplyAttBatchComponent (`/ar/attendanceMintenance/api/leaveApply/importTemp/*`).
 * Port lại từ ar/attendanceMintenance/viewImportAttendanceTempList.html (đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class ImportAttendanceTempListService {
  private readonly http = inject(HttpClient);

  getList(errorOnly?: string): Promise<ImportAttendanceTempRow[]> {
    const params: Record<string, string> = {};
    if (errorOnly) params['errorOnly'] = errorOnly;
    return firstValueFrom(this.http.get<ImportAttendanceTempRow[]>(LIST_URL, { params }));
  }

  save(): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, {}));
  }
}
