import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OrgCostCenterRow {
  seq?: string | null;
  codeNo: string;
  codeName?: string | null;
  codeEngName?: string | null;
  codeKoreanName?: string | null;
  codeVietnameseName?: string | null;
  orderNo?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  country?: string | null;
  address?: string | null;
  activity?: string | null;
  remark?: string | null;
  businessScope?: string | null;
  profitCenter?: string | null;
}

const BASE_URL = '/org/api/costCenter';

/**
 * Quản lý trung tâm chi phí (viewOrgCostCenter) - gọi lại nguyên API JSON đã có sẵn ở
 * OrgCostCenterController, không đổi backend. Cùng API dropdown /org/api/costCenter/list đã được
 * OrgComposeService dùng để đổ dropdown "Mã chi phí" ở trang org-compose.
 */
@Injectable({ providedIn: 'root' })
export class OrgCostCenterPageService {
  private readonly http = inject(HttpClient);

  getList(codeNo: string, codeName: string): Promise<{ data: OrgCostCenterRow[] }> {
    return firstValueFrom(this.http.post<{ data: OrgCostCenterRow[] }>(`${BASE_URL}/list`, { codeNo, codeName }));
  }

  save(payload: OrgCostCenterRow): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${BASE_URL}/save`, payload));
  }

  delete(seq: string): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${BASE_URL}/delete`, null, { params: { seq } }));
  }
}
