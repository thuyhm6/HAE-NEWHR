import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SummaryItemRow {
  itemNo?: string;
  unit?: string;
  staItemId?: string;
  activity?: number;
  orderno?: number;
  showYn?: string;
  showOrder?: number;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
}

export interface SummaryItemSavePayload {
  itemNo: string | null;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  nameKo: string;
  unit: string;
  staItemId: string;
  orderno: number | null;
  showYn: string;
  showOrder: number | null;
  activity: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceSettings/api/arStaItem';
const SAVE_URL = '/ar/attendanceSettings/api/arStaItem/save';
const DELETE_URL = '/ar/attendanceSettings/api/arStaItem/delete';

/**
 * CRUD phẳng danh mục "Hạng mục tổng hợp" (AR_STA_ITEM) - port lại từ
 * ar/attendanceSettings/viewSummaryItem.html (đã xoá). `itemNo` tự sinh khi
 * thêm mới (cùng cơ chế sequence với ArItem/Cycle). `datatype` luôn cố định
 * '1492' phía backend, không cần gửi từ client.
 */
@Injectable({ providedIn: 'root' })
export class SummaryItemService {
  private readonly http = inject(HttpClient);

  getList(searchText?: string): Promise<SummaryItemRow[]> {
    const params: Record<string, string> = {};
    if (searchText) params['searchText'] = searchText;
    return firstValueFrom(this.http.get<SummaryItemRow[]>(LIST_URL, { params }));
  }

  getById(itemNo: string): Promise<SummaryItemRow> {
    return firstValueFrom(this.http.get<SummaryItemRow>(`${LIST_URL}/${itemNo}`));
  }

  save(payload: SummaryItemSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(itemNo: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${DELETE_URL}/${itemNo}`));
  }
}
