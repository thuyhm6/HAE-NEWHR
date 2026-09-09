import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface PaPayObjRow {
  payScheduleNo?: string;
  empId?: string;
  empName?: string;
  deptName?: string;
  includeType?: number;
  createdBy?: string;
  createDate?: string;
  updatedBy?: string;
  updateDate?: string;
}

export interface PaPayObjListParams {
  empSearch: string;
  payScheduleNo: string | null;
  includeType: string | null;
  empOffice: string | null;
  draw: number;
  start: number;
  length: number;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const BASE_URL = '/pa/workManagement/api/payObj';

/**
 * Đối tượng nhận lương (viewPaPayObj) - port lại từ
 * pa/workManagement/viewPaPayObj.html (đã xoá). Nút "Xuất Excel" bản gốc trỏ
 * tới endpoint /pa/workManagement/api/payObj/export CHƯA TỪNG được tạo ở
 * backend (bấm vào sẽ lỗi 404) - đã bổ sung PaPayObjService.exportExcel() +
 * controller method còn thiếu (dùng lại mapper.selectList() sẵn có) thay vì
 * chỉ port lại nút bấm không hoạt động.
 */
@Injectable({ providedIn: 'root' })
export class PaPayObjService {
  private readonly http = inject(HttpClient);

  getList(params: PaPayObjListParams): Promise<DataTablesResponse<PaPayObjRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<PaPayObjRow>>(BASE_URL, {
        params: {
          empSearch: params.empSearch,
          payScheduleNo: params.payScheduleNo ?? '',
          includeType: params.includeType ?? '',
          empOffice: params.empOffice ?? '',
          draw: params.draw,
          start: params.start,
          length: params.length,
        },
      }),
    );
  }

  save(dto: { payScheduleNo: string; empId: string; includeType: number }): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  saveList(items: { payScheduleNo: string; empId: string; includeType: number }[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/saveList`, items));
  }

  deleteList(keys: { payScheduleNo: string; empId: string }[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/deleteList`, { body: keys }));
  }

  getEmpOfficeOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo: '15118' } }));
  }

  buildExportUrl(empSearch: string, payScheduleNo: string | null, includeType: string | null, empOffice: string | null): string {
    const params = new URLSearchParams({
      empSearch,
      payScheduleNo: payScheduleNo ?? '',
      includeType: includeType ?? '',
      empOffice: empOffice ?? '',
    });
    return `${BASE_URL}/export?${params.toString()}`;
  }
}
