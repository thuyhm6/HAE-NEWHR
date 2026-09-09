import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ArItemRow {
  itemNo?: string;
  itemId?: string;
  shortName?: string;
  description?: string;
  unit?: string;
  itemGroupCode?: string;
  itemIdMapping?: string;
  orderno?: number;
  ordernoSst?: number;
  activity?: number;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
}

export interface ArItemSavePayload {
  itemNo: string | null;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  nameKo: string;
  itemId: string;
  shortName: string;
  description: string;
  unit: string;
  itemGroupCode: string | null;
  itemIdMapping: string;
  orderno: number | null;
  ordernoSst: number | null;
  activity: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceSettings/api/arItem';
const SAVE_URL = '/ar/attendanceSettings/api/arItem/save';
const DELETE_URL = '/ar/attendanceSettings/api/arItem/delete';

/**
 * CRUD phẳng danh mục "Hạng mục chấm công" (AR_ITEM) - port lại từ
 * ar/attendanceSettings/viewArItem.html (đã xoá). Khi thêm mới, `itemNo`
 * (mã hạng mục) được backend tự sinh qua sequence
 * (`SyGlobalNameMapper.getNextNoSeq()`), không cho nhập tay - khớp bản gốc
 * (input `itemNo` là hidden field, chỉ hiển thị ở cột bảng sau khi lưu).
 */
@Injectable({ providedIn: 'root' })
export class ArItemService {
  private readonly http = inject(HttpClient);

  getList(itemNo?: string): Promise<ArItemRow[]> {
    const params: Record<string, string> = {};
    if (itemNo) params['itemNo'] = itemNo;
    return firstValueFrom(this.http.get<ArItemRow[]>(LIST_URL, { params }));
  }

  getById(itemNo: string): Promise<ArItemRow> {
    return firstValueFrom(this.http.get<ArItemRow>(`${LIST_URL}/${itemNo}`));
  }

  save(payload: ArItemSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(itemNo: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${DELETE_URL}/${itemNo}`));
  }
}
