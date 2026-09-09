import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SupervisorRow {
  personId: string;
  empId?: string;
  empName?: string;
  deptName?: string;
  orderno?: number;
  modifyYn?: number;
  activity?: number;
}

export interface DeptTreeNode {
  id: string;
  parent: string;
  text: string;
}

export interface SupervisorSavePayload {
  personId: string;
  orderno: number | null;
  modifyYn: number;
  activity: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const BASE_URL = '/ar/attendanceSettings/api/arSupervisor';

/**
 * Quản lý "Người chấm công" (nhân viên được phân quyền quản lý phòng ban) -
 * port lại từ ar/attendanceSettings/viewAttendanceKeeper.html (đã xoá). Cây
 * phòng ban dùng cascade check (chọn cha tự chọn hết con, chọn con tự chọn
 * hết tổ tiên) - khớp hành vi mặc định của `nz-tree` checkable, không cần tự
 * viết logic cascade như bản gốc (jQuery thao tác DOM trực tiếp).
 */
@Injectable({ providedIn: 'root' })
export class AttendanceKeeperService {
  private readonly http = inject(HttpClient);

  getAllSupervisors(): Promise<SupervisorRow[]> {
    return firstValueFrom(this.http.get<SupervisorRow[]>(BASE_URL));
  }

  getDepartmentTree(): Promise<DeptTreeNode[]> {
    return firstValueFrom(this.http.get<DeptTreeNode[]>(`${BASE_URL}/departments`));
  }

  getSupervisorDepartments(personId: string): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${BASE_URL}/${personId}/departments`));
  }

  save(payload: SupervisorSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(`${BASE_URL}/save`, payload));
  }

  delete(personId: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${BASE_URL}/delete/${personId}`));
  }

  saveDepartments(personId: string, deptNoList: string[]): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(`${BASE_URL}/${personId}/saveDepartments`, deptNoList));
  }
}
