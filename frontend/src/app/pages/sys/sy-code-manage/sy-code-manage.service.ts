import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyCodeRow {
  codeNo?: string;
  parentCodeNo?: string;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
  orderNo?: number;
  description?: string;
  activity?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/sys/api/code';

/**
 * Quản lý danh mục Code (viewCodeManage) - port lại từ
 * sys/basicMaintenance/viewCodeManage.html (đã xoá). CODE_NO tự sinh từ
 * sequence khi thêm mới (không nhập tay) - xem SyCodeServiceImpl.saveCode().
 * ACTIVITY lưu dạng chuỗi "1"/"0" (không phải số) - khớp đúng kiểu dữ liệu
 * cột SY_CODE.ACTIVITY ở backend.
 */
@Injectable({ providedIn: 'root' })
export class SyCodeManageService {
  private readonly http = inject(HttpClient);

  getTree(): Promise<SyCodeRow[]> {
    return firstValueFrom(this.http.get<SyCodeRow[]>(`${BASE_URL}/tree`));
  }

  getList(parentCodeNo: string): Promise<SyCodeRow[]> {
    return firstValueFrom(this.http.get<SyCodeRow[]>(`${BASE_URL}/list`, { params: { parentCodeNo } }));
  }

  save(dto: SyCodeRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  delete(codeNo: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, null, { params: { codeNo } }));
  }

  readonly exportUrl = `${BASE_URL}/export`;
}
