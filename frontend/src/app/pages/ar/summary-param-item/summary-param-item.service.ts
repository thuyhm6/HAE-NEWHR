import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SummaryParamItemRow {
  paramNo?: string;
  itemNo?: string;
  itemNameVi?: string;
  itemNameEn?: string;
  itemNameZh?: string;
  itemNameKo?: string;
  companyName?: string;
  unit?: string;
  minUnit?: number;
  calOrder?: number;
  manageFlag?: number;
  orderno?: number;
  activity?: number;
}

export interface SummaryParamItemSavePayload {
  paramNo: string | null;
  itemNo: string;
  unit: string | null;
  minUnit: number | null;
  manageFlag: number | null;
  orderno: number | null;
  activity: number;
  calOrder?: number | null;
}

export interface AvailableItemOption {
  itemNo: string;
  nameVi?: string;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceSettings/api/arStaItemParam';
const AVAILABLE_ITEMS_URL = '/ar/attendanceSettings/api/arStaItemParam/availableItems';
const SAVE_URL = '/ar/attendanceSettings/api/arStaItemParam/save';

/**
 * CRUD phẳng "Thông số Hạng mục tổng hợp" (AR_STA_ITEM_PARAM) - port lại từ
 * ar/attendanceSettings/viewSummaryParamItem.html (đã xoá). Danh sách nhỏ
 * (cấu hình hệ thống) nên dùng nz-table phân trang phía client.
 */
@Injectable({ providedIn: 'root' })
export class SummaryParamItemService {
  private readonly http = inject(HttpClient);

  getList(searchText?: string): Promise<SummaryParamItemRow[]> {
    const params: Record<string, string> = {};
    if (searchText) params['searchText'] = searchText;
    return firstValueFrom(this.http.get<SummaryParamItemRow[]>(LIST_URL, { params }));
  }

  getById(paramNo: string): Promise<SummaryParamItemRow> {
    return firstValueFrom(this.http.get<SummaryParamItemRow>(`${LIST_URL}/${paramNo}`));
  }

  /** Backend trả về raw Map (resultType="java.util.Map") - Oracle có thể trả
   * key viết hoa (ITEMNO/NAMEVI) tùy driver, nên đọc phòng thủ nhiều biến
   * thể tên khóa, giữ đúng cách xử lý phòng thủ ở bản gốc (`itm.itemNo ||
   * itm.ITEMNO || itm.ITEM_NO`). */
  async getAvailableItems(): Promise<AvailableItemOption[]> {
    const raw = await firstValueFrom(this.http.get<Record<string, unknown>[]>(AVAILABLE_ITEMS_URL));
    return (raw || []).map((it) => ({
      itemNo: String(it['itemNo'] ?? it['ITEMNO'] ?? it['ITEM_NO'] ?? ''),
      nameVi: (it['nameVi'] ?? it['NAMEVI'] ?? it['NAME_VI']) as string | undefined,
    }));
  }

  save(payload: SummaryParamItemSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(paramNo: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${LIST_URL}/delete/${paramNo}`));
  }
}
