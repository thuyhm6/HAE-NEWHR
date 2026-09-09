import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ExpBatchRegister {
  registerSeq?: string;
  registerDate?: string;
  registerRemark?: string;
  registerCode?: string;
  registerActivity?: string;
}

export interface ExpBatchRow {
  seq?: string;
  empId?: string;
  localName?: string;
  startDate?: string;
  transCode?: string;
  transReason?: string;
  deptno?: string;
  postFamily?: string;
  newPostGradeNo?: string;
  positionNo?: string;
  empTypeCode?: string;
  mainBusiness?: string;
  costCenter?: string;
  remarks?: string;
  activity?: string;
  lineId?: string;
  personId?: string;
  transCodeName?: string;
  transReasonName?: string;
  deptName?: string;
  postFamilyName?: string;
  postGradeName?: string;
  positionNoName?: string;
  empTypeName?: string;
  mainBusinessName?: string;
}

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  allProcessed?: boolean;
  error?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  registerSeq?: string;
  successCount?: number;
}

const BASE_URL = '/hrm/recruitManage/api/expBatch';
const EXECUTE_URL = '/hrm/recruitManage/api/execute';

/**
 * Quyết định hàng loạt (viewExperienceBatchList) - port lại từ
 * hrm/recruitManage/viewExperienceBatchList.html (đã xoá).
 *
 * Bug thật đã phát hiện (có ở bản gốc, không phải do migrate): nút "Xuất
 * Excel" gọi `window.location.href = '.../api/expBatch/export?...'` nhưng
 * endpoint này KHÔNG tồn tại trong HrRecruitManageController (đã grep xác
 * nhận) - bấm nút chỉ điều hướng tới trang 404. Bản Angular thay bằng xuất
 * Excel phía client (SheetJS) dựa trên dữ liệu tải riêng cho mục đích xuất
 * (không dùng lại trang hiện tại vì bảng phân trang server-side).
 */
@Injectable({ providedIn: 'root' })
export class ExperienceBatchListService {
  private readonly http = inject(HttpClient);

  getRegisterList(): Promise<ExpBatchRegister[]> {
    return firstValueFrom(this.http.get<ExpBatchRegister[]>(`${BASE_URL}/registerList`));
  }

  saveRegister(payload: ExpBatchRegister): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/register`, payload));
  }

  getBatchList(registerSeq: string, draw: number, start: number, length: number): Promise<DataTablesResponse<ExpBatchRow>> {
    return firstValueFrom(
      this.http.post<DataTablesResponse<ExpBatchRow>>(`${BASE_URL}/list`, { registerSeq, draw, start, length }),
    );
  }

  updateBatchItem(payload: ExpBatchRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/update`, payload));
  }

  deleteBatchItem(seq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, null, { params: { seq } }));
  }

  importBatchExcel(file: File, registerSeq: string): Promise<ActionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/import`, formData, { params: { registerSeq } }));
  }

  execute(registerSeq: string): Promise<ActionResponse> {
    const params = new URLSearchParams();
    params.set('personIds', registerSeq);
    params.set('type', 'EXP_BATCH');
    return firstValueFrom(this.http.post<ActionResponse>(`${EXECUTE_URL}?${params.toString()}`, null));
  }
}
