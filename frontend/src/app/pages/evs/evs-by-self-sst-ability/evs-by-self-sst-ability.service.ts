import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

export interface EvsSelfAbilityInfo {
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
  affirmContent0?: string;
}

export interface EvsScoreOption {
  evsScore?: string;
  codeName?: string;
}

export interface AbilityItem {
  itemSeq?: string;
  groupName?: string;
  itemName?: string;
  remark?: string;
  itemScore?: string;
  evsScore0?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const RESUME_LIST_URL = '/evs/manage/api/resume/evsResumeList';
const SELF_EVS_LEVEL = '14015069';

/**
 * Đánh giá năng lực bản thân (viewEvsBySelfSSTAbility) - self-service, điểm
 * chọn từ dropdown EVS_PARAM (không phải nhập tỷ lệ % như EvsBySelfHae).
 */
@Injectable({ providedIn: 'root' })
export class EvsBySelfSstAbilityService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>(RESUME_LIST_URL, { params: { evsType, evsLevel: SELF_EVS_LEVEL } }));
  }

  getObjectInfo(resumeSeq: string): Promise<EvsSelfAbilityInfo> {
    return firstValueFrom(this.http.get<EvsSelfAbilityInfo>('/evs/manage/api/personalTarget/objectInfo', { params: { resumeSeq } }));
  }

  getScoreOptions(resumeSeq: string): Promise<EvsScoreOption[]> {
    return firstValueFrom(this.http.get<EvsScoreOption[]>('/evs/manage/api/evsParam/list', { params: { resumeSeq, paramType: 'ITEM' } }));
  }

  getItemList(resumeSeq: string): Promise<AbilityItem[]> {
    return firstValueFrom(this.http.get<AbilityItem[]>('/evs/manage/api/evsBySelfSSTAbility/itemList', { params: { resumeSeq } }));
  }

  save(payload: {
    evsObjectSeq: string;
    resumeSeq: string;
    flag: '0' | '1';
    affirmContent: string;
    items: { itemSeq: string; evsScore0: string | null }[];
  }): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>('/evs/manage/api/evsBySelfSSTAbility/save', payload));
  }
}
