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

export type ScheduleType = 'CPNY' | 'DEPT' | 'EMP';

export interface EvsScheduleRow {
  seq?: string;
  resumeSeq?: string;
  scheduleType?: ScheduleType;
  evsType?: string;
  no?: string;
  name?: string;
  deptNo?: string;
  deptName?: string;
  postGradeNo?: string;
  postGradeName?: string;
  evsObject?: string;
  evsStep?: string;
  evsStepName?: string;
  activity?: string;
  deptType?: string;
  orderNo?: string;
  personId?: string;
  startDate?: string;
  endDate?: string;
  updatedBy?: string;
  updateDate?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const EVS_STEP_PARENT = '14015065';

/**
 * Lịch đánh giá (viewEvsSchedulePanel) - port lại từ
 * evs/manage/viewEvsSchedulePanel.html (đã xoá). 3 tab CPNY/DEPT/EMP dùng
 * chung 1 API (scheduleType phân biệt).
 */
@Injectable({ providedIn: 'root' })
export class EvsSchedulePanelService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>('/evs/manage/api/resume/evsResumeList', { params: { evsType } }));
  }

  getEvsStepOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo: EVS_STEP_PARENT } }));
  }

  getList(resumeSeq: string, scheduleType: ScheduleType, evsType: string): Promise<EvsScheduleRow[]> {
    return firstValueFrom(
      this.http.get<EvsScheduleRow[]>('/evs/manage/api/schedule/list', { params: { resumeSeq, scheduleType, evsType } }),
    );
  }

  save(row: EvsScheduleRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>('/evs/manage/api/schedule/save', [row]));
  }

  deleteBatch(seqs: string[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>('/evs/manage/api/schedule/delete', { seqs }));
  }
}
