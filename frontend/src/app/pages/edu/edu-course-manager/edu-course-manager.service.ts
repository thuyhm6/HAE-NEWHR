import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduSaveResponse } from '../shared/edu-common.service';

export interface EduCourseManagerRow {
  courseNo?: string;
  sysmanaNo?: string;
  trainTypeCode?: string;
  trainTypeCodeName?: string;
  trainTypeNo?: string;
  courseNameCode?: string;
  courseNumber?: string;
  remark?: string;
}

export interface EduCourseQuery {
  trainDiffCode?: string | null;
  trainTypeCode?: string | null;
  courseName?: string | null;
}

/** Mã lỗi backend khi trùng tên khóa học (EduCourseManagerService.ERR_DUPLICATE). */
export const ECM_ERR_DUPLICATE = 'EDU_COURSE_MANAGER_DUPLICATE';

const LIST_URL = '/edu/api/courseManager/list';
const DETAIL_URL = '/edu/api/courseManager/detail';
const ADD_URL = '/edu/api/courseManager/add';
const UPDATE_URL = '/edu/api/courseManager/update';

/**
 * Quản lý khóa học (EDU_COURSE_MANAGER) - port từ /edu/traineducation/courseManager (Hanwha_HTSV).
 * Danh sách khóa học còn được dùng làm dropdown ở Kế hoạch đào tạo.
 */
@Injectable({ providedIn: 'root' })
export class EduCourseManagerService {
  private readonly http = inject(HttpClient);

  getList(query: EduCourseQuery = {}): Promise<EduCourseManagerRow[]> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return firstValueFrom(this.http.get<EduCourseManagerRow[]>(LIST_URL, { params }));
  }

  getDetail(courseNo: string): Promise<EduCourseManagerRow> {
    return firstValueFrom(this.http.get<EduCourseManagerRow>(DETAIL_URL, { params: { courseNo } }));
  }

  add(payload: EduCourseManagerRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(ADD_URL, payload));
  }

  update(payload: EduCourseManagerRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(UPDATE_URL, payload));
  }
}
