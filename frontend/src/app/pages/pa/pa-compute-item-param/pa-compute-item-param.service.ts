import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface PaComputeItemParamRow {
  paramNo?: string;
  itemNo?: string;
  itemId?: string;
  aliasName?: string;
  calcuOrder?: number;
  pricision?: number | null;
  carryBit?: number | null;
  cpnyId?: string;
  cpnyName?: string;
  applyType?: string | null;
  applyTypeName?: string;
}

export interface PaItemOption {
  itemNo?: string;
  itemId?: string;
  itemName?: string;
}

export interface ApplyTypeOption {
  applyType?: string;
  applyTypeName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/pa/salary/computeitemparam/api';

/**
 * Thông số mục tính toán (viewPaComputeItemParamList) - port lại từ
 * pa/salary/viewPaComputeItemParamList.html (đã xoá). Gộp 2 modal Thêm/Sửa
 * riêng biệt của bản gốc thành 1 modal dùng chung (formIsAdd phân biệt).
 */
@Injectable({ providedIn: 'root' })
export class PaComputeItemParamService {
  private readonly http = inject(HttpClient);

  getList(aliasNameSearch: string, draw: number, start: number, length: number): Promise<DataTablesResponse<PaComputeItemParamRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<PaComputeItemParamRow>>(`${BASE_URL}/list`, { params: { aliasNameSearch, draw, start, length } }),
    );
  }

  getOne(paramNo: string): Promise<PaComputeItemParamRow> {
    return firstValueFrom(this.http.get<PaComputeItemParamRow>(`${BASE_URL}/${paramNo}`));
  }

  insert(dto: PaComputeItemParamRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/insert`, dto));
  }

  update(dto: PaComputeItemParamRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.put<ActionResponse>(`${BASE_URL}/update`, dto));
  }

  deleteList(paramNos: string[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/deleteList`, { body: paramNos }));
  }

  getItemList(): Promise<PaItemOption[]> {
    return firstValueFrom(this.http.get<PaItemOption[]>(`${BASE_URL}/itemList`));
  }

  getApplyTypeList(): Promise<ApplyTypeOption[]> {
    return firstValueFrom(this.http.get<ApplyTypeOption[]>(`${BASE_URL}/applyTypeList`));
  }

  swapOrder(paramNo: string, direction: 'up' | 'down'): Promise<ActionResponse> {
    return firstValueFrom(this.http.put<ActionResponse>(`${BASE_URL}/swapOrder`, { paramNo, direction }));
  }
}
