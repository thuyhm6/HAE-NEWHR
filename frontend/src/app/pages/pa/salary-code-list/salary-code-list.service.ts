import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface PaSalaryCodeRow {
  itemType?: number;
  itemNo?: string;
  itemId?: string;
  mapCode?: string;
  itemName?: string;
  nameEn?: string;
  nameKo?: string;
  nameVi?: string;
  nameZh?: string;
  dataType?: string;
  descr?: string;
  createdBy?: string;
  createDate?: string;
  companyUsage?: string[];
  companyUsageStr?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/pa/salarycode/api';

/**
 * Danh sách hạng mục lương (viewSalaryCodeList) - port lại từ
 * pa/salarycode/viewSalaryCodeList.html (đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class SalaryCodeListService {
  private readonly http = inject(HttpClient);

  getList(
    itemNameSearch: string,
    itemTypeSearch: string | null,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<PaSalaryCodeRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<PaSalaryCodeRow>>(`${BASE_URL}/list`, {
        params: { itemNameSearch, itemTypeSearch: itemTypeSearch ?? '', draw, start, length },
      }),
    );
  }

  getOne(itemType: number, itemNo: string): Promise<PaSalaryCodeRow> {
    return firstValueFrom(this.http.get<PaSalaryCodeRow>(`${BASE_URL}/${itemType}/${itemNo}`));
  }

  save(dto: PaSalaryCodeRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  deleteList(keys: { itemType: number; itemNo: string }[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/deleteList`, { body: keys }));
  }
}
