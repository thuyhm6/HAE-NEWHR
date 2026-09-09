import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OrgBusinessRow {
  seq?: string | null;
  resumeNo?: string | null;
  deptNo?: string | null;
  codeNo: string;
  isDefault?: string | null;
  orderNo?: number | null;
  updatedBy?: string | null;
  updateDate?: string | null;
  businessName?: string | null;
  deptName?: string | null;
}

const BASE_URL = '/org/api/business';

/**
 * Quản lý nghiệp vụ phòng ban (viewOrgBusiness) - gọi lại nguyên API JSON đã có sẵn ở
 * OrgBusinessController, không đổi backend. Dropdown phiên bản thay đổi + cây tổ chức tái sử dụng
 * OrgComposeService (cùng API với trang org-compose) thay vì viết lại.
 */
@Injectable({ providedIn: 'root' })
export class OrgBusinessService {
  private readonly http = inject(HttpClient);

  getList(resumeNo: string, deptNo: string): Promise<OrgBusinessRow[]> {
    return firstValueFrom(this.http.get<OrgBusinessRow[]>(`${BASE_URL}/list`, { params: { resumeNo, deptNo } }));
  }

  save(payload: OrgBusinessRow): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${BASE_URL}/save`, payload));
  }

  delete(seq: string): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${BASE_URL}/delete`, null, { params: { seq } }));
  }
}
