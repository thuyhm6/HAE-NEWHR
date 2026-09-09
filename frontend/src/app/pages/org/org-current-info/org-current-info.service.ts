import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface HrDepartmentRow {
  deptNo: string;
  parentDeptNo?: string | null;
  orgNameLocal?: string | null;
  orgNameEng?: string | null;
  deptType?: string | null;
  deptTypeName?: string | null;
  managerEmpId?: string | null;
  managerEmpName?: string | null;
  costCenter?: string | null;
  costCenterName?: string | null;
}

export interface CurrentOrgEmployeeRow {
  empId: string;
  localName?: string | null;
  englishName?: string | null;
  position?: string | null;
  dateStarted?: string | null;
  activity?: number | null;
}

const BASE_URL = '/org/api/current';

/**
 * Sơ đồ tổ chức hiện hành (viewCurrentOrgInfo) - xem cơ cấu tổ chức hiện tại (không theo phiên bản thay
 * đổi như org-compose), chỉ xem, không có thao tác thêm/sửa/xóa. Gọi lại nguyên API JSON đã có sẵn ở
 * CurrentOrgController, không đổi backend.
 */
@Injectable({ providedIn: 'root' })
export class OrgCurrentInfoService {
  private readonly http = inject(HttpClient);

  getStructure(): Promise<HrDepartmentRow[]> {
    return firstValueFrom(this.http.get<HrDepartmentRow[]>(`${BASE_URL}/structure`));
  }

  getEmployees(deptNo: string): Promise<CurrentOrgEmployeeRow[]> {
    return firstValueFrom(this.http.get<CurrentOrgEmployeeRow[]>(`${BASE_URL}/employees`, { params: { deptNo } }));
  }
}
