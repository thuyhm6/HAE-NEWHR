import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyCompanyOption {
  cpnyId?: string;
  nameVi?: string;
}

export interface SyMenuTreeSource {
  menuNo?: string;
  menuParentNo?: string;
  menuCode?: string;
  nameVi?: string;
  menuImg?: string;
}

export interface SyMenuParamRow {
  menuNo?: string;
  menuCode?: string;
  nameVi?: string;
  nameEn?: string;
  assigned?: boolean;
  paramOrderNo?: number;
  paramActivity?: number;
  isCanBeBuild?: string;
}

export interface SyMenuParamSavePayload {
  cpnyId: string;
  menuNo: string;
  paramActivity: number;
  paramOrderNo: number;
  isCanBeBuild?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/sys/api/menu_param';

/**
 * Quản lý tham số Menu theo công ty (viewMenuParamList) - port lại từ
 * sys/menu/viewMenuParamList.html (đã xoá). PARAM_ACTIVITY ở
 * đây là số nguyên 1/0 (khác quy ước chuỗi của SY_CODE_PARAM). Endpoint
 * "save" đóng vai trò upsert (thêm mới khi gán menu, cập nhật khi sửa
 * thứ tự/trạng thái) - không có endpoint "update" riêng như code_param.
 * Bản gốc có endpoint export thực ra xuất .csv (content-type
 * octet-stream) dù tên hàm exportExcel - đã sửa thành .xlsx thật.
 */
@Injectable({ providedIn: 'root' })
export class SyMenuParamService {
  private readonly http = inject(HttpClient);

  getCompanyList(): Promise<SyCompanyOption[]> {
    return firstValueFrom(this.http.get<SyCompanyOption[]>('/sys/api/company/list'));
  }

  getMenuTree(): Promise<SyMenuTreeSource[]> {
    return firstValueFrom(this.http.get<SyMenuTreeSource[]>('/sys/api/menu/list'));
  }

  getList(parentMenuNo: string, cpnyId: string): Promise<SyMenuParamRow[]> {
    return firstValueFrom(this.http.get<SyMenuParamRow[]>(`${BASE_URL}/list`, { params: { parentMenuNo, cpnyId } }));
  }

  save(payload: SyMenuParamSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(menuNo: string, cpnyId: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, { menuNo, cpnyId }));
  }

  buildExportUrl(cpnyId: string, parentMenuNo: string): string {
    const params = new URLSearchParams({ cpnyId, parentMenuNo });
    return `${BASE_URL}/export?${params.toString()}`;
  }
}
