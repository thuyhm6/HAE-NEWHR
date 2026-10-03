import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduSaveResponse } from '../shared/edu-common.service';

export interface EduPlanManagerRow {
  planNo?: string;
  trainDiffCode?: string;
  trainTypeCode?: string;
  trainTypeCodeName?: string;
  courseNo?: string;
  courseNameCode?: string;
  courseNumber?: string;
  planStartdate?: string;
  planEnddate?: string;
  classHour?: string;
  /** 0 = tháng, 1 = ngày, 2 = giờ */
  classUnit?: string;
  periodTime?: string;
  trainFormCode?: string;
  trainFormCodeName?: string;
  isnotApply?: string;
  desDepartment?: string;
  desEmployee?: string;
  desEmployeeName?: string;
  budget?: string;
  budgetShow?: string;
  departManaCode?: string;
  departManaCodeName?: string;
  teacherName?: string;
  teacherNameEmpid?: string;
  teacherDisplay?: string;
  teacherEmpid?: string;
  trainAddress?: string;
  trainPersonCount?: string;
  trainPersonRemark?: string;
  isnotEvaluate?: string;
  syllabusCount?: number;
}

export interface EduTrainSyllabusRow {
  syllNo: string;
  planNo?: string;
  courseNameCode?: string;
  courseDate?: string;
  courseStartDate?: string;
  courseEndDate?: string;
  detailAddress?: string;
}

export interface EduTeacherOption {
  teacherNo?: string;
  empid?: string;
  teacherName?: string;
  orgNameLocal?: string;
}

export interface EduPlanQuery {
  trainDiffCode?: string | null;
  trainTypeCode?: string | null;
  courseName?: string | null;
}

const BASE = '/edu/api/planManager';
const TEACHER_LIST_URL = '/edu/api/teacherManager/list';
export const EPM_SYLLABUS_TEMPLATE_URL = `${BASE}/syllabus/template`;

/**
 * Kế hoạch đào tạo (EDU_PLAN_MANAGER) + Lịch học (EDU_TRAIN_SYLLABUS) -
 * port từ /edu/traineducation/planManager (Hanwha_HTSV).
 */
@Injectable({ providedIn: 'root' })
export class EduPlanManagerService {
  private readonly http = inject(HttpClient);

  getList(query: EduPlanQuery = {}): Promise<EduPlanManagerRow[]> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return firstValueFrom(this.http.get<EduPlanManagerRow[]>(`${BASE}/list`, { params }));
  }

  getDetail(planNo: string): Promise<EduPlanManagerRow> {
    return firstValueFrom(this.http.get<EduPlanManagerRow>(`${BASE}/detail`, { params: { planNo } }));
  }

  nextPlanNo(): Promise<{ planNo: string }> {
    return firstValueFrom(this.http.get<{ planNo: string }>(`${BASE}/nextPlanNo`));
  }

  add(payload: EduPlanManagerRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/add`, payload));
  }

  update(payload: EduPlanManagerRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/update`, payload));
  }

  delete(planNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/delete`, null, { params: { planNo } }));
  }

  getSyllabus(planNo: string): Promise<EduTrainSyllabusRow[]> {
    return firstValueFrom(this.http.get<EduTrainSyllabusRow[]>(`${BASE}/syllabus`, { params: { planNo } }));
  }

  deleteSyllabus(syllNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/syllabus/delete`, null, { params: { syllNo } }));
  }

  importSyllabus(planNo: string, file: File): Promise<EduSaveResponse> {
    const form = new FormData();
    form.append('file', file, file.name);
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/syllabus/import`, form, { params: { planNo } }));
  }

  /** Giảng viên đang hoạt động (teacherSearch bản gốc) - dùng lại API danh sách Quản lý giảng viên. */
  searchTeachers(keyword: string): Promise<EduTeacherOption[]> {
    const params: Record<string, string> = {};
    if (keyword) params['keyword'] = keyword;
    return firstValueFrom(this.http.get<EduTeacherOption[]>(TEACHER_LIST_URL, { params }));
  }
}
