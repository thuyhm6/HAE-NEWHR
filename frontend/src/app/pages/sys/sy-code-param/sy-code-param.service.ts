import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyCompanyOption {
  cpnyId?: string;
  nameVi?: string;
}

export interface SyCodeTreeSource {
  codeNo?: string;
  parentCodeNo?: string;
  nameVi?: string;
}

export interface SyCodeParamRow {
  codeNo?: string;
  parentCodeNo?: string;
  nameVi?: string;
  nameEn?: string;
  assigned?: boolean;
  paramOrderNo?: number;
  paramActivity?: string;
}

export interface SyCodeParamSavePayload {
  cpnyId: string;
  codeNo: string;
  activity: string;
  orderNo: number;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/sys/api/code_param';

/**
 * Quản lý tham số Code theo công ty (viewCodePamers) - port lại từ
 * sys/basicMaintenance/viewCodePamers.html (đã xoá). Bản gốc có endpoint
 * export CHƯA TỪNG được cài đặt (chỉ có comment "Implement export logic
 * later if needed", trả về response rỗng) - đã bổ sung
 * SyCodeParamService.exportExcel() + controller method thật (dùng lại
 * mapper.selectParamByParentAndCompany() sẵn có) thay vì chỉ port lại nút
 * bấm không hoạt động.
 */
@Injectable({ providedIn: 'root' })
export class SyCodeParamService {
  private readonly http = inject(HttpClient);

  getCompanyList(): Promise<SyCompanyOption[]> {
    return firstValueFrom(this.http.get<SyCompanyOption[]>('/sys/api/company/list'));
  }

  getCodeTree(): Promise<SyCodeTreeSource[]> {
    return firstValueFrom(this.http.get<SyCodeTreeSource[]>('/sys/api/code/tree'));
  }

  getList(parentCodeNo: string, cpnyId: string): Promise<SyCodeParamRow[]> {
    return firstValueFrom(this.http.get<SyCodeParamRow[]>(`${BASE_URL}/list`, { params: { parentCodeNo, cpnyId } }));
  }

  save(payload: SyCodeParamSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  update(payload: SyCodeParamSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/update`, payload));
  }

  delete(codeNo: string, cpnyId: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, { codeNo, cpnyId }));
  }

  buildExportUrl(cpnyId: string, parentCode: string): string {
    const params = new URLSearchParams({ cpnyId, parentCode });
    return `${BASE_URL}/export?${params.toString()}`;
  }
}
