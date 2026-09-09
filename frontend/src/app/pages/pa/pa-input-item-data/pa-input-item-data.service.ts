import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface PaParamItemOption {
  paramNo?: string;
  paramName?: string;
}

export interface PaInputItemDataRow {
  paramDataNo?: number;
  paramNo?: string;
  personId?: string;
  returnValue?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  empOffice?: string;
  startMonth?: string;
  endMonth?: string;
  remark?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

export interface PaInputItemDataListParams {
  paramNo: string;
  payMonth: string;
  empOfficeSearch: string | null;
  deptNos: string;
  empSearch: string;
  draw: number;
  start: number;
  length: number;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: string[];
}

const BASE_URL = '/pa/salary/inputItemData/api';
export const DOWNLOAD_TEMPLATE_URL = '/sy/excel/api/downloadTemplate?templateName=Payroll_Input_Template';

/**
 * Nhập dữ liệu tiêu chuẩn (viewPaInputItemData) - port lại từ
 * pa/salary/viewPaInputItemData.html (đã xoá). Master-detail: hạng mục tiêu
 * chuẩn (trái) + dữ liệu PA_PARAM_DATA theo hạng mục đã chọn (phải, phân
 * trang server-side). Cây phòng ban dùng lại endpoint
 * /pa/wagebase/api/supervisor/authorized-departments (giống bản gốc dùng
 * DeptTree.init với api override) - tái sử dụng hàm buildDeptTree() thuần
 * của EvsAffirmorSetupService thay vì viết lại logic build cây.
 */
@Injectable({ providedIn: 'root' })
export class PaInputItemDataService {
  private readonly http = inject(HttpClient);

  getItemList(itemType: string): Promise<PaParamItemOption[]> {
    return firstValueFrom(this.http.get<PaParamItemOption[]>(`${BASE_URL}/itemList`, { params: { itemType } }));
  }

  getList(params: PaInputItemDataListParams): Promise<DataTablesResponse<PaInputItemDataRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<PaInputItemDataRow>>(`${BASE_URL}/list`, {
        params: {
          paramNo: params.paramNo,
          payMonth: params.payMonth,
          empOfficeSearch: params.empOfficeSearch ?? '',
          deptNos: params.deptNos,
          empSearch: params.empSearch,
          draw: params.draw,
          start: params.start,
          length: params.length,
        },
      }),
    );
  }

  getOne(paramDataNo: number): Promise<PaInputItemDataRow> {
    return firstValueFrom(this.http.get<PaInputItemDataRow>(`${BASE_URL}/${paramDataNo}`));
  }

  insert(dto: PaInputItemDataRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/insert`, dto));
  }

  update(dto: PaInputItemDataRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.put<ActionResponse>(`${BASE_URL}/update`, dto));
  }

  delete(paramDataNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/delete/${paramDataNo}`));
  }

  importExcel(file: File, paramNo: string): Promise<ActionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('paramNo', paramNo);
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/importExcel`, formData));
  }

  getEmpOfficeOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo: '15118' } }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>('/pa/wagebase/api/supervisor/authorized-departments'));
  }
}
