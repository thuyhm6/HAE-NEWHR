import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
  error?: string;
}

export interface ContractRow {
  contractNo?: string;
  personId?: string;
  contractTypeCode?: string;
  contractTypeName?: string;
  startContractDate?: string;
  endContractDate?: string;
  remark?: string;
  workTime?: string;
  createDate?: string;
  orderno?: number;
  activity?: string;
  workPosition?: string;
  workContent?: string;
  salary?: number;
  deptNo?: string;
  positionNo?: string;
  postGradeNo?: string;
  workHourType?: string;
  totalPeriod?: string;
  contractName?: string;
  changeDate?: string;
  contractType?: string;
  totalPeriod08?: string;
  empId?: string;
  localName?: string;
  currentDeptNo?: string;
  position?: string;
}

export interface ContractSearchFilter {
  contractNo?: string;
  empId?: string;
  contractType?: string;
  department?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  activity?: string;
  workPosition?: string;
  salaryFrom?: string;
  salaryTo?: string;
}

export interface ContractSavePayload {
  contractNo: string;
  empId: string;
  contractTypeCode?: string | null;
  startContractDate?: string | null;
  endContractDate?: string | null;
  remark?: string | null;
  workTime?: string | null;
  workPosition?: string | null;
  workContent?: string | null;
  salary?: number | null;
  deptNo?: string | null;
  positionNo?: string | null;
  postGradeNo?: string | null;
  workHourType?: string | null;
  totalPeriod?: string | null;
  contractName: string;
  changeDate?: string | null;
  contractType?: string | null;
  totalPeriod08?: string | null;
  activity: string;
}

export interface ActionResponse {
  message?: string;
  error?: string;
}

const LIST_URL = '/hrm/contractInfo/contracts';
const CONTRACT_URL = '/hrm/contractInfo/api/contract';
const ADD_URL = '/hrm/contractInfo/api/contract/add';
const UPDATE_URL = '/hrm/contractInfo/api/contract/update';
const EXPORT_URL = '/hrm/contractInfo/export';

/**
 * Quản lý Hợp đồng lao động (HR_CONTRACT) - service dùng chung cho cả 3
 * trang hrm/contract/{viewNOContractInfo,viewExpiredContract,
 * viewContractInfoForSearch}.html (đã xoá). Cả 3 trang gọi CHUNG một
 * endpoint `/hrm/contractInfo/contracts` (POST, DataTables server-side,
 * `searchParams` là Map bắt bất kỳ field JSON top-level nào qua
 * `@JsonAnySetter` ở backend) - không có phân biệt lọc "chưa có hợp đồng"
 * hay "sắp hết hạn" ở tầng backend, chỉ khác nhau ở giá trị filter mặc
 * định + tập hành động (CRUD đầy đủ / chỉ Xem+Gia hạn / chỉ Xem) mà mỗi
 * trang Angular tự thiết lập.
 */
@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly http = inject(HttpClient);

  getContracts(filter: ContractSearchFilter, draw: number, start: number, length: number): Promise<DataTablesResponse<ContractRow>> {
    const body = { draw, start, length, ...filter };
    return firstValueFrom(this.http.post<DataTablesResponse<ContractRow>>(LIST_URL, body));
  }

  getContractByNo(contractNo: string): Promise<ContractRow> {
    return firstValueFrom(this.http.get<ContractRow>(`${CONTRACT_URL}/${contractNo}`));
  }

  addContract(payload: ContractSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(ADD_URL, payload));
  }

  updateContract(payload: ContractSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(UPDATE_URL, payload));
  }

  deleteContract(contractNo: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${CONTRACT_URL}/delete/${contractNo}`));
  }

  buildExportUrl(filter: ContractSearchFilter): string {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const qs = params.toString();
    return qs ? `${EXPORT_URL}?${qs}` : EXPORT_URL;
  }
}
