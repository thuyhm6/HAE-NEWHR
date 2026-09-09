import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface PaEmpAccountRow {
  paEmpAccountNo?: number;
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  dateStarted?: string;
  accountType?: number | null;
  accountTypeName?: string;
  accountAddress?: string;
  accountNo?: string;
  accountName?: string;
  securityNo?: string;
  fundNo?: string;
  securityPayDate?: string;
  fundPayDate?: string;
  taxNo?: string;
  activity?: number;
  createDate?: string;
  createdBy?: string;
  updateDate?: string;
  updatedBy?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
}

export interface PaEmpAccountListParams {
  empSearch: string;
  deptNos: string;
  empOfficeSearch: string | null;
  bankSearch: string | null;
  fromDateStarted: string;
  toDateStarted: string;
  draw: number;
  start: number;
  length: number;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/pa/workManagement/api/empAccount';

/**
 * Tài khoản lương nhân viên (viewPaEmpAccount) - port lại từ
 * pa/workManagement/viewPaEmpAccount.html (đã xoá). Ngày vào làm/lọc theo
 * khoảng ngày dùng định dạng YYYY-MM-DD khớp mapper gốc.
 */
@Injectable({ providedIn: 'root' })
export class PaEmpAccountService {
  private readonly http = inject(HttpClient);

  getList(params: PaEmpAccountListParams): Promise<DataTablesResponse<PaEmpAccountRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<PaEmpAccountRow>>(`${BASE_URL}/list`, {
        params: {
          empSearch: params.empSearch,
          deptNos: params.deptNos,
          empOfficeSearch: params.empOfficeSearch ?? '',
          bankSearch: params.bankSearch ?? '',
          fromDateStarted: params.fromDateStarted,
          toDateStarted: params.toDateStarted,
          draw: params.draw,
          start: params.start,
          length: params.length,
        },
      }),
    );
  }

  getOne(paEmpAccountNo: number): Promise<PaEmpAccountRow> {
    return firstValueFrom(this.http.get<PaEmpAccountRow>(`${BASE_URL}/${paEmpAccountNo}`));
  }

  save(dto: PaEmpAccountRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  deleteList(ids: number[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/deleteList`, { body: ids }));
  }

  getBankOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo: '14015883' } }));
  }

  getEmpOfficeOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo: '15118' } }));
  }
}
