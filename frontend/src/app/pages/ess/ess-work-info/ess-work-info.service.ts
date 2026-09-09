import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface InsideExperienceRow {
  personId?: string;
  startDate?: string;
  deptName?: string;
  mainBusiness?: string;
  postGrade?: string;
  transCode?: string;
}

export interface WorkExperienceRow {
  workExpNo?: number;
  personId?: string;
  cpnyName?: string;
  deptName?: string;
  position?: string;
  duty?: string;
  resignReason?: string;
  witness?: string;
  remark?: string;
  startMonth?: string;
  endMonth?: string;
  startDate?: string;
  endDate?: string;
}

export interface WorkExperienceSaveFields {
  updateWorkExperNo?: number;
  cpnyName: string;
  deptName?: string;
  startMonth?: string;
  endMonth?: string;
  position?: string;
  resignReason?: string;
  witness?: string;
  remark?: string;
}

export interface EssFile {
  fileNo?: string;
  applyNo?: string;
  fileName?: string;
}

const BASE = '/ess/empinfo/api/workInfo';

/**
 * Quyết định nhân sự (chỉ xem) + Kinh nghiệm làm việc (CRUD gửi yêu cầu chờ
 * duyệt) của chính nhân viên đang đăng nhập - port lại từ
 * ess/empinfo/viewEssPersonalInfo.html (Thymeleaf, đã xoá) sang Angular +
 * NG-ZORRO. Gọi lại nguyên vẹn API JSON sẵn có.
 */
@Injectable({ providedIn: 'root' })
export class EssWorkInfoService {
  private readonly http = inject(HttpClient);

  getInsideExperience(): Promise<InsideExperienceRow[]> {
    return firstValueFrom(this.http.get<InsideExperienceRow[]>(`${BASE}/myInsideExperience`));
  }

  getWorkExperience(): Promise<WorkExperienceRow[]> {
    return firstValueFrom(this.http.get<WorkExperienceRow[]>(`${BASE}/myWorkExperience`));
  }

  getWorkExperienceFiles(workExpNo: number): Promise<EssFile[]> {
    return firstValueFrom(this.http.get<EssFile[]>(`${BASE}/workExperienceFiles/${workExpNo}`));
  }

  saveWorkExperienceApply(fields: WorkExperienceSaveFields, files: File[]): Promise<{ message?: string; applyNo?: string }> {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    files.forEach((file) => formData.append('attachFiles', file));
    return firstValueFrom(this.http.post<{ message?: string; applyNo?: string }>(`${BASE}/saveWorkExperienceApply`, formData));
  }
}
