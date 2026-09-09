import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface PaFormulaItem {
  itemNo?: string;
  itemName?: string;
}

export interface PaFormulaToolItem {
  itemId?: string;
  itemName?: string;
}

export interface PaFormulaToolItems {
  paramItems?: PaFormulaToolItem[];
  salaryItems?: PaFormulaToolItem[];
  attendanceItems?: PaFormulaToolItem[];
  fixedParams?: PaFormulaToolItem[];
}

export interface PaFormulaRow {
  formularNo?: number;
  itemNo?: string;
  condition?: string;
  formular?: string;
  conditionSeq?: number;
  description?: string;
  itemName?: string;
  minSeq?: number;
  maxSeq?: number;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/pa/salary/formula/api';

/**
 * Cấu hình công thức tính toán (viewPaFormula) - port lại từ
 * pa/salary/viewPaFormula.html (đã xoá). Layout master-detail: danh sách
 * hạng mục (trái) + bảng công thức của hạng mục đang chọn (phải).
 */
@Injectable({ providedIn: 'root' })
export class PaFormulaService {
  private readonly http = inject(HttpClient);

  getItemList(): Promise<PaFormulaItem[]> {
    return firstValueFrom(this.http.get<PaFormulaItem[]>(`${BASE_URL}/itemList`));
  }

  getToolItems(): Promise<PaFormulaToolItems> {
    return firstValueFrom(this.http.get<PaFormulaToolItems>(`${BASE_URL}/toolItems`));
  }

  getAllItemNames(): Promise<PaFormulaToolItem[]> {
    return firstValueFrom(this.http.get<PaFormulaToolItem[]>(`${BASE_URL}/allItemNames`));
  }

  getList(itemNo: string, draw: number, start: number, length: number): Promise<DataTablesResponse<PaFormulaRow>> {
    return firstValueFrom(this.http.get<DataTablesResponse<PaFormulaRow>>(`${BASE_URL}/list`, { params: { itemNo, draw, start, length } }));
  }

  getOne(formularNo: number): Promise<PaFormulaRow> {
    return firstValueFrom(this.http.get<PaFormulaRow>(`${BASE_URL}/${formularNo}`));
  }

  insert(dto: PaFormulaRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/insert`, dto));
  }

  update(dto: PaFormulaRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.put<ActionResponse>(`${BASE_URL}/update`, dto));
  }

  delete(formularNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/delete/${formularNo}`));
  }

  swapSeq(formularNo: number, itemNo: string, direction: 'up' | 'down'): Promise<ActionResponse> {
    return firstValueFrom(
      this.http.put<ActionResponse>(`${BASE_URL}/swapSeq`, { formularNo: String(formularNo), itemNo, direction }),
    );
  }
}
