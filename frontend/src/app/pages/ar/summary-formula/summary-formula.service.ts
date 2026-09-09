import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ItemTreeOption {
  itemNo: string;
  nameVi?: string;
  calOrder?: number;
}

export interface FormulaRow {
  formularNo?: number;
  itemNo?: string;
  condition?: string;
  formular?: string;
  orderno?: number;
  activity?: number;
}

export interface FormulaSavePayload {
  formularNo: number | null;
  itemNo: string;
  condition: string | null;
  formular: string;
  orderno: number | null;
  activity: number;
}

export interface ToolAttItem {
  itemId?: string;
  itemName?: string;
  itemGroupName?: string;
}

export interface ToolStaItem {
  itemNo?: string;
  itemName?: string;
  calOrder?: number;
  staItemId?: string;
  dataType?: string;
  dataTypeName?: string;
}

export interface ToolBasicInfo {
  distinctField?: string;
  fieldName?: string;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const TREE_ITEMS_URL = '/ar/attendanceSettings/api/arStaFormula/treeItems';
const FORMULA_URL = '/ar/attendanceSettings/api/arStaFormula';
const SAVE_URL = '/ar/attendanceSettings/api/arStaFormula/save';
const ATT_ITEMS_URL = '/ar/attendanceSettings/api/arStaFormula/tools/attItems';
const STA_ITEMS_URL = '/ar/attendanceSettings/api/arStaFormula/tools/staItems';
const BASIC_INFOS_URL = '/ar/attendanceSettings/api/arStaFormula/tools/basicInfos';

/**
 * Quản lý Công thức Hạng mục tổng hợp (AR_STA_FORMULA) - port lại từ
 * ar/attendanceSettings/viewSummaryFormula.html (đã xoá). Master-detail: cây
 * phẳng Hạng mục (đã có thông số ở AR_STA_ITEM_PARAM) bên trái, danh sách
 * công thức lọc theo hạng mục bên phải. Modal Thêm/Sửa có kèm 3 bảng công
 * cụ tra cứu (hạng mục chấm công / bảng tổng hợp / thông tin cơ bản) - click
 * 1 dòng để chèn mã tham chiếu vào ô Công thức.
 */
@Injectable({ providedIn: 'root' })
export class SummaryFormulaService {
  private readonly http = inject(HttpClient);

  /** `getParamItemsForLeftTree` dùng alias KHÔNG quote (`as itemNo`) nên
   * Oracle trả về key viết hoa (ITEMNO/NAMEVI) - đọc phòng thủ nhiều biến
   * thể, khớp bản gốc (`item.itemNo || item.ITEMNO || item.ITEM_NO`). */
  async getTreeItems(): Promise<ItemTreeOption[]> {
    const raw = await firstValueFrom(this.http.get<Record<string, unknown>[]>(TREE_ITEMS_URL));
    return (raw || []).map((it) => ({
      itemNo: String(it['itemNo'] ?? it['ITEMNO'] ?? it['ITEM_NO'] ?? ''),
      nameVi: (it['nameVi'] ?? it['NAMEVI'] ?? it['NAME_VI']) as string | undefined,
      calOrder: (it['calOrder'] ?? it['CALORDER'] ?? it['CAL_ORDER']) as number | undefined,
    }));
  }

  getFormulasByItem(itemNo: string): Promise<FormulaRow[]> {
    return firstValueFrom(this.http.get<FormulaRow[]>(FORMULA_URL, { params: { itemNo } }));
  }

  getFormulaById(formularNo: number): Promise<FormulaRow> {
    return firstValueFrom(this.http.get<FormulaRow>(`${FORMULA_URL}/${formularNo}`));
  }

  save(payload: FormulaSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(formularNo: number): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${FORMULA_URL}/delete/${formularNo}`));
  }

  /** Alias có quote ("itemId", "itemName"...) nên key giữ nguyên camelCase, không cần đọc phòng thủ. */
  getAttItems(): Promise<ToolAttItem[]> {
    return firstValueFrom(this.http.get<ToolAttItem[]>(ATT_ITEMS_URL));
  }

  getStaItems(): Promise<ToolStaItem[]> {
    return firstValueFrom(this.http.get<ToolStaItem[]>(STA_ITEMS_URL));
  }

  getBasicInfos(): Promise<ToolBasicInfo[]> {
    return firstValueFrom(this.http.get<ToolBasicInfo[]>(BASIC_INFOS_URL));
  }
}
