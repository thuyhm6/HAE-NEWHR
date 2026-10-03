import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyMenuRow {
  menuNo?: string;
  menuParentNo?: string;
  menuCode?: string;
  menuImg?: string;
  depth?: number;
  menuUrl?: string;
  orderNo?: number;
  activity?: number;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
  parentMenuName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/sys/api/menu';

/**
 * Quản lý Menu hệ thống (viewMenuList) - port lại từ
 * sys/menu/viewMenuList.html (đã xoá). ACTIVITY ở đây là số
 * nguyên 1/0 (khác quy ước chuỗi "1"/"0" của SY_CODE/HR_COMPANY) - khớp
 * đúng kiểu Integer của SyMenu model. Nút "Xuất Excel" bản gốc thực ra xuất
 * .csv (Content-Disposition filename=MenuList.csv, content-type
 * octet-stream) - đã sửa thành .xlsx thật (Apache POI).
 */
@Injectable({ providedIn: 'root' })
export class SyMenuListService {
  private readonly http = inject(HttpClient);

  getList(keyword: string): Promise<SyMenuRow[]> {
    return firstValueFrom(this.http.get<SyMenuRow[]>(`${BASE_URL}/list`, { params: { keyword } }));
  }

  save(dto: SyMenuRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  delete(menuNo: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, null, { params: { menuNo } }));
  }

  readonly exportUrl = `${BASE_URL}/export`;
}
