import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResume {
  seq?: string;
  evsType?: string;
  resumeName?: string;
  remark?: string;
  evsCycle?: string;
  evsCycleName?: string;
  evsYear?: string;
  evsMonth?: string;
  evsMonthName?: string;
  standardDate?: string;
  evsStartDate?: string;
  evsEndDate?: string;
  activity?: string;
  activityName?: string;
  evsLevel?: string;
  evsLevelName?: string;
  copyObject?: string;
  copyObjectName?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

const BASE_URL = '/evs/manage/api/resume';

/**
 * Danh sách đánh giá (viewResumeList) - port lại từ
 * evs/manage/viewResumeList.html (đã xoá). Trang này là "master" cho toàn
 * bộ module evs/manage - các trang khác đều tham chiếu resumeSeq tạo ra từ
 * đây. `evsType` được truyền qua query param (?evsType=performance/ability)
 * để tái sử dụng cùng 1 trang cho nhiều loại đánh giá khác nhau (giống bản
 * gốc dùng URLSearchParams đọc evsType từ URL tab).
 */
@Injectable({ providedIn: 'root' })
export class ResumeListService {
  private readonly http = inject(HttpClient);

  getList(evsType: string, yearSearch?: string, cycleSearch?: string): Promise<EvsResume[]> {
    return firstValueFrom(
      this.http.get<EvsResume[]>(`${BASE_URL}/list`, { params: { evsType, yearSearch: yearSearch ?? '', cycleSearch: cycleSearch ?? '' } }),
    );
  }

  getOne(seq: string, evsType: string): Promise<EvsResume> {
    return firstValueFrom(this.http.get<EvsResume>(`${BASE_URL}/${encodeURIComponent(seq)}`, { params: { evsType } }));
  }

  getCopyOptions(evsType: string): Promise<EvsResume[]> {
    return firstValueFrom(this.http.get<EvsResume[]>(`${BASE_URL}/evsResumeList`, { params: { evsType } }));
  }

  save(payload: EvsResume): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/save`, payload));
  }

  delete(seq: string, evsType: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/delete`, { seq, evsType }));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    if (!parentCodeNo) return Promise.resolve([]);
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo } }));
  }
}
