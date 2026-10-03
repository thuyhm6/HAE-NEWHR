import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduFile } from '../shared/edu-common.service';

export interface EduTrainArchiveRow {
  empid?: string;
  localName?: string;
  sexName?: string;
  deptName?: string;
  postGradeName?: string;
  dateStarted?: string;
  courseNameCode?: string;
  periodTime?: string;
  trainContent?: string;
  impleClassHour?: string;
  impleClassUnit?: string;
  impleStartDate?: string;
  impleEndDate?: string;
  departManaName?: string;
  trainAddress?: string;
  evaResult?: string;
  allCost?: string;
  resultNo?: string;
  history?: boolean;
  files?: EduFile[];
}

export interface EduTrainArchiveQuery {
  keyword?: string | null;
  deptNo?: string | null;
  courseName?: string | null;
  /** DD/MM/YYYY */
  startDate?: string | null;
  /** DD/MM/YYYY */
  endDate?: string | null;
  trainContent?: string | null;
}

const BASE = '/edu/api/trainArchives';

/** Hồ sơ đào tạo - port từ /edu/traineducation/trainArchives (Hanwha_HTSV). */
@Injectable({ providedIn: 'root' })
export class EduTrainArchivesService {
  private readonly http = inject(HttpClient);

  private toParams(query: EduTrainArchiveQuery): Record<string, string> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = String(v).trim();
    });
    return params;
  }

  getList(query: EduTrainArchiveQuery): Promise<EduTrainArchiveRow[]> {
    return firstValueFrom(this.http.get<EduTrainArchiveRow[]>(`${BASE}/list`, { params: this.toParams(query) }));
  }

  exportUrl(query: EduTrainArchiveQuery): string {
    const qs = new URLSearchParams(this.toParams(query)).toString();
    return `${BASE}/export${qs ? '?' + qs : ''}`;
  }
}
