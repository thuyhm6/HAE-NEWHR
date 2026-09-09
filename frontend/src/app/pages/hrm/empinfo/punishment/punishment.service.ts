import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PunishmentRow {
  punishNo?: number;
  personId?: string;
  punishDate?: string;
  punishCode?: string;
  punishReason?: string;
  releaseDate?: string;
  punishDepartment?: string;
  punishScore?: string;
  paycutStartDate?: string;
  paycutEndDate?: string;
  personnelCardInquiry?: string;
  faultTypeCode?: string;
  remarks?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
}

export interface PunishmentSavePayload {
  punishNo?: number | null;
  personId: string;
  punishDate?: string | null;
  punishCode?: string;
  punishReason?: string;
  releaseDate?: string | null;
  punishDepartment?: string;
  punishScore?: string;
  paycutStartDate?: string | null;
  paycutEndDate?: string | null;
  personnelCardInquiry?: string;
  faultTypeCode?: string;
  remarks?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const BASE_URL = '/hrm/empinfo/api/punishment';

/**
 * Port lại nguyên vẹn API /hrm/empinfo/api/punishment đã có sẵn ở
 * HrEmpinfoController (punishmentSearch.html cũ, đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class PunishmentService {
  private readonly http = inject(HttpClient);

  search(empId: string, localName: string, punishCode: string): Promise<PunishmentRow[]> {
    return firstValueFrom(this.http.get<PunishmentRow[]>(BASE_URL, { params: { empId, localName, punishCode } }));
  }

  getById(punishNo: number): Promise<PunishmentRow> {
    return firstValueFrom(this.http.get<PunishmentRow>(`${BASE_URL}/${punishNo}`));
  }

  save(payload: PunishmentSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(punishNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${BASE_URL}/delete/${punishNo}`));
  }
}
