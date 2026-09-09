import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PaSupervisorRow {
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  empOffice?: string;
  createDate?: string;
  createdBy?: string;
  activity?: number;
  orderNo?: number;
}

export interface DeptTreeNode {
  id: string;
  text: string;
  parent: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/pa/wagebase/api/supervisor';

/**
 * Người phụ trách lương (viewPaSupervisor) - port lại từ
 * pa/wagebase/viewPaSupervisor.html (đã xoá). Layout master-detail: danh
 * sách người phụ trách (trái) + cây phòng ban phân quyền (phải, nz-tree
 * checkable). Cấu trúc dữ liệu cây {id,text,parent} giống hệt
 * AuthorizedDeptNode của EvsAffirmorSetupService nên dùng lại
 * buildDeptTree() của service đó thay vì viết lại.
 */
@Injectable({ providedIn: 'root' })
export class PaSupervisorService {
  private readonly http = inject(HttpClient);

  getAllSupervisorList(): Promise<PaSupervisorRow[]> {
    return firstValueFrom(this.http.get<PaSupervisorRow[]>(`${BASE_URL}/all`));
  }

  getDepartmentTree(): Promise<DeptTreeNode[]> {
    return firstValueFrom(this.http.get<DeptTreeNode[]>(`${BASE_URL}/departments`));
  }

  getDeptListByPersonId(personId: string): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${BASE_URL}/${personId}/departments`));
  }

  saveDepartments(personId: string, deptNoList: string[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/${personId}/saveDepartments`, deptNoList));
  }

  getOne(personId: string): Promise<PaSupervisorRow> {
    return firstValueFrom(this.http.get<PaSupervisorRow>(`${BASE_URL}/${personId}`));
  }

  save(dto: PaSupervisorRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  delete(personId: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/delete/${personId}`));
  }
}
