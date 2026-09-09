import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface RblRegister {
  registerSeq?: string;
  registerDate?: string;
  registerRemark?: string;
  registerActivity?: string;
}

export interface RblRow {
  seq?: string;
  empId?: string;
  vietnamName?: string;
  englishName?: string;
  dob?: string;
  dateStarted?: string;
  endProbationDate?: string;
  joinType?: string;
  joinDetailType?: string;
  deptno?: string;
  postGradeNo?: string;
  mainBusiness?: string;
  postFamily?: string;
  empTypeCode?: string;
  positionNo?: string;
  costCenter?: string;
  finalDegreeCode?: string;
  endDate?: string;
  institutionName?: string;
  subjectName?: string;
  idcardNo?: string;
  idcardSDate?: string;
  issuingAuthority?: string;
  sexcode?: string;
  nationalityCode?: string;
  nationCode?: string;
  maritalStatusCode?: string;
  emailSecond?: string;
  homePhone?: string;
  telephone?: string;
  addressContent?: string;
  regPlace?: string;
  activity?: string;
  lineId?: string;
  personId?: string;
  joinTypeName?: string;
  joinDetailTypeName?: string;
  deptName?: string;
  postGradeName?: string;
  mainBusinessName?: string;
  postFamilyName?: string;
  empTypeName?: string;
  positionNoName?: string;
  finalDegreeName?: string;
  sexName?: string;
  nationalityName?: string;
  nationName?: string;
  maritalStatusName?: string;
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

const BASE_URL = '/hrm/recruitManage/api/rblBatch';
const EXECUTE_URL = '/hrm/recruitManage/api/execute';

/**
 * Nhận việc hàng loạt (viewRecruitBatchList) - port lại từ
 * hrm/recruitManage/viewRecruitBatchList.html (đã xoá).
 *
 * Bug thật đã phát hiện (có ở bản gốc, không phải do migrate): nút "Xuất
 * Excel" gọi `window.location.href = '.../api/rblBatch/export?...'` nhưng
 * endpoint này KHÔNG tồn tại trong HrRecruitManageController (đã grep xác
 * nhận) - bấm nút chỉ điều hướng tới trang 404. Bản Angular thay bằng xuất
 * Excel phía client (SheetJS), giống cách đã xử lý ở
 * experience-batch-list.service.ts.
 */
@Injectable({ providedIn: 'root' })
export class RecruitBatchListService {
  private readonly http = inject(HttpClient);

  getRegisterList(): Promise<RblRegister[]> {
    return firstValueFrom(this.http.get<RblRegister[]>(`${BASE_URL}/registerList`));
  }

  saveRegister(payload: RblRegister): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/register`, payload));
  }

  getBatchList(registerSeq: string, draw: number, start: number, length: number): Promise<DataTablesResponse<RblRow>> {
    return firstValueFrom(this.http.post<DataTablesResponse<RblRow>>(`${BASE_URL}/list`, { registerSeq, draw, start, length }));
  }

  updateBatchItem(payload: RblRow): Promise<ActionResponse> {
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
    params.set('type', 'CONFIRM_BATCH');
    return firstValueFrom(this.http.post<ActionResponse>(`${EXECUTE_URL}?${params.toString()}`, null));
  }
}
