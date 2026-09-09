import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CycleRow {
  statNo?: string;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
  startDay?: number;
  endDay?: number;
  validDateFrom?: string;
  validDateTo?: string;
  beginMonthOffset?: number;
  endMonthOffset?: number;
  orderno?: number;
  activity?: number;
}

export interface CycleSavePayload {
  statNo: string | null;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  nameKo: string;
  startDay: number | null;
  endDay: number | null;
  validDateFrom: string | null;
  validDateTo: string | null;
  beginMonthOffset: number | null;
  endMonthOffset: number | null;
  orderno: number | null;
  activity: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceSettings/api/cycle';
const SAVE_URL = '/ar/attendanceSettings/api/cycle/save';
const DELETE_URL = '/ar/attendanceSettings/api/cycle/delete';

/**
 * CRUD phẳng danh mục "Chi nhánh / chu kỳ chấm công" (AR_STATISTIC_DATE) -
 * port lại từ ar/attendanceSettings/viewCycle.html (đã xoá). `statNo` được
 * backend tự sinh khi thêm mới (sequence dùng chung với ArItem), không cho
 * nhập tay. `validDateFrom`/`validDateTo` định dạng `yyyy-MM-dd`.
 */
@Injectable({ providedIn: 'root' })
export class CycleService {
  private readonly http = inject(HttpClient);

  getList(statNo?: string): Promise<CycleRow[]> {
    const params: Record<string, string> = {};
    if (statNo) params['statNo'] = statNo;
    return firstValueFrom(this.http.get<CycleRow[]>(LIST_URL, { params }));
  }

  getById(statNo: string): Promise<CycleRow> {
    return firstValueFrom(this.http.get<CycleRow>(`${LIST_URL}/${statNo}`));
  }

  save(payload: CycleSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(statNo: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${DELETE_URL}/${statNo}`));
  }
}
