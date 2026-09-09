import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EmergencyAddressRow {
  emergencyNo?: number;
  personId?: string;
  emerName?: string;
  emerPhone?: string;
  emerPhoneSecond?: string;
  emerEmail?: string;
  mainLiaisonOffice?: string;
  emerAddress?: string;
  emerTypeCode?: string;
  emerTypeName?: string;
  isEmergencyAddress?: string;
  nationality?: string;
  emerCellphone?: string;
  emerWorkPhone?: string;
  mainContactAddress?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
}

export interface EmergencyAddressSavePayload {
  emergencyNo?: number | null;
  personId: string;
  emerName: string;
  emerTypeCode?: string;
  emerPhone?: string;
  emerCellphone?: string;
  emerWorkPhone?: string;
  emerPhoneSecond?: string;
  emerEmail?: string;
  emerAddress?: string;
  nationality?: string;
  mainContactAddress?: string;
  mainLiaisonOffice?: string;
  isEmergencyAddress?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const BASE_URL = '/hrm/empinfo/api/emergency-address';

/**
 * Port lại nguyên vẹn API /hrm/empinfo/api/emergency-address đã có sẵn ở
 * HrEmpinfoController (emergencyAddressSearch.html cũ, đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class EmergencyAddressService {
  private readonly http = inject(HttpClient);

  search(empId: string, localName: string, emerName: string): Promise<EmergencyAddressRow[]> {
    return firstValueFrom(this.http.get<EmergencyAddressRow[]>(BASE_URL, { params: { empId, localName, emerName } }));
  }

  getById(emergencyNo: number): Promise<EmergencyAddressRow> {
    return firstValueFrom(this.http.get<EmergencyAddressRow>(`${BASE_URL}/${emergencyNo}`));
  }

  save(payload: EmergencyAddressSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(emergencyNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${BASE_URL}/delete/${emergencyNo}`));
  }
}
