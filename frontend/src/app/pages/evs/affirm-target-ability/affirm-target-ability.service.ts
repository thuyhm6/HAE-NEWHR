import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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
  evsScore1?: string;
  evsScore2?: string;
}

export interface AbilitySaveItem {
  itemSeq: string;
  [key: string]: string | null | undefined;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const EVS_PARAM_LIST_URL = '/evs/manage/api/evsParam/list';

/**
 * Dùng chung cho viewAffirmTarget1Ability và viewAffirmTarget2Ability - port
 * đánh giá năng lực (điểm chọn từ dropdown EVS_PARAM thay vì nhập tỷ lệ %
 * như AffirmTargetService). Danh sách đối tượng/phân bổ cấp ĐG dùng lại
 * chung API affirmTarget1/affirmTarget2 (AffirmTargetService) vì backend đã
 * tái sử dụng các endpoint đó cho cả 2 kiểu trang - chỉ itemList/saveDetail/
 * confirmDetail/rejectDetail là khác (hậu tố "Ability").
 */
@Injectable({ providedIn: 'root' })
export class AffirmTargetAbilityService {
  private readonly http = inject(HttpClient);

  getScoreOptions(resumeSeq: string): Promise<EvsScoreOption[]> {
    return firstValueFrom(this.http.get<EvsScoreOption[]>(EVS_PARAM_LIST_URL, { params: { resumeSeq, paramType: 'ITEM' } }));
  }

  getItemList(abilityApiBase: string, evsObjectSeq: string): Promise<AbilityItem[]> {
    return firstValueFrom(this.http.get<AbilityItem[]>(`/evs/manage/api/${abilityApiBase}/itemList`, { params: { evsObjectSeq } }));
  }

  saveDetail(abilityApiBase: string, payload: Record<string, unknown>): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${abilityApiBase}/saveDetail`, payload));
  }

  confirmDetail(abilityApiBase: string, payload: Record<string, unknown>): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${abilityApiBase}/confirmDetail`, payload));
  }

  rejectDetail(abilityApiBase: string, seq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${abilityApiBase}/rejectDetail`, { seq }));
  }
}
