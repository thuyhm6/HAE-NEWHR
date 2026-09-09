import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyLoginUserRow {
  userNo?: string;
  personId?: string;
  cpnyId?: string;
  userName?: string;
  userType?: string;
  activity?: number;
  empName?: string;
  deptName?: string;
  roleGroupNos?: string[];
}

export interface SyRoleGroupOption {
  roleGroupNo?: string;
  roleGroupId?: string;
  nameVi?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/sys/api/user';

/**
 * Quản lý người dùng đăng nhập (viewLoginUser) - port lại từ
 * sys/syRole/viewLoginUser.html (đã xoá). Bản gốc kiểm tra quyền admin
 * ngay trong controller trả view (redirect sang error/403 nếu không phải
 * ADMIN/SYS/HRM) - vì Angular SPA không render template điều kiện theo
 * session phía server, việc bảo vệ dữ liệu vẫn được giữ nguyên đầy đủ ở
 * TỪNG API (list/detail/saveRelations/resetPassword/export đều tự kiểm tra
 * isAdmin() và trả về rỗng/403 cho user không đủ quyền - xem
 * SyUserController) nên không mất tính bảo mật. Nút "Xuất Excel" bản gốc
 * thực ra xuất .csv (content-type text/csv) - đã sửa thành .xlsx thật.
 */
@Injectable({ providedIn: 'root' })
export class SyLoginUserService {
  private readonly http = inject(HttpClient);

  getList(keyword: string): Promise<SyLoginUserRow[]> {
    return firstValueFrom(this.http.get<SyLoginUserRow[]>(`${BASE_URL}/list`, { params: { keyword } }));
  }

  getDetail(userNo: string): Promise<SyLoginUserRow> {
    return firstValueFrom(this.http.get<SyLoginUserRow>(`${BASE_URL}/detail`, { params: { userNo } }));
  }

  saveRelations(userNo: string, roleGroupNos: string[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/saveRelations`, { userNo, roleGroupNos }));
  }

  resetPassword(userNo: string, newPassword: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/resetPassword`, null, { params: { userNo, newPassword } }));
  }

  getAllRoleGroups(): Promise<SyRoleGroupOption[]> {
    return firstValueFrom(this.http.get<SyRoleGroupOption[]>('/sys/api/role_group/list'));
  }

  readonly exportUrl = `${BASE_URL}/export`;
}
