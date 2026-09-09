import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EmpShiftRow {
  pkNo?: number;
  personId?: string;
  empId?: string;
  localName?: string;
  shiftNo?: string;
  shiftName?: string;
  arDateStr?: string;
  typeid?: number;
  typeName?: string;
  remark?: string;
}

export interface EmpShiftSavePayload {
  pkNo: number | null;
  personId: string;
  arDateStr: string;
  shiftNo: string;
  typeid: number | null;
  remark: string;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceMintenance/api/scheduleHae/list';
const DETAIL_URL = '/ar/attendanceMintenance/api/scheduleHae';
const SAVE_URL = '/ar/attendanceMintenance/api/scheduleHae/save';
const DELETE_URL = '/ar/attendanceMintenance/api/scheduleHae/delete';
const IMPORT_URL = '/sy/excel/api/importTemplate';
export const IMPORT_TEMPLATE_NAME = 'AR_SCHEDULE_HAE_Template';
export const DOWNLOAD_TEMPLATE_URL = `/sy/excel/api/downloadTemplate?templateName=${IMPORT_TEMPLATE_NAME}`;

/**
 * CRUD xếp ca làm việc cho nhân viên theo tháng - port lại từ
 * ar/attendanceMintenance/addEmpShiftView.html (đã xoá). Backend
 * `getList` trả về mảng phẳng (không phân trang server-side), lọc theo
 * `month` (bắt buộc dạng "yyyy/MM" khớp AR_DATE_STR lưu dạng "yyyy/MM/dd" -
 * mapper dùng LIKE #{month} || '%').
 */
@Injectable({ providedIn: 'root' })
export class AddEmpShiftService {
  private readonly http = inject(HttpClient);

  getList(empId: string | undefined, month: string): Promise<EmpShiftRow[]> {
    const params: Record<string, string> = { month };
    if (empId) params['empId'] = empId;
    return firstValueFrom(this.http.get<EmpShiftRow[]>(LIST_URL, { params }));
  }

  getByPkNo(pkNo: number): Promise<EmpShiftRow> {
    return firstValueFrom(this.http.get<EmpShiftRow>(`${DETAIL_URL}/${pkNo}`));
  }

  save(payload: EmpShiftSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(pkNo: number): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${DELETE_URL}/${pkNo}`));
  }

  importTemplate(file: File): Promise<SaveResponse> {
    const form = new FormData();
    form.append('templateName', IMPORT_TEMPLATE_NAME);
    form.append('file', file);
    return firstValueFrom(this.http.post<SaveResponse>(IMPORT_URL, form));
  }
}
