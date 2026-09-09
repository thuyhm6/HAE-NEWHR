import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface WorkExperienceRow {
  workExpNo?: number;
  personId?: string;
  cpnyName?: string;
  deptName?: string;
  position?: string;
  duty?: string;
  payYear?: string;
  resignReason?: string;
  startDate?: string;
  endDate?: string;
  remark?: string;
  empId?: string;
  localName?: string;
}

export interface WorkExperienceSavePayload {
  workExpNo?: number | null;
  personId: string;
  cpnyName: string;
  deptName?: string;
  position?: string;
  duty?: string;
  startDate?: string;
  endDate?: string;
  payYear?: string;
  resignReason?: string;
  remark?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const BASE_URL = '/hrm/empinfo/api/work-experience';

/**
 * Port lại nguyên vẹn API /hrm/empinfo/api/work-experience đã có sẵn ở
 * HrEmpinfoController (viewWorkInformation.html cũ, đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class WorkExperienceService {
  private readonly http = inject(HttpClient);

  search(empId: string, localName: string, companyName: string): Promise<WorkExperienceRow[]> {
    return firstValueFrom(this.http.get<WorkExperienceRow[]>(BASE_URL, { params: { empId, localName, companyName } }));
  }

  getById(workExpNo: number): Promise<WorkExperienceRow> {
    return firstValueFrom(this.http.get<WorkExperienceRow>(`${BASE_URL}/${workExpNo}`));
  }

  save(payload: WorkExperienceSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(workExpNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${BASE_URL}/delete/${workExpNo}`));
  }
}
