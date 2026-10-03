import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduFile, EduSaveResponse } from '../shared/edu-common.service';

export interface EduTrainOrganRow {
  organNo?: string;
  organName?: string;
  linkman?: string;
  address?: string;
  officePhone?: string;
  cellphone?: string;
  urlNet?: string;
  mainField?: string;
  workTogether?: string;
  organAbstract?: string;
  files?: EduFile[];
}

const BASE = '/edu/api/trainOrgan';

/**
 * Đơn vị đào tạo (EDU_TRAIN_ORGAN) - port từ /edu/traineducation/trainOrgan (Hanwha_HTSV).
 */
@Injectable({ providedIn: 'root' })
export class EduTrainOrganService {
  private readonly http = inject(HttpClient);

  getList(organName?: string | null, address?: string | null): Promise<EduTrainOrganRow[]> {
    const params: Record<string, string> = {};
    if (organName) params['organName'] = organName;
    if (address) params['address'] = address;
    return firstValueFrom(this.http.get<EduTrainOrganRow[]>(`${BASE}/list`, { params }));
  }

  getDetail(organNo: string): Promise<EduTrainOrganRow> {
    return firstValueFrom(this.http.get<EduTrainOrganRow>(`${BASE}/detail`, { params: { organNo } }));
  }

  add(payload: EduTrainOrganRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/add`, payload));
  }

  update(payload: EduTrainOrganRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/update`, payload));
  }

  delete(organNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/delete`, null, { params: { organNo } }));
  }
}
