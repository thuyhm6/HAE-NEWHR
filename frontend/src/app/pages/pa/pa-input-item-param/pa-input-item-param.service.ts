import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface PaInputItemParamRow {
  paramNo?: string;
  distinctField?: string;
  distinctField2nd?: string;
  paramItemId?: string;
  defaultVal?: string;
  aliasName?: string;
  cpnyId?: string;
  cpnyName?: string;
  distinctFieldName?: string;
  distinctField2ndName?: string;
  itemType?: number;
  activity?: number;
}

export interface PaDistinctOption {
  distinctField?: string;
  distinctFieldName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/pa/salary/inputitemparam/api';

/**
 * Thông số mục nhập (viewPaInputItemParam) - port lại từ
 * pa/salary/viewPaInputItemParam.html (đã xoá). Trang chỉ cho Sửa/Xóa, không
 * có Thêm mới (đúng theo backend gốc - không có endpoint insert).
 */
@Injectable({ providedIn: 'root' })
export class PaInputItemParamService {
  private readonly http = inject(HttpClient);

  getList(
    itemTypeSearch: number | null,
    aliasNameSearch: string,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<PaInputItemParamRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<PaInputItemParamRow>>(`${BASE_URL}/list`, {
        params: { itemTypeSearch: itemTypeSearch ?? '', aliasNameSearch, draw, start, length },
      }),
    );
  }

  getOne(paramNo: string): Promise<PaInputItemParamRow> {
    return firstValueFrom(this.http.get<PaInputItemParamRow>(`${BASE_URL}/${paramNo}`));
  }

  update(dto: PaInputItemParamRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.put<ActionResponse>(`${BASE_URL}/update`, dto));
  }

  getDistinctList(): Promise<PaDistinctOption[]> {
    return firstValueFrom(this.http.get<PaDistinctOption[]>(`${BASE_URL}/distinctList`));
  }

  deleteList(paramNos: string[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/deleteList`, { body: paramNos }));
  }
}
