import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyRoleGroupRow {
  roleGroupNo?: string;
  roleGroupId?: string;
  cpnyId?: string;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
  sysType?: number;
  joinDefault?: number;
  orderNo?: number;
  activity?: number;
  roleNos?: string[];
}

export interface SyRoleOption {
  roleNo?: string;
  roleId?: string;
  nameVi?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/sys/api/role_group';

/**
 * Danh sách Nhóm quyền (viewSyRolesGroupList) - port lại từ
 * sys/syRole/viewSyRolesGroupList.html (đã xoá). ROLE_GROUP_ID tự sinh từ
 * sequence khi thêm mới, trùng với ROLE_GROUP_NO (xem
 * SyRoleGroupServiceImpl.save()). Nút "Xuất Excel" bản gốc thực ra xuất
 * .csv (content-type octet-stream) - đã sửa thành .xlsx thật.
 */
@Injectable({ providedIn: 'root' })
export class SyRoleGroupListService {
  private readonly http = inject(HttpClient);

  getList(keyword: string): Promise<SyRoleGroupRow[]> {
    return firstValueFrom(this.http.get<SyRoleGroupRow[]>(`${BASE_URL}/list`, { params: { keyword } }));
  }

  getDetail(roleGroupNo: string): Promise<SyRoleGroupRow> {
    return firstValueFrom(this.http.get<SyRoleGroupRow>(`${BASE_URL}/detail`, { params: { roleGroupNo } }));
  }

  save(dto: SyRoleGroupRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  saveRelations(roleGroupNo: string, roleNos: string[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/saveRelations`, { roleGroupNo, roleNos }));
  }

  delete(roleGroupId: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, null, { params: { roleGroupId } }));
  }

  getAllRoles(): Promise<SyRoleOption[]> {
    return firstValueFrom(this.http.get<SyRoleOption[]>('/sys/api/role/list'));
  }

  readonly exportUrl = `${BASE_URL}/export`;
}
