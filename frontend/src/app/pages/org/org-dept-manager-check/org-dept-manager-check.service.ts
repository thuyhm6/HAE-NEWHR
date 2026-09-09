import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DeptManagerCheckRow {
  DEPTNO: string;
  ORG_NAME_LOCAL?: string | null;
  MANAGER_EMP_ID?: string | null;
  MANAGER_NAME?: string | null;
  IS_PART_TIME?: string | null;
  DEPT_LEVEL?: number | null;
  POSITION_NO?: string | null;
  POSITION_NAME?: string | null;
  POST_GRADE_NO?: string | null;
  POST_GRADE_NAME?: string | null;
  VACANCY?: number | string | null;
}

export interface UpdateManagerPayload {
  resumeNo: string;
  deptNo: string;
  managerEmpId: string;
  isPartTime: string;
}

const BASE_URL = '/org/api/compose';

/**
 * Kiểm tra trưởng bộ phận (viewDeptManagerCheck) - gọi lại nguyên API JSON đã có sẵn ở
 * OrgComposeController#getDeptManagerCheckList/updateOrgManager, không đổi backend. Dropdown phiên bản
 * thay đổi dùng chung API với OrgComposeService (org-compose.service.ts) - tái sử dụng thay vì viết lại.
 */
@Injectable({ providedIn: 'root' })
export class OrgDeptManagerCheckService {
  private readonly http = inject(HttpClient);

  getManagerCheckList(resumeNo: string): Promise<DeptManagerCheckRow[]> {
    return firstValueFrom(this.http.get<DeptManagerCheckRow[]>(`${BASE_URL}/manager-check`, { params: { resumeNo } }));
  }

  updateManager(payload: UpdateManagerPayload): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${BASE_URL}/updateManager`, payload));
  }
}
