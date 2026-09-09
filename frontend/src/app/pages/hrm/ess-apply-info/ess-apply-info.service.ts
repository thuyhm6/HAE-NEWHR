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

export interface ApplyListRow {
  applyNo?: string;
  applyTableType?: string;
  personId?: string;
  createDate?: string;
  activity?: number;
  applyType?: number;
  empName?: string;
  empCode?: string;
  deptName?: string;
}

export interface ApplyListFilter {
  fromDate?: string;
  toDate?: string;
  activitySearch?: string;
  keyword?: string;
}

export interface ApplyFileRow {
  fileNo?: string;
  fileName?: string;
}

export interface ApplyDetailResponse {
  success: boolean;
  applyData?: Record<string, unknown>;
  originalData?: Record<string, unknown> | null;
  files?: ApplyFileRow[];
  message?: string;
}

export interface ActionResponse {
  success: boolean;
  message?: string;
}

const LIST_URL = '/hrm/approve/api/applyList';
const DETAIL_URL = '/hrm/approve/api/applyDetail';
const APPROVE_URL = '/hrm/approve/api/approve';
const REJECT_URL = '/hrm/approve/api/reject';

/**
 * Phê duyệt thay đổi thông tin cá nhân nhân viên (ESS self-service apply) -
 * port lại từ hrm/approve/viewEssApplyInfo.html (đã xoá). Split panel:
 * danh sách yêu cầu (server-side paging, DataTablesResponse) bên trái +
 * chi tiết so sánh dữ liệu mới/gốc bên phải.
 */
@Injectable({ providedIn: 'root' })
export class EssApplyInfoService {
  private readonly http = inject(HttpClient);

  getApplyList(filter: ApplyListFilter, draw: number, start: number, length: number): Promise<DataTablesResponse<ApplyListRow>> {
    const params: Record<string, string> = {
      draw: String(draw),
      start: String(start),
      length: String(length),
    };
    if (filter.fromDate) params['fromDate'] = filter.fromDate;
    if (filter.toDate) params['toDate'] = filter.toDate;
    if (filter.activitySearch) params['activitySearch'] = filter.activitySearch;
    if (filter.keyword) params['keyword'] = filter.keyword;
    return firstValueFrom(this.http.get<DataTablesResponse<ApplyListRow>>(LIST_URL, { params }));
  }

  getApplyDetail(applyNo: string, applyTableType: string): Promise<ApplyDetailResponse> {
    return firstValueFrom(this.http.get<ApplyDetailResponse>(DETAIL_URL, { params: { applyNo, applyTableType } }));
  }

  approve(applyNo: string, applyTableType: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(APPROVE_URL, null, { params: { applyNo, applyTableType } }));
  }

  reject(applyNo: string, applyTableType: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(REJECT_URL, null, { params: { applyNo, applyTableType } }));
  }
}
