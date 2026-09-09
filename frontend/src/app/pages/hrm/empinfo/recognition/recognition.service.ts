import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface RewardRow {
  rewardNo?: number;
  personId?: string;
  rewardType?: string;
  rewardDate?: string;
  rewardCnpy?: string;
  reward?: string;
  rewardTypeCode?: string;
  rewardPayDate?: string;
  personnelCardInquiry?: string;
  payAppearIsnot?: string;
  lineId?: string;
  otherType?: string;
  remarks?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
}

export interface RewardSavePayload {
  rewardNo?: number | null;
  personId: string;
  rewardType?: string;
  rewardDate?: string | null;
  rewardCnpy?: string;
  reward?: string;
  rewardTypeCode?: string;
  rewardPayDate?: string | null;
  personnelCardInquiry?: string;
  payAppearIsnot?: string;
  lineId?: string;
  otherType?: string;
  remarks?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const BASE_URL = '/hrm/empinfo/api/reward';

/**
 * Port lại nguyên vẹn API /hrm/empinfo/api/reward đã có sẵn ở
 * HrEmpinfoController (recognitionSearch.html cũ, đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class RecognitionService {
  private readonly http = inject(HttpClient);

  search(empId: string, localName: string, rewardType: string): Promise<RewardRow[]> {
    return firstValueFrom(this.http.get<RewardRow[]>(BASE_URL, { params: { empId, localName, rewardType } }));
  }

  getById(rewardNo: number): Promise<RewardRow> {
    return firstValueFrom(this.http.get<RewardRow>(`${BASE_URL}/${rewardNo}`));
  }

  save(payload: RewardSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(rewardNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${BASE_URL}/delete/${rewardNo}`));
  }
}
