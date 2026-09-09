import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface FamilyRow {
  familyNo?: number;
  personId?: string;
  famTypeCode?: string;
  famTypeName?: string;
  famName?: string;
  famBorndate?: string;
  famIdcard?: string;
  famPhone?: string;
  famCompanyName?: string;
  liveYn?: string;
  emergencyContactYn?: string;
  famAddress?: string;
  taxYn?: string;
  gender?: string;
  genderName?: string;
  famEmail?: string;
  ocupation?: string;
  remarks?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
}

export interface FamilySavePayload {
  familyNo?: number | null;
  personId: string;
  famName: string;
  famTypeCode: string;
  famBorndate?: string | null;
  famIdcard?: string;
  gender?: string;
  famPhone?: string;
  famEmail?: string;
  ocupation?: string;
  famCompanyName?: string;
  famAddress?: string;
  liveYn?: string;
  emergencyContactYn?: string;
  taxYn?: string;
  remarks?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const BASE_URL = '/hrm/empinfo/api/family';

/**
 * Port lại nguyên vẹn API /hrm/empinfo/api/family đã có sẵn ở
 * HrEmpinfoController (familySearch.html cũ, đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class FamilyService {
  private readonly http = inject(HttpClient);

  search(empId: string, localName: string, famName: string): Promise<FamilyRow[]> {
    return firstValueFrom(this.http.get<FamilyRow[]>(BASE_URL, { params: { empId, localName, famName } }));
  }

  getById(familyNo: number): Promise<FamilyRow> {
    return firstValueFrom(this.http.get<FamilyRow>(`${BASE_URL}/${familyNo}`));
  }

  save(payload: FamilySavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(familyNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${BASE_URL}/delete/${familyNo}`));
  }
}
