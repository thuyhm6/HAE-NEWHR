import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AddressRow {
  addressNo?: number;
  personId?: string;
  addressType?: string;
  addressTypeName?: string;
  effectiveStartDate?: string;
  addressContent?: string;
  nationality?: string;
  nationalityName?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
}

export interface AddressSavePayload {
  addressNo?: number | null;
  personId: string;
  addressType: string;
  effectiveStartDate?: string | null;
  addressContent?: string;
  nationality?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const BASE_URL = '/hrm/empinfo/api/address';

/**
 * Port lại nguyên vẹn API /hrm/empinfo/api/address đã có sẵn ở
 * HrEmpinfoController (addressSearch.html cũ, đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);

  search(empId: string, localName: string, addressContent: string): Promise<AddressRow[]> {
    return firstValueFrom(this.http.get<AddressRow[]>(BASE_URL, { params: { empId, localName, addressContent } }));
  }

  getById(addressNo: number): Promise<AddressRow> {
    return firstValueFrom(this.http.get<AddressRow>(`${BASE_URL}/${addressNo}`));
  }

  save(payload: AddressSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(addressNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${BASE_URL}/delete/${addressNo}`));
  }
}
