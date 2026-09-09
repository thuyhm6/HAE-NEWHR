import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyMenuTreeSource {
  menuNo?: string;
  menuParentNo?: string;
  menuCode?: string;
  nameVi?: string;
}

export interface SyRoleRelationDto {
  menuNo: string;
  selectr: string;
  insertr: string;
  updater: string;
  deleter: string;
}

export interface SyRoleRow {
  roleNo?: string;
  roleId?: string;
  cpnyId?: string;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
  sysType?: string;
  orderNo?: number;
  activity?: number;
  roleRelations?: SyRoleRelationDto[];
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/sys/api/role';

/**
 * Quản lý Role + Phân quyền Menu (viewRolesGroup) - port lại từ
 * sys/syRole/viewRolesGroup.html (đã xoá). Khác với SY_ROLE_GROUP (sysType
 * là Integer 0/1), SY_ROLE.sysType là CHUỖI "0"/"1" - đúng theo model gốc
 * (không phải lỗi, chỉ là khác kiểu dữ liệu giữa 2 bảng). Cây menu dùng
 * nz-tree checkable với cascading chuẩn (check cha → tự check hết con, check
 * 1 con → cha hiện indeterminate) thay vì ép check toàn bộ tổ tiên thủ công
 * như bản gốc (cùng lý do đã áp dụng cho pa-supervisor: tránh cấp quyền
 * rộng hơn dự định). Nút "Xuất Excel" bản gốc thực ra xuất .csv - đã sửa
 * thành .xlsx thật.
 */
@Injectable({ providedIn: 'root' })
export class SyRolesGroupService {
  private readonly http = inject(HttpClient);

  getList(keyword: string): Promise<SyRoleRow[]> {
    return firstValueFrom(this.http.get<SyRoleRow[]>(`${BASE_URL}/list`, { params: { keyword } }));
  }

  getDetail(roleNo: string): Promise<SyRoleRow> {
    return firstValueFrom(this.http.get<SyRoleRow>(`${BASE_URL}/detail`, { params: { roleNo } }));
  }

  save(dto: SyRoleRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  saveRelations(roleNo: string, roleRelations: SyRoleRelationDto[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/saveRelations`, { roleNo, roleRelations }));
  }

  delete(roleNo: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, null, { params: { roleNo } }));
  }

  getMenuTree(): Promise<SyMenuTreeSource[]> {
    return firstValueFrom(this.http.get<SyMenuTreeSource[]>('/sys/api/menu/list'));
  }

  readonly exportUrl = `${BASE_URL}/export`;
}
