import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsScore {
  seq?: string;
  resumeSeq?: string;
  scoreType?: string;
  no?: string;
  name?: string;
  deptNo?: string;
  deptName?: string;
  postGradeNo?: string;
  postGradeName?: string;
  a?: string | number;
  b?: string | number;
  c?: string | number;
  d?: string | number;
  e?: string | number;
  sum?: string | number;
  activity?: string;
  createDate?: string;
  createdBy?: string;
  updateDate?: string;
  updatedBy?: string;
}

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

const BASE_URL = '/evs/manage/api/evsScore';

/**
 * Tỷ lệ phân bổ (viewEvsDistributionRatePanel) - port lại từ
 * evs/manage/viewEvsDistributionRatePanel.html (đã xoá). `evsType` truyền
 * qua query param dùng để tải danh sách "Tên đánh giá" (resumeSeq) giống
 * resume-list.service.ts.
 */
@Injectable({ providedIn: 'root' })
export class EvsDistributionRatePanelService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>('/evs/manage/api/resume/evsResumeList', { params: { evsType } }));
  }

  getList(resumeSeq: string, scoreType?: string, activity?: string, evsType?: string): Promise<EvsScore[]> {
    return firstValueFrom(
      this.http.get<EvsScore[]>(`${BASE_URL}/list`, {
        params: { resumeSeq, scoreType: scoreType ?? '', activity: activity ?? '', evsType: evsType ?? '' },
      }),
    );
  }

  getOne(seq: string): Promise<EvsScore> {
    return firstValueFrom(this.http.get<EvsScore>(`${BASE_URL}/${encodeURIComponent(seq)}`));
  }

  save(payload: EvsScore): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/save`, payload));
  }

  delete(seq: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/delete`, { seq }));
  }
}
