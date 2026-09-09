import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EducationRow {
  educNo?: number;
  personId?: string;
  degreeCode?: string;
  degreeName?: string;
  institutionName?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  degreesCode?: string;
  eduDegNum?: string;
  remark?: string;
}

export interface EducationSaveFields {
  updateEducNo?: number;
  degreeCode: string;
  institutionName?: string;
  startDate?: string;
  endDate?: string;
  subject?: string;
  degreesCode?: string;
  eduDegNum?: string;
  remark?: string;
}

export interface QualificationRow {
  qualNo?: number;
  personId?: string;
  qualName?: string;
  qualLevel?: string;
  dateObtained?: string;
  validityDate?: string;
  qualCardNo?: string;
  qualInstitute?: string;
  qualGrade?: string;
  qualRemark?: string;
}

export interface QualificationSaveFields {
  updateQualNo?: number;
  qualName: string;
  qualLevel?: string;
  dateObtained?: string;
  validityDate?: string;
  qualCardNo?: string;
  qualInstitute?: string;
  qualGrade?: string;
  qualRemark?: string;
}

export interface RewardRow {
  rewardNo?: number;
  rewardType?: string;
  rewardDate?: string;
  rewardCnpy?: string;
  reward?: string;
}

export interface EssFile {
  fileNo?: string;
  applyNo?: string;
  fileName?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

const BASE = '/ess/empinfo/api/qualInfo';
const CODE_LIST_URL = '/sys/api/getCode/list';

/**
 * Trình độ học vấn + Chứng chỉ (CRUD gửi yêu cầu chờ duyệt) và Khen thưởng
 * (chỉ xem) của chính nhân viên đang đăng nhập - port lại từ
 * ess/empinfo/viewQualificationInfo.html (Thymeleaf, đã xoá) sang Angular +
 * NG-ZORRO. Gọi lại nguyên vẹn API JSON sẵn có.
 */
@Injectable({ providedIn: 'root' })
export class EssQualificationInfoService {
  private readonly http = inject(HttpClient);

  getEducation(): Promise<EducationRow[]> {
    return firstValueFrom(this.http.get<EducationRow[]>(`${BASE}/myEducation`));
  }

  getEducationFiles(educNo: number): Promise<EssFile[]> {
    return firstValueFrom(this.http.get<EssFile[]>(`${BASE}/educationFiles/${educNo}`));
  }

  saveEducationApply(fields: EducationSaveFields, files: File[]): Promise<{ message?: string; applyNo?: string }> {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    files.forEach((file) => formData.append('attachFiles', file));
    return firstValueFrom(this.http.post<{ message?: string; applyNo?: string }>(`${BASE}/saveEducationApply`, formData));
  }

  getQualification(): Promise<QualificationRow[]> {
    return firstValueFrom(this.http.get<QualificationRow[]>(`${BASE}/myQualification`));
  }

  getQualificationFiles(qualNo: number): Promise<EssFile[]> {
    return firstValueFrom(this.http.get<EssFile[]>(`${BASE}/qualificationFiles/${qualNo}`));
  }

  saveQualificationApply(fields: QualificationSaveFields, files: File[]): Promise<{ message?: string; applyNo?: string }> {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    files.forEach((file) => formData.append('attachFiles', file));
    return firstValueFrom(
      this.http.post<{ message?: string; applyNo?: string }>(`${BASE}/saveQualificationApply`, formData),
    );
  }

  getReward(): Promise<RewardRow[]> {
    return firstValueFrom(this.http.get<RewardRow[]>(`${BASE}/myReward`));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }
}
