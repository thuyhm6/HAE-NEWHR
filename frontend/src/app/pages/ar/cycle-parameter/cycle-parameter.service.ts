import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CycleParameterRow {
  paramNo?: string;
  cpnyId?: string;
  statNo?: string;
  startDate?: string;
  endDate?: string;
  orderno?: number;
  activity?: number;
}

export interface CycleParameterSavePayload {
  paramNo: string | null;
  cpnyId: string;
  statNo: string;
  startDate: string | null;
  endDate: string | null;
  orderno: number | null;
  activity: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceSettings/api/cycleParameter';
const SAVE_URL = '/ar/attendanceSettings/api/cycleParameter/save';
const DELETE_URL = '/ar/attendanceSettings/api/cycleParameter/delete';

/**
 * CRUD phẳng "Thông số chu kỳ chấm công" (AR_STATISTIC_DATE_PARAM) - port
 * lại từ ar/attendanceSettings/viewCycleParameter.html (đã xoá). Khác
 * `CycleService`/`ArItemService`: `paramNo` tự sinh khi thêm mới (sequence
 * riêng `AR_STATISTIC_DATE_PARAM_SEQ`), nhưng `cpnyId`/`statNo` LÀ input bắt
 * buộc do người dùng nhập tay (không phải tự sinh) - khớp đúng bản gốc.
 */
@Injectable({ providedIn: 'root' })
export class CycleParameterService {
  private readonly http = inject(HttpClient);

  getList(cpnyId?: string, statNo?: string): Promise<CycleParameterRow[]> {
    const params: Record<string, string> = {};
    if (cpnyId) params['cpnyId'] = cpnyId;
    if (statNo) params['statNo'] = statNo;
    return firstValueFrom(this.http.get<CycleParameterRow[]>(LIST_URL, { params }));
  }

  getById(paramNo: string): Promise<CycleParameterRow> {
    return firstValueFrom(this.http.get<CycleParameterRow>(`${LIST_URL}/${paramNo}`));
  }

  save(payload: CycleParameterSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(paramNo: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${DELETE_URL}/${paramNo}`));
  }
}
