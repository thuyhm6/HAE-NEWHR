import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduSaveResponse } from '../shared/edu-common.service';

export interface EduCourseSubjectRow {
  subjectId?: string;
  subjectNo?: string;
  subjectName?: string;
  /** Mã công việc, phân cách dấu phẩy */
  mainBusiness?: string;
  /** Tên công việc, phân cách dấu phẩy */
  mainBusinessName?: string;
}

/** Mã cha danh mục Công việc (MAIN_BUSINESS), giữ nguyên parentNo="14013573" bản gốc. */
export const ECS_MAIN_BUSINESS_PARENT_CODE = '14013573';
/** Mã lỗi backend khi trùng mã môn học (EduCourseSubjectService.ERR_DUPLICATE). */
export const ECS_ERR_DUPLICATE = 'EDU_COURSE_SUBJECT_DUPLICATE';

const BASE = '/edu/api/courseSubjects';

/**
 * Môn học đào tạo (EDU_TRAIN_SUBJECT) - port từ /edu/traineducation/courseSubjects (Hanwha_HAE).
 */
@Injectable({ providedIn: 'root' })
export class EduCourseSubjectsService {
  private readonly http = inject(HttpClient);

  getList(subjectNo?: string | null, subjectName?: string | null, mainBusiness?: string | null): Promise<EduCourseSubjectRow[]> {
    const params: Record<string, string> = {};
    if (subjectNo) params['subjectNo'] = subjectNo;
    if (subjectName) params['subjectName'] = subjectName;
    if (mainBusiness) params['mainBusiness'] = mainBusiness;
    return firstValueFrom(this.http.get<EduCourseSubjectRow[]>(`${BASE}/list`, { params }));
  }

  getDetail(subjectId: string): Promise<EduCourseSubjectRow> {
    return firstValueFrom(this.http.get<EduCourseSubjectRow>(`${BASE}/detail`, { params: { subjectId } }));
  }

  add(payload: EduCourseSubjectRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/add`, payload));
  }

  update(payload: EduCourseSubjectRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/update`, payload));
  }

  delete(subjectId: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/delete`, null, { params: { subjectId } }));
  }
}
