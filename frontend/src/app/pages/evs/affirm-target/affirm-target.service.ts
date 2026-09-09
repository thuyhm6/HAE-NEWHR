import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

export interface AffirmTargetRow {
  seq?: string;
  empid?: string;
  localName?: string;
  deptname?: string;
  postGradeName?: string;
  objectType?: string;
  objectTypeName?: string;
  dateStarted?: string;
  activity?: string;
  activityName?: string;
  evsPoint0?: string;
  evsGrade0?: string;
  evsPoint1?: string;
  evsGrade1?: string;
  evsPoint2?: string;
  evsGrade2?: string;
}

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface AffirmTargetDetail {
  seq?: string;
  evsYear?: string;
  localName?: string;
  postGradeName?: string;
  deptname?: string;
  dateStarted?: string;
  evsStartDate?: string;
  evsEndDate?: string;
  localName1?: string;
  localName2?: string;
  activity?: string;
  affirmContent0?: string;
  affirmContent1?: string;
  affirmContent2?: string;
  evsPoint0?: string;
  evsGrade0?: string;
  evsPoint1?: string;
  evsGrade1?: string;
  evsPoint2?: string;
  evsGrade2?: string;
}

export interface AffirmTargetItem {
  seq?: string;
  itemName?: string;
  itemContent?: string;
  itemType?: string;
  itemScore?: string;
  evsScore?: string;
  evsScore1?: string;
  evsScore2?: string;
}

export interface EvsGradeOption {
  evsGrade?: string;
  evsGradeName?: string;
  startScore?: string;
  endScore?: string;
}

export interface AffirmTargetSaveItem {
  seq: string;
  evsPoint?: string;
  evsGrade?: string;
  affirmContent?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const RESUME_LIST_URL = '/evs/manage/api/resume/evsResumeList';
const GRADE_LIST_URL = '/evs/manage/api/evsGrade/list';

/**
 * Dùng chung cho viewAffirmTarget1 và viewAffirmTarget2 (đã xoá) - port đánh
 * giá lần 1/lần 2 phía người đánh giá. 2 trang legacy có cấu trúc gần như
 * giống hệt nhau (khác biệt: viewAffirmTarget2 có thêm cột/khối readonly
 * "Lần 1" bên cạnh "Bản thân" trước khối nhập "Lần 2"), nên gộp thành 1
 * component cấu hình qua route data - xem AffirmTargetConfig trong
 * affirm-target.component.ts.
 */
@Injectable({ providedIn: 'root' })
export class AffirmTargetService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string, evsLevel: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>(RESUME_LIST_URL, { params: { evsType, evsLevel } }));
  }

  getGradeList(resumeSeq: string, evsType: string): Promise<EvsGradeOption[]> {
    return firstValueFrom(this.http.get<EvsGradeOption[]>(GRADE_LIST_URL, { params: { resumeSeq, evsType } }));
  }

  getStandardRate(apiBase: string, resumeSeq: string): Promise<Record<string, unknown>> {
    return firstValueFrom(this.http.get<Record<string, unknown>>(`/evs/manage/api/${apiBase}/standardRate`, { params: { resumeSeq } }));
  }

  getGradeSummary(apiBase: string, resumeSeq: string): Promise<Record<string, unknown>[]> {
    return firstValueFrom(this.http.get<Record<string, unknown>[]>(`/evs/manage/api/${apiBase}/gradeSummary`, { params: { resumeSeq } }));
  }

  getObjectList(
    apiBase: string,
    resumeSeq: string,
    evsType: string,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<AffirmTargetRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<AffirmTargetRow>>(`/evs/manage/api/${apiBase}/objectList`, {
        params: { resumeSeq, evsType, draw, start, length },
      }),
    );
  }

  saveBatch(apiBase: string, resumeSeq: string, items: AffirmTargetSaveItem[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${apiBase}/save`, { resumeSeq, items }));
  }

  execute(apiBase: string, resumeSeq: string, items: AffirmTargetSaveItem[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${apiBase}/execute`, { resumeSeq, items }));
  }

  getObjectInfo(apiBase: string, evsObjectSeq: string): Promise<AffirmTargetDetail> {
    return firstValueFrom(this.http.get<AffirmTargetDetail>(`/evs/manage/api/${apiBase}/objectInfo`, { params: { evsObjectSeq } }));
  }

  getItemList(apiBase: string, evsObjectSeq: string): Promise<AffirmTargetItem[]> {
    return firstValueFrom(this.http.get<AffirmTargetItem[]>(`/evs/manage/api/${apiBase}/itemList`, { params: { evsObjectSeq } }));
  }

  saveDetail(apiBase: string, payload: Record<string, unknown>): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${apiBase}/saveDetail`, payload));
  }

  confirmDetail(apiBase: string, payload: Record<string, unknown>): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${apiBase}/confirmDetail`, payload));
  }

  rejectDetail(apiBase: string, seq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${apiBase}/rejectDetail`, { seq }));
  }
}
