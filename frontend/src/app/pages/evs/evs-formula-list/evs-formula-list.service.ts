import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsFormula {
  seq?: string;
  codeNo?: string;
  codeName?: string;
  formula?: string;
  remark?: string;
  activity?: string;
  orderNo?: string;
  createDate?: string;
  createdBy?: string;
  updateDate?: string;
  updatedBy?: string;
}

const BASE_URL = '/evs/manage/api/evsFormula';

/**
 * Công thức đánh giá (viewEvsFormulaList) - port lại từ
 * evs/manage/viewEvsFormulaList.html (đã xoá). CRUD đơn giản, danh sách tải
 * toàn bộ (không server-side paging) giống bản gốc dùng DataTables client.
 */
@Injectable({ providedIn: 'root' })
export class EvsFormulaListService {
  private readonly http = inject(HttpClient);

  getList(codeNo?: string, codeName?: string, activity?: string): Promise<EvsFormula[]> {
    return firstValueFrom(
      this.http.get<EvsFormula[]>(`${BASE_URL}/list`, { params: { codeNo: codeNo ?? '', codeName: codeName ?? '', activity: activity ?? '' } }),
    );
  }

  getOne(seq: string): Promise<EvsFormula> {
    return firstValueFrom(this.http.get<EvsFormula>(`${BASE_URL}/${encodeURIComponent(seq)}`));
  }

  save(payload: EvsFormula): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/save`, payload));
  }

  delete(seq: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/delete`, { seq }));
  }
}
