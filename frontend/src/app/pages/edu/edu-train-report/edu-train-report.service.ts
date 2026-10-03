import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type EduTrainReportType = 'course' | 'postGrade' | 'dept' | 'year' | 'month' | 'form';

export interface EduTrainReportMenu {
  codeNo: string;
  content?: string;
  reportName?: string;
  urlJsp?: string;
}

export interface EduTrainReportQuery {
  trainDiffCode?: string | null;
  trainTypeCode?: string | null;
  courseName?: string | null;
  postGradeName?: string | null;
  deptNo?: string | null;
  /** YYYY */
  year?: string | null;
  /** MMYYYY */
  month?: string | null;
  trainFormCode?: string | null;
}

export interface EduTrainReportRow {
  groupName?: string;
  trainDiffName?: string;
  trainTypeName?: string;
  courseNameCode?: string;
  trainFormName?: string;
  counts?: number;
  numb?: number;
  avgCounts?: number;
  allTime?: number;
  totalPt?: number;
  avgTime?: number;
  allCost?: number;
  directCost?: number;
  indirectCost?: number;
  avgCost?: number;
}

const BASE = '/edu/api/trainReport';

/** Báo cáo đào tạo - port từ /report/ar/viewTrainReport + /edu/trainreport/* (Hanwha_HTSV). */
@Injectable({ providedIn: 'root' })
export class EduTrainReportService {
  private readonly http = inject(HttpClient);

  private toParams(query: EduTrainReportQuery): Record<string, string> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = String(v).trim();
    });
    return params;
  }

  getMenu(): Promise<EduTrainReportMenu[]> {
    return firstValueFrom(this.http.get<EduTrainReportMenu[]>(`${BASE}/menu`));
  }

  getReport(type: EduTrainReportType, query: EduTrainReportQuery): Promise<EduTrainReportRow[]> {
    return firstValueFrom(this.http.get<EduTrainReportRow[]>(`${BASE}/${type}/list`, { params: this.toParams(query) }));
  }

  exportUrl(type: EduTrainReportType, query: EduTrainReportQuery): string {
    const qs = new URLSearchParams(this.toParams(query)).toString();
    return `${BASE}/${type}/export${qs ? '?' + qs : ''}`;
  }
}
