import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

export interface EvsSelfHaeInfo {
  seq?: string;
  evsYear?: string;
  localName?: string;
  postGradeName?: string;
  deptname?: string;
  dateStarted?: string;
  activity?: string;
  evsStartDate?: string;
  evsEndDate?: string;
  localName1?: string;
  localName2?: string;
  affirmC1L0?: string;
  affirmC2L0?: string;
  affirmC1L1?: string;
  affirmC2L1?: string;
  affirmC1L2?: string;
  affirmC2L2?: string;
}

export interface EvsSelfHaeItem {
  seq?: string;
  itemName?: string;
  itemContent?: string;
  itemType?: string;
  itemScore?: string;
  evsScore?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const RESUME_LIST_URL = '/evs/manage/api/resume/evsResumeList';
const SELF_EVS_LEVEL = '14015069';

/**
 * Đánh giá bản thân HAE (viewEvsBySelfHTSV) - self-service, đọc dữ liệu qua
 * API dùng chung với reg-personal-target (personalTarget/objectInfo,
 * personalTarget/itemList), chỉ lưu qua API riêng evsBySelfHAE/save.
 */
@Injectable({ providedIn: 'root' })
export class EvsBySelfHaeService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>(RESUME_LIST_URL, { params: { evsType, evsLevel: SELF_EVS_LEVEL } }));
  }

  getObjectInfo(resumeSeq: string, evsType: string): Promise<EvsSelfHaeInfo> {
    return firstValueFrom(
      this.http.get<EvsSelfHaeInfo>('/evs/manage/api/personalTarget/objectInfo', { params: { resumeSeq, evsType } }),
    );
  }

  getItemList(evsObjectSeq: string): Promise<EvsSelfHaeItem[]> {
    return firstValueFrom(
      this.http.get<EvsSelfHaeItem[]>('/evs/manage/api/personalTarget/itemList', { params: { evsObjectSeq } }),
    );
  }

  save(payload: {
    evsObjectSeq: string;
    flag: '0' | '1';
    affirmContent1: string;
    affirmContent2: string;
    items: { seq: string; evsScore: string }[];
  }): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>('/evs/manage/api/evsBySelfHAE/save', payload));
  }
}
