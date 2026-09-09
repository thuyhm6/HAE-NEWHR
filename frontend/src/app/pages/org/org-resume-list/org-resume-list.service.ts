import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  error?: string;
}

export interface OrgResumeRow {
  no: string;
  resumeName?: string | null;
  changeDate?: string | null;
  changeReason?: string | null;
  remark?: string | null;
  activity?: string | null;
  createdBy?: string | null;
  createDate?: string | null;
}

export interface OrgResumeSearchFilter {
  no?: string;
  resumeName?: string;
  changeDateFrom?: string;
  changeDateTo?: string;
  activity?: string;
}

export interface OrgResumeSavePayload {
  no: string;
  resumeName: string;
  changeDate: string;
  changeReason?: string;
  remark?: string;
  activity?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const LIST_URL = '/org/api/resumes';
const RESUME_URL = '/org/api/resume';

/**
 * Danh sách yêu cầu thay đổi tổ chức (viewResumeList) - gọi lại nguyên API JSON đã có sẵn ở
 * OrgResumeInfoController, không đổi backend. Đã sửa /org/resume/export từ xuất .csv (sai định dạng theo
 * CLAUDE.md quy tắc 6) thành .xlsx thật (POI) ngay tại controller - giữ nguyên dùng link tải trực tiếp
 * (exportUrl) thay vì gọi lại toàn bộ danh sách qua JS như 1 số trang khác, vì endpoint export riêng đã
 * có sẵn và đã hoạt động đúng sau khi sửa.
 *
 * 2 giá trị hardcode ở filter "Trạng thái" ("14013948" = Hoạt động, "INACTIVE" = chuỗi literal không phải
 * code hợp lệ trong SY_CODE nên lọc "Không hoạt động" ở bản gốc thực chất không khớp được dòng nào) - giữ
 * nguyên đúng 2 giá trị này để không đổi hành vi lọc đã có, ngoài phạm vi soát xét khi chỉ chuyển giao diện.
 */
@Injectable({ providedIn: 'root' })
export class OrgResumeListService {
  private readonly http = inject(HttpClient);

  getPageList(filter: OrgResumeSearchFilter, draw: number, start: number, length: number): Promise<DataTablesResponse<OrgResumeRow>> {
    const body = { draw, start, length, searchParams: filter };
    return firstValueFrom(this.http.post<DataTablesResponse<OrgResumeRow>>(LIST_URL, body));
  }

  getByNo(no: string): Promise<OrgResumeRow> {
    return firstValueFrom(this.http.get<OrgResumeRow>(`${RESUME_URL}/${no}`));
  }

  add(payload: OrgResumeSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${RESUME_URL}/add`, payload));
  }

  update(payload: OrgResumeSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${RESUME_URL}/update`, payload));
  }

  delete(no: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${RESUME_URL}/delete/${no}`));
  }

  buildExportUrl(filter: OrgResumeSearchFilter): string {
    const params = new URLSearchParams();
    if (filter.no) params.set('no', filter.no);
    if (filter.resumeName) params.set('resumeName', filter.resumeName);
    if (filter.changeDateFrom) params.set('changeDateFrom', filter.changeDateFrom);
    if (filter.changeDateTo) params.set('changeDateTo', filter.changeDateTo);
    if (filter.activity) params.set('activity', filter.activity);
    return `/org/resume/export?${params.toString()}`;
  }
}
