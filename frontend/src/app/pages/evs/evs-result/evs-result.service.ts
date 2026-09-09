import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
}

export interface EvsGradeOption {
  value: string;
  text: string;
}

export interface EvsResultRow {
  seq?: string;
  localName?: string;
  empid?: string;
  deptname?: string;
  postGradeName?: string;
  dateStarted?: string;
  activityName?: string;
  affirmFlagName0?: string;
  affirmFlagName1?: string;
  affirmFlagName2?: string;
  evsPoint0?: string;
  evsPoint1?: string;
  evsPoint2?: string;
  evsGrade0?: string;
  evsGrade1?: string;
  evsGrade2?: string;
  localName1?: string;
  localName2?: string;
  postGradeName1?: string;
  postGradeName2?: string;
  finalGrade?: string;
  finalAffirmContent?: string;
  updatedBy?: string;
  updateDate?: string;
}

export interface EvsResultListParams {
  resumeSeq: string;
  deptNos?: string;
  personId?: string;
  statusFilter?: string;
  evsType?: string;
}

export interface EvsResultSaveItem {
  seq: string;
  finalGrade: string;
  finalAffirmContent: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const EVS_GRADE_PARENT = '14015161';
const STATUS_PARENT = '14015351';

/**
 * Kết quả đánh giá (viewEvsResult) - port lại từ evs/manage/viewEvsResult.html
 * (đã xoá). Trang tổng hợp kết quả đánh giá + thiết lập cấp đánh giá cuối
 * (nhân sự). 2 modal xem chi tiết (performance/ability) dùng lại đúng các
 * API/interface đã có ở AffirmTargetService/AffirmTargetAbilityService (xem
 * ghi chú trong evs-result.component.ts) - không viết lại logic fetch.
 */
@Injectable({ providedIn: 'root' })
export class EvsResultService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>('/evs/manage/api/resume/evsResumeList', { params: { evsType } }));
  }

  async getGradeOptions(): Promise<EvsGradeOption[]> {
    const codes = await firstValueFrom(
      this.http.get<{ codeName?: string; description?: string }[]>('/sys/api/getCode/list', { params: { parentCodeNo: EVS_GRADE_PARENT } }),
    );
    return (codes || []).map((c) => ({ value: c.codeName || '', text: c.description || c.codeName || '' }));
  }

  getStatusOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo: STATUS_PARENT } }));
  }

  getList(params: EvsResultListParams): Promise<EvsResultRow[]> {
    return firstValueFrom(this.http.get<EvsResultRow[]>('/evs/manage/api/evsResult/list', { params: { ...params } }));
  }

  getStdRate(resumeSeq: string): Promise<Record<string, unknown>> {
    return firstValueFrom(this.http.get<Record<string, unknown>>('/evs/manage/api/evsResult/stdRate', { params: { resumeSeq } }));
  }

  evaluateEnd(resumeSeq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>('/evs/manage/api/evsResult/evaluateEnd', { resumeSeq }));
  }

  changeStatus(seqList: string[], status: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>('/evs/manage/api/evsResult/changeStatus', { seqList, status }));
  }

  copyGrade(resumeSeq: string, seqList: string[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>('/evs/manage/api/evsResult/copyGrade', { resumeSeq, seqList }));
  }

  save(items: EvsResultSaveItem[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>('/evs/manage/api/evsResult/save', items));
  }
}
