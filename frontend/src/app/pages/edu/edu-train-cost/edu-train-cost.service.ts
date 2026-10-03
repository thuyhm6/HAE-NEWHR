import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduFile, EduSaveResponse } from '../shared/edu-common.service';

export interface EduTrainCostRow {
  costNo?: string;
  basicNo?: string;
  trainTypeCodeName?: string;
  courseNameCode?: string;
  periodTime?: string;
  impleStartDate?: string;
  impleEndDate?: string;
  budget?: string;
  allCost?: number;
  avgCost?: number;
  totalCount?: number;
  teacherCost?: number | null;
  materialCost?: number | null;
  fieldCost?: number | null;
  foodCost?: number | null;
  stayCost?: number | null;
  trafficCost?: number | null;
  visaCost?: number | null;
  otherCost?: number | null;
  remark?: string;
  files?: EduFile[];
}

export interface EduTrainCostQuery {
  courseName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

/** Chi phí trực tiếp / gián tiếp chỉ hiển thị cho công ty HAE (giữ nguyên c:if CPNY_ID=='HAE' bản gốc). */
export const ETCM_DIRECT_COST_CPNY = 'HAE';

const BASE = '/edu/api/trainCost';

/**
 * Chi phí đào tạo (EDU_COST_MANAGER) - port từ /edu/traineducation/trainCostManager (Hanwha_HTSV).
 */
@Injectable({ providedIn: 'root' })
export class EduTrainCostService {
  private readonly http = inject(HttpClient);

  private toParams(query: EduTrainCostQuery): Record<string, string> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return params;
  }

  getList(query: EduTrainCostQuery = {}): Promise<EduTrainCostRow[]> {
    return firstValueFrom(this.http.get<EduTrainCostRow[]>(`${BASE}/list`, { params: this.toParams(query) }));
  }

  getDetail(costNo: string): Promise<EduTrainCostRow> {
    return firstValueFrom(this.http.get<EduTrainCostRow>(`${BASE}/detail`, { params: { costNo } }));
  }

  update(payload: EduTrainCostRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/update`, payload));
  }

  delete(costNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/delete`, null, { params: { costNo } }));
  }

  exportUrl(query: EduTrainCostQuery): string {
    const qs = new URLSearchParams(this.toParams(query)).toString();
    return `${BASE}/export${qs ? '?' + qs : ''}`;
  }

  exportDetailUrl(costNo: string): string {
    return `${BASE}/exportDetail?costNo=${encodeURIComponent(costNo)}`;
  }
}
