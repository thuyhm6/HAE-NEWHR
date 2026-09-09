import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ArItemParamRow {
  arParamNo?: string;
  cpnyId?: string;
  companyName?: string;
  itemNo?: string;
  itemNameVi?: string;
  unit?: string;
  unitValue?: number;
  groupNo?: string;
  minValue?: number;
  maxValue?: number;
  dependItem?: string;
  replaceItem?: string;
  cardFlag?: number;
  cardFromFlag?: number;
  cardFromOffset?: number;
  cardFromRelation?: string;
  cardToFlag?: number;
  cardToOffset?: number;
  cardToRelation?: string;
  applyFlag?: number;
  applyType?: string;
  applyFulldayValue?: number;
  applyCardPriority?: number;
  dateType?: string;
  detailContent?: string;
  orderno?: number;
  activity?: number;
}

export interface ArItemParamSavePayload {
  arParamNo: string | null;
  cpnyId: string;
  itemNo: string;
  groupNo: string | null;
  unit: string | null;
  unitValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  dependItem: string | null;
  replaceItem: string | null;
  cardFlag: number;
  cardFromFlag: number;
  cardFromOffset: number | null;
  cardFromRelation: string | null;
  cardToFlag: number;
  cardToOffset: number | null;
  cardToRelation: string | null;
  applyFlag: number;
  applyType: string | null;
  applyFulldayValue: number | null;
  applyCardPriority: number;
  dateType: string | null;
  detailContent: string | null;
  orderno: number;
  activity: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CompanyOption {
  cpnyId: string;
  nameVi?: string;
}

export interface ArItemOption {
  itemNo: string;
  nameVi?: string;
  shortName?: string;
  activity?: number;
}

const LIST_URL = '/ar/attendanceSettings/api/arItemParam';
const SAVE_URL = '/ar/attendanceSettings/api/arItemParam/save';
const DELETE_URL = '/ar/attendanceSettings/api/arItemParam/delete';
const COMPANY_LIST_URL = '/sys/api/company/list';
const AR_ITEM_LIST_URL = '/ar/attendanceSettings/api/arItem';

/**
 * CRUD "Thông số Hạng mục chấm công" (AR_ITEM_PARAM) - port lại từ
 * ar/attendanceSettings/viewArItemParamList.html (đã xoá), dùng chung
 * backend với ItemParameterComponent (viewItemParameter, cây Hạng mục +
 * bảng tham số). `arParamNo` tự sinh khi thêm mới.
 *
 * Lỗi đã sửa khi migrate: bản gốc `viewArItemParamList.html`/
 * `viewItemParameter.html` hiển thị tên công ty bằng
 * `company.companyNameVi || company.cpnyId` nhưng field API thực tế là
 * `nameVi` (không phải `companyNameVi`) - fallback về `cpnyId` LUÔN xảy ra
 * trên thực tế (dropdown công ty luôn hiện mã thay vì tên). Đã map đúng
 * field `nameVi` khi viết lại.
 */
@Injectable({ providedIn: 'root' })
export class ArItemParamListService {
  private readonly http = inject(HttpClient);

  getList(cpnyId?: string, itemNo?: string): Promise<ArItemParamRow[]> {
    const params: Record<string, string> = {};
    if (cpnyId) params['cpnyId'] = cpnyId;
    if (itemNo) params['itemNo'] = itemNo;
    return firstValueFrom(this.http.get<ArItemParamRow[]>(LIST_URL, { params }));
  }

  getById(arParamNo: string): Promise<ArItemParamRow> {
    return firstValueFrom(this.http.get<ArItemParamRow>(`${LIST_URL}/${arParamNo}`));
  }

  save(payload: ArItemParamSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(arParamNo: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${DELETE_URL}/${arParamNo}`));
  }

  getCompanyList(): Promise<CompanyOption[]> {
    return firstValueFrom(this.http.get<CompanyOption[]>(COMPANY_LIST_URL));
  }

  getArItemList(): Promise<ArItemOption[]> {
    return firstValueFrom(this.http.get<ArItemOption[]>(AR_ITEM_LIST_URL));
  }
}
