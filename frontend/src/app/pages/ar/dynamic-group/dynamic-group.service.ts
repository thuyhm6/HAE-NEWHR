import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DynamicGroupRow {
  personId?: string;
  groupNo?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  updatedBy?: string;
  updateDate?: string;
  activity?: number;
  orderno?: number;
}

export interface DynamicGroupSavePayload {
  personId: string;
  groupNo: string;
  orderno: number | null;
  activity: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceSettings/api/dynamicGroup/list';
const SAVE_URL = '/ar/attendanceSettings/api/dynamicGroup/save';
const DELETE_URL = '/ar/attendanceSettings/api/dynamicGroup/delete';

/** Mã nhóm cố định cho "Nhân viên đặc biệt" - khớp bản gốc (hidden field mặc định 80000084). */
export const DYNAMIC_GROUP_NO = '80000084';

/**
 * Quản lý danh sách "Nhân viên đặc biệt" (AR_EMP_GROUP, nhóm cố định
 * 80000084) - port lại từ ar/attendanceSettings/viewDynamicGroup.html (đã
 * xoá). Chỉ hỗ trợ Thêm (chọn qua picker nhân viên) và Xóa - bản gốc không
 * có nút Sửa trên bảng dù backend có sẵn endpoint GET theo personId.
 */
@Injectable({ providedIn: 'root' })
export class DynamicGroupService {
  private readonly http = inject(HttpClient);

  getList(empId?: string): Promise<DynamicGroupRow[]> {
    const params: Record<string, string> = {};
    if (empId) params['empId'] = empId;
    return firstValueFrom(this.http.get<DynamicGroupRow[]>(LIST_URL, { params }));
  }

  save(payload: DynamicGroupSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  delete(personId: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${DELETE_URL}/${personId}`));
  }
}
