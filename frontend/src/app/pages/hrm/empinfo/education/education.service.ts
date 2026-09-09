import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EducationRow {
  educNo?: number;
  personId?: string;
  degreeCode?: string;
  finalDegreeWhether?: string;
  degreesCode?: string;
  institutionName?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  schoolLength?: string;
  thesisNameLocal?: string;
  thesisNameEng?: string;
  subjectSecond?: string;
  eduDegNum?: string;
  siteCountry?: string;
  remark?: string;
  place?: string;
  studyExperience?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
}

export interface EducationSavePayload {
  educNo?: number | null;
  personId: string;
  degreeCode?: string;
  finalDegreeWhether?: string;
  degreesCode?: string;
  institutionName: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  schoolLength?: string;
  thesisNameLocal?: string;
  thesisNameEng?: string;
  subjectSecond?: string;
  eduDegNum?: string;
  siteCountry?: string;
  remark?: string;
  place?: string;
  studyExperience?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const BASE_URL = '/hrm/empinfo/api/education';

/**
 * Port lại nguyên vẹn API /hrm/empinfo/api/education đã có sẵn ở
 * HrEmpinfoController (educationSearch.html cũ, đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class EducationService {
  private readonly http = inject(HttpClient);

  search(empId: string, localName: string, institutionName: string): Promise<EducationRow[]> {
    return firstValueFrom(this.http.get<EducationRow[]>(BASE_URL, { params: { empId, localName, institutionName } }));
  }

  getById(educNo: number): Promise<EducationRow> {
    return firstValueFrom(this.http.get<EducationRow>(`${BASE_URL}/${educNo}`));
  }

  save(payload: EducationSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(educNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${BASE_URL}/delete/${educNo}`));
  }
}
