import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduSaveResponse } from '../shared/edu-common.service';
import { EduPersonRow } from '../shared/edu-person-select/edu-person-select.component';

export interface EduBasicInfoRow {
  basicNo?: string;
  planNo?: string;
  trainTypeCode?: string;
  trainTypeCodeName?: string;
  courseNameCode?: string;
  trainFormCode?: string;
  trainFormCodeName?: string;
  trainAddress?: string;
  impleStartDate?: string;
  impleEndDate?: string;
  impleClassHour?: string;
  /** 0 = tháng, 1 = ngày, 2 = giờ */
  impleClassUnit?: string;
  trainContent?: string;
  desDepartment?: string;
  periodTime?: string;
  applyEndDate?: string;
  comTeacherEmpid?: string;
  comTeacherName?: string;
  evaTeacherEmpid?: string;
  evaTeacherName?: string;
  planEmployeeEmpid?: string;
  planEmployeeName?: string;
  actEmployees?: EduPersonRow[];
  freeEmployees?: EduPersonRow[];
  applyEmployees?: EduPersonRow[];
  finalStudents?: EduPersonRow[];
}

export interface EduBasicPlanOption {
  planNo: string;
  trainTypeCodeName?: string;
  courseNumber?: string;
  courseNameCode?: string;
  periodTime?: string;
}

export interface EduBasicQuery {
  courseName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

const BASE = '/edu/api/basicInfo';

/**
 * Thông tin đào tạo cơ bản (EDU_BASIC_INFORMATION) - port từ
 * /edu/traineducation/trainBasicInformation (Hanwha_HTSV).
 */
@Injectable({ providedIn: 'root' })
export class EduTrainBasicInfoService {
  private readonly http = inject(HttpClient);

  getList(query: EduBasicQuery = {}): Promise<EduBasicInfoRow[]> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return firstValueFrom(this.http.get<EduBasicInfoRow[]>(`${BASE}/list`, { params }));
  }

  getDetail(basicNo: string): Promise<EduBasicInfoRow> {
    return firstValueFrom(this.http.get<EduBasicInfoRow>(`${BASE}/detail`, { params: { basicNo } }));
  }

  getPlans(): Promise<EduBasicPlanOption[]> {
    return firstValueFrom(this.http.get<EduBasicPlanOption[]>(`${BASE}/plans`));
  }

  getPlanPrefill(planNo: string): Promise<EduSaveResponse & { data?: EduBasicInfoRow }> {
    return firstValueFrom(this.http.get<EduSaveResponse & { data?: EduBasicInfoRow }>(`${BASE}/planPrefill`, { params: { planNo } }));
  }

  getEmployees(empids: string[]): Promise<EduPersonRow[]> {
    return firstValueFrom(this.http.get<EduPersonRow[]>(`${BASE}/employees`, { params: { empids: empids.join(',') } }));
  }

  getTeachers(empids: string[]): Promise<EduPersonRow[]> {
    return firstValueFrom(this.http.get<EduPersonRow[]>(`${BASE}/teachers`, { params: { empids: empids.join(',') } }));
  }

  add(payload: EduBasicInfoRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/add`, payload));
  }

  update(payload: EduBasicInfoRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/update`, payload));
  }

  delete(basicNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/delete`, null, { params: { basicNo } }));
  }
}
