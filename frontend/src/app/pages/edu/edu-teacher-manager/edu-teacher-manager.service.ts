import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduSaveResponse } from '../shared/edu-common.service';

export interface EduTeacherManagerRow {
  teacherNo?: string;
  empid?: string;
  personId?: string;
  teacherName?: string;
  orgNameLocal?: string;
  postGradeNoName?: string;
  positionNoName?: string;
  teachFieldCode?: string;
  teachFieldCodeName?: string;
  teachLevelCode?: string;
  teachLevelCodeName?: string;
  teachStatusCode?: string;
  teachStatusCodeName?: string;
  hireTime?: string;
  firingTime?: string;
  businessActTime?: string;
  allTime?: string;
  remark?: string;
  /** Chỉ dùng khi thêm mới */
  external?: boolean;
  businessYear?: number | null;
  businessMonth?: number | null;
}

export interface EduTeacherQuery {
  keyword?: string | null;
  teachFieldCode?: string | null;
  teachLevelCode?: string | null;
  teachStatusCode?: string | null;
}

/** Mã lỗi backend khi chưa chọn nhân viên / chưa nhập tên (EduTeacherManagerService.ERR_NO_PERSON). */
export const ETM_ERR_NO_PERSON = 'EDU_TEACHER_MANAGER_NO_PERSON';

const BASE = '/edu/api/teacherManager';

/**
 * Quản lý giảng viên (EDU_TEACHER_MANAGER) - port từ /edu/traineducation/teacherManager (Hanwha_HTSV).
 */
@Injectable({ providedIn: 'root' })
export class EduTeacherManagerService {
  private readonly http = inject(HttpClient);

  getList(query: EduTeacherQuery = {}): Promise<EduTeacherManagerRow[]> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return firstValueFrom(this.http.get<EduTeacherManagerRow[]>(`${BASE}/list`, { params }));
  }

  getDetail(teacherNo: string): Promise<EduTeacherManagerRow> {
    return firstValueFrom(this.http.get<EduTeacherManagerRow>(`${BASE}/detail`, { params: { teacherNo } }));
  }

  add(payload: EduTeacherManagerRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/add`, payload));
  }

  update(payload: EduTeacherManagerRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/update`, payload));
  }

  delete(teacherNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/delete`, null, { params: { teacherNo } }));
  }
}
